
import StoreSettings from "../models/StoreSettings.js";

const DEFAULT_LINKS = {
  facebook: "",
  instagram: "",
  tiktok: "",
};

const ALLOWED_HOSTS = {
  facebook: [
    "facebook.com",
    "www.facebook.com",
    "m.facebook.com",
    "fb.com",
    "www.fb.com",
  ],
  instagram: [
    "instagram.com",
    "www.instagram.com",
  ],
  tiktok: [
    "tiktok.com",
    "www.tiktok.com",
    "vm.tiktok.com",
  ],
};

function normalizeSocialUrl(value, platform) {
  if (typeof value !== "string") {
    throw new Error(`${platform} must be a URL.`);
  }

  const trimmed = value.trim();

  // Empty URL means the social icon will be hidden.
  if (!trimmed) {
    return "";
  }

  if (trimmed.length > 500) {
    throw new Error(`${platform} URL is too long.`);
  }

  let url;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `Enter a valid URL for ${platform}.`
    );
  }

  if (url.protocol !== "https:") {
    throw new Error(
      `${platform} URL must start with https://`
    );
  }

  const allowed = ALLOWED_HOSTS[platform] || [];

  if (
    !allowed.includes(url.hostname.toLowerCase()) ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new Error(
      `Enter an official ${platform} website URL.`
    );
  }

  return url.toString();
}

// Public: GET /api/settings
export async function getPublicSettings(req, res, next) {
  try {
    const settings = await StoreSettings.findOne({
      key: "main",
    }).lean();

    return res.status(200).json({
      success: true,
      socialLinks: {
        ...DEFAULT_LINKS,
        ...(settings?.socialLinks || {}),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Admin: GET /api/admin/settings
export async function getAdminSettings(req, res, next) {
  try {
    const settings = await StoreSettings.findOne({
      key: "main",
    }).lean();

    return res.status(200).json({
      success: true,
      socialLinks: {
        ...DEFAULT_LINKS,
        ...(settings?.socialLinks || {}),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Admin: PUT /api/admin/settings
export async function updateAdminSettings(req, res, next) {
  try {
    const incoming = req.body?.socialLinks;

    if (
      !incoming ||
      typeof incoming !== "object" ||
      Array.isArray(incoming)
    ) {
      return res.status(400).json({
        success: false,
        message: "Social media settings are required.",
      });
    }

    const socialLinks = {};

    for (const platform of Object.keys(DEFAULT_LINKS)) {
      try {
        socialLinks[platform] = normalizeSocialUrl(
          incoming[platform],
          platform
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    const settings = await StoreSettings.findOneAndUpdate(
      { key: "main" },
      {
        $set: { socialLinks },
        $setOnInsert: { key: "main" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Social media links updated successfully.",
      socialLinks: {
        ...DEFAULT_LINKS,
        ...settings.toObject().socialLinks,
      },
    });
  } catch (error) {
    next(error);
  }
}
