
import { Router } from "express";
import geoip from "geoip-lite";
import { isIP } from "node:net";

import {
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAdmin);

function normalizeIp(value) {
  if (typeof value !== "string") {
    return "";
  }

  let ip = value.trim();

  // Remove IPv4-mapped IPv6 prefix.
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return ip;
}

function isPrivateIp(address) {
  const ip = normalizeIp(address);
  const version = isIP(ip);

  if (version === 4) {
    const parts = ip.split(".").map(Number);

    const [a, b, c] = parts;

    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0 && c === 0) ||
      (a === 192 && b === 0 && c === 2) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      (a >= 240)
    ) {
      return true;
    }

    return false;
  }

  if (version === 6) {
    const lower = ip.toLowerCase();

    return (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    );
  }

  return true;
}

function checkIp(address) {
  const ip = normalizeIp(address);
  const ipVersion = isIP(ip);

  if (!ipVersion) {
    return {
      detected: false,
      ipVersion: 0,
      publiclyRoutable: false,
      geoipFound: false,
      detectedCountry: null,
      cityAvailable: false,
      coordinatesAvailable: false,
      qualifiesForPhilippinesMap: false,
    };
  }

  const publiclyRoutable = !isPrivateIp(ip);

  let geo = null;

  if (publiclyRoutable) {
    geo = geoip.lookup(ip);
  }

  const latitude = geo?.ll?.[0];
  const longitude = geo?.ll?.[1];

  const coordinatesAvailable =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const qualifiesForPhilippinesMap =
    geo?.country === "PH" &&
    coordinatesAvailable &&
    latitude >= 4 &&
    latitude <= 22 &&
    longitude >= 116 &&
    longitude <= 128;

  return {
    detected: true,
    ipVersion,
    publiclyRoutable,
    geoipFound: Boolean(geo),
    detectedCountry: geo?.country || null,
    cityAvailable: Boolean(geo?.city),
    coordinatesAvailable,
    qualifiesForPhilippinesMap,
  };
}

router.get("/", (req, res) => {
  const expressIp = normalizeIp(req.ip);

  const socketIp = normalizeIp(
    req.socket?.remoteAddress
  );

  const forwardedHeader =
    req.get("x-forwarded-for") || "";

  const forwardedAddresses = forwardedHeader
    .split(",")
    .map(normalizeIp)
    .filter(Boolean);

  // For diagnosis only. Do not use untrusted
  // forwarded header values for authentication
  // or rate limiting.
  const firstForwardedIp =
    forwardedAddresses[0] || "";

  const lastForwardedIp =
    forwardedAddresses[
      forwardedAddresses.length - 1
    ] || "";

  return res.json({
    success: true,

    diagnostic: {
      proxyTrustEnabled: Boolean(
        req.app.get("trust proxy")
      ),

      forwardedIpCount:
        forwardedAddresses.length,

      express: checkIp(expressIp),

      firstForwarded: checkIp(
        firstForwardedIp
      ),

      lastForwarded: checkIp(
        lastForwardedIp
      ),

      connection: checkIp(socketIp),

      comparison: {
        expressMatchesFirstForwarded:
          Boolean(expressIp) &&
          expressIp === firstForwardedIp,

        expressMatchesLastForwarded:
          Boolean(expressIp) &&
          expressIp === lastForwardedIp,

        expressMatchesConnection:
          Boolean(expressIp) &&
          expressIp === socketIp,
      },
    },
  });
});

export default router;
