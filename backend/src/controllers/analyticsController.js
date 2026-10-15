
import geoip from "geoip-lite";

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

function getApproximateLocation(req) {
  try {
    // Express determines the originating IP.
    // The IP itself is never saved to MongoDB.
    const ipAddress = req.ip;

    if (!ipAddress) {
      return null;
    }

    const geo = geoip.lookup(ipAddress);

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

      // Round the estimated coordinates to
      // approximately city / area-level precision.
      lat: Math.round(latitude * 10) / 10,
      lng: Math.round(longitude * 10) / 10,
    };
  } catch (error) {
    console.warn(
      "Visitor location lookup failed:",
      error.message
    );

    return null;
  }
}

// POST /api/analytics/track
export async function trackPageView(req, res, next) {
  try {
    const {
      visitorId,
      sessionId,
      eventId,
      path,
    } = req.body || {};

    if (
      typeof visitorId !== "string" ||
      typeof sessionId !== "string" ||
      typeof eventId !== "string" ||
      !UUID_PATTERN.test(visitorId) ||
      !UUID_PATTERN.test(sessionId) ||
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

    // Only approximately locate the visitor.
    // Browser GPS permission is never requested.
    const location = getApproximateLocation(req);

    const insertFields = {
      visitorId,
      pageViews: 0,
    };

    if (location) {
      insertFields.location = location;
    }

    try {
      await VisitorSession.updateOne(
        { sessionId },
        {
          $setOnInsert: insertFields,
          $set: {
            lastSeenAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      // Handle simultaneous requests attempting
      // to create the same session.
      const session = await VisitorSession.findOne({
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

    // Make sure the session is associated with
    // the visitor making this request.
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

    // If this existing session had no location
    // but one is now available, save it.
    if (
      location &&
      verifiedSession.location?.country !== "PH"
    ) {
      await VisitorSession.updateOne(
        { sessionId, visitorId },
        {
          $set: { location },
        }
      );
    }

    // Event IDs prevent duplicated page views.
    try {
      await PageView.create({
        eventId,
        sessionId,
        path,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.json({
          success: true,
        });
      }

      throw error;
    }

    await VisitorSession.updateOne(
      { sessionId, visitorId },
      {
        $inc: { pageViews: 1 },
      }
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Please retry this analytics event.",
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
        createdAt: { $gte: todayStart },
      }),

      VisitorSession.distinct("visitorId", {
        lastSeenAt: { $gte: activeSince },
      }),

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
            views: { $sum: 1 },
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
      { length: 7 },
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
        uniqueVisitors: uniqueVisitorIds.length,
        totalVisits,
        totalPageViews,
        visitsToday,
        activeVisitors: activeVisitorIds.length,
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
    }

    if (period === "7d") {
      match.createdAt = {
        $gte: new Date(
          todayStart.getTime() - 6 * 86400000
        ),
      };
    }

    if (period === "30d") {
      match.createdAt = {
        $gte: new Date(
          todayStart.getTime() - 29 * 86400000
        ),
      };
    }

    // Group sessions by approximate location.
    // Do not expose IP addresses or visitor IDs.
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

    const totalMappedVisits =
      locations.reduce(
        (total, location) =>
          total + location.visits,
        0
      );

    return res.json({
      success: true,
      country: "PH",
      period,
      locations,
      totalMappedVisits,
    });
  } catch (error) {
    next(error);
  }
}
