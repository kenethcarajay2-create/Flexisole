
import { Router } from "express";
import geoip from "geoip-lite";
import { isIP } from "node:net";

import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", (req, res) => {
  const ip = req.ip || "";
  const geo = ip ? geoip.lookup(ip) : null;

  const latitude = geo?.ll?.[0];
  const longitude = geo?.ll?.[1];

  const validCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const inPhilippines =
    geo?.country === "PH" &&
    validCoordinates &&
    latitude >= 4 &&
    latitude <= 22 &&
    longitude >= 116 &&
    longitude <= 128;

  return res.json({
    success: true,
    diagnostic: {
      expressDetectedIp: Boolean(ip),
      ipVersion: isIP(ip),
      forwardedIpCount: req.ips.length,
      proxyTrustEnabled: Boolean(
        req.app.get("trust proxy")
      ),
      geoipFound: Boolean(geo),
      detectedCountry: geo?.country || null,
      cityAvailable: Boolean(geo?.city),
      coordinatesAvailable: validCoordinates,
      qualifiesForPhilippinesMap: inPhilippines,
    },
  });
});

export default router;
