
import geoip from "geoip-lite";
import { isIP } from "node:net";

import VisitorSession from "../models/VisitorSession.js";
import PageView from "../models/PageView.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_PATH = /^\/[a-zA-Z0-9/_-]*$/;

const PH_BOUNDS = {
  south: 4,
  north: 22,
  west: 116,
  east: 128,
};

function manilaDate(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getTodayStart() {
  return new Date(
    `${manilaDate(new Date())}T00:00:00+08:00`
  );
}

function normalizeIp(value) {
  if (typeof value !== "string") {
    return "";
  }

  let ip = value.trim();

  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return isIP(ip) ? ip : "";
}

function getLocationLookupIp(req) {
  if (process.env.RENDER === "true") {
    const cloudflareIp = normalizeIp(
      req.get("cf-connecting-ip")
    );

    if (cloudflareIp) {
      return cloudflareIp;
    }
  }

  return normalizeIp(req.ip);
}

function getApproximateIpLocation(req) {
  try {
    const ip = getLocationLookupIp(req);

    if (!ip) {
      return null;
    }

    const geo = geoip.lookup(ip);

    if (
      !geo ||
      geo.country !== "PH" ||
      !Array.isArray(geo.ll) ||
      geo.ll.length < 2
    ) {
      return null;
    }

    const latitude = Number(geo.ll[0]);
    const longitude = Number(geo.ll[1]);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < PH_BOUNDS.south ||
      latitude > PH_BOUNDS.north ||
      longitude < PH_BOUNDS.west ||
      longitude > PH_BOUNDS.east
    ) {
      return null;
    }

    return {
      country: "PH",
      city: String(geo.city || "").slice(0, 100),
      region: String(geo.region || "").slice(0, 50),
      lat: Math.round(latitude * 10) / 10,
      lng: Math.round(longitude * 10) / 10,
    };
  } catch (error) {
    console.warn(
      "IP geolocation unavailable:",
      error.message
    );

    return null;
  }
}

function getApproximateGpsLocation(location) {
  if (
    !location ||
    typeof location !== "object" ||
    Array.isArray(location)
  ) {
    return null;
  }

  const { lat, lng } = location;

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  if (
    lat < PH_BOUNDS.south ||
    lat > PH_BOUNDS.north ||
    lng < PH_BOUNDS.west ||
    lng > PH_BOUNDS.east
  ) {
    return null;
  }

  // Always round again on the server.
  // We store approximate coordinates only.
  return {
    country: "PH",
    city: "",
    region: "",
    lat: Math.round(lat * 10) / 10,
    lng: Math.round(lng * 10) / 10,
  };
}

// POST /api/analytics/track
export async function trackPageView(req, res, next) {
  try {
    const {
      visitorId,
      sessionId,
      eventId,
      path,
      locationOnly,
      location,
    } = req.body || {};

    // Both normal page-view events and GPS updates
    // require valid visitor and session identifiers.
    if (
      typeof visitorId !== "string" ||
      typeof sessionId !== "string" ||
      !UUID_PATTERN.test(visitorId) ||
      !UUID_PATTERN.test(sessionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor session.",
      });
    }

    // -----------------------------------------
    // OPTIONAL GPS LOCATION UPDATE
    // -----------------------------------------
    //
    // This request does not create a PageView,
    // create a new visitor session, or increase
    // any analytics counts.
    //
    if (locationOnly === true) {
      const approximateLocation =
        getApproximateGpsLocation(location);

      if (!approximateLocation) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Philippine location coordinates.",
        });
      }

      // Only update an existing session that
      // belongs to the supplied visitorId.
      const updatedSession =
        await VisitorSession.findOneAndUpdate(
          {
            sessionId,
            visitorId,
          },
          {
            $set: {
              location: approximateLocation,
              lastSeenAt: new Date(),
            },
          },
          {
            new: true,
          }
        );

      if (!updatedSession) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor session not found. Refresh the page and try again.",
        });
      }

      return res.json({
        success: true,
        locationSaved: true,
      });
    }

    // -----------------------------------------
    // NORMAL PAGE-VIEW TRACKING
    // -----------------------------------------
    if (
      typeof eventId !== "string" ||
      !UUID_PATTERN.test(eventId) ||
      typeof path !== "string" ||
      path.length > 200 ||
      !VALID_PATH.test(path) ||
      path.startsWith("/admin") ||
      path.startsWith("/api")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid analytics event.",
      });
    }

    const existingSession =
      await VisitorSession.findOne({
        sessionId,
      });

    if (
      existingSession &&
      existingSession.visitorId !== visitorId
    ) {
      return res.status(409).json({
        success: false,
        message: "Invalid visitor session.",
      });
    }

    const ipLocation =
      getApproximateIpLocation(req);

    const insertFields = {
      visitorId,
      pageViews: 0,
    };

    if (ipLocation) {
      insertFields.location = ipLocation;
    }

    try {
      await VisitorSession.updateOne(
        {
          sessionId,
        },
        {
          $setOnInsert: insertFields,
          $set: {
            lastSeenAt: new Date(),
          },
        },
        {
          upsert: true,
        }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      const session =
        await VisitorSession.findOne({
          sessionId,
        });

      if (
        !session ||
        session.visitorId !== visitorId
      ) {
        return res.status(409).json({
          success: false,
          message: "Invalid visitor session.",
        });
      }
    }

    const verifiedSession =
      await VisitorSession.findOne({
        sessionId,
        visitorId,
      });

    if (!verifiedSession) {
      return res.status(409).json({
        success: false,
        message: "Invalid visitor session.",
      });
    }

    // Save IP location only when the session
    // does not already contain a Philippine
    // location. This prevents later page views
    // from overwriting a GPS-shared location.
    if (
      ipLocation &&
      verifiedSession.location?.country !== "PH"
    ) {
      await VisitorSession.updateOne(
        {
          sessionId,
          visitorId,
        },
        {
          $set: {
            location: ipLocation,
          },
        }
      );
    }

    try {
      await PageView.create({
        eventId,
        sessionId,
        path,
      });
    } catch (error) {
      // Duplicate events should not increase
      // the page-view count again.
      if (error.code === 11000) {
        return res.json({
          success: true,
        });
      }

      throw error;
    }

    await VisitorSession.updateOne(
      {
        sessionId,
        visitorId,
      },
      {
        $inc: {
          pageViews: 1,
        },
      }
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Please retry this analytics event.",
      });
    }

    next(error);
  }
}

// GET /api/admin/analytics/overview
export async function getAnalyticsOverview(
  req,
  res,
  next
) {
  try {
    const now = new Date();
    const todayStart = getTodayStart();

    const activeSince = new Date(
      now.getTime() - 5 * 60 * 1000
    );

    const sevenDaysStart = new Date(
      todayStart.getTime() - 6 * 86400000
    );

    const [
      uniqueVisitorIds,
      totalVisits,
      totalPageViews,
      visitsToday,
      activeVisitorIds,
      dailyViews,
    ] = await Promise.all([
      VisitorSession.distinct("visitorId"),

      VisitorSession.countDocuments(),

      PageView.countDocuments(),

      VisitorSession.countDocuments({
        createdAt: {
          $gte: todayStart,
        },
      }),

      VisitorSession.distinct(
        "visitorId",
        {
          lastSeenAt: {
            $gte: activeSince,
          },
        }
      ),

      PageView.aggregate([
        {
          $match: {
            createdAt: {
              $gte: sevenDaysStart,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Manila",
              },
            },
            views: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const dailyMap = new Map(
      dailyViews.map((day) => [
        day._id,
        day.views,
      ])
    );

    const last7Days = Array.from(
      {
        length: 7,
      },
      (_, index) => {
        const date = new Date(
          todayStart.getTime() -
            (6 - index) * 86400000
        );

        const key = manilaDate(date);

        return {
          date: key,
          views: dailyMap.get(key) || 0,
        };
      }
    );

    return res.json({
      success: true,
      overview: {
        uniqueVisitors:
          uniqueVisitorIds.length,
        totalVisits,
        totalPageViews,
        visitsToday,
        activeVisitors:
          activeVisitorIds.length,
      },
      last7Days,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/analytics/locations
export async function getVisitorLocations(
  req,
  res,
  next
) {
  try {
    const period = String(
      req.query.period || "7d"
    );

    if (
      !["today", "7d", "30d", "all"].includes(
        period
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range.",
      });
    }

    const todayStart = getTodayStart();

    const match = {
      "location.country": "PH",

      "location.lat": {
        $gte: PH_BOUNDS.south,
        $lte: PH_BOUNDS.north,
      },

      "location.lng": {
        $gte: PH_BOUNDS.west,
        $lte: PH_BOUNDS.east,
      },
    };

    if (period === "today") {
      match.createdAt = {
        $gte: todayStart,
      };
    } else if (period === "7d") {
      match.createdAt = {
        $gte: new Date(
          todayStart.getTime() -
            6 * 86400000
        ),
      };
    } else if (period === "30d") {
      match.createdAt = {
        $gte: new Date(
          todayStart.getTime() -
            29 * 86400000
        ),
      };
    }

    const locations =
      await VisitorSession.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: {
              lat: "$location.lat",
              lng: "$location.lng",
              city: "$location.city",
              region: "$location.region",
            },
            visitorIds: {
              $addToSet: "$visitorId",
            },
            visits: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            lat: "$_id.lat",
            lng: "$_id.lng",
            city: "$_id.city",
            region: "$_id.region",
            visitors: {
              $size: "$visitorIds",
            },
            visits: 1,
          },
        },
        {
          $sort: {
            visits: -1,
          },
        },
        {
          $limit: 1000,
        },
      ]);

    return res.json({
      success: true,
      country: "PH",
      period,
      locations,
      totalMappedVisits:
        locations.reduce(
          (sum, item) =>
            sum + item.visits,
          0
        ),
    });
  } catch (error) {
    next(error);
  }
}
