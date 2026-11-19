/**
 * Lightweight User-Agent and IP resolution utility for session fingerprinting.
 * Zero external dependencies: fast, synchronous, and non-blocking.
 */

function parseUserAgent(userAgent = "") {
  const ua = userAgent.toLowerCase();

  // ── OS Detection ──
  let os = "Unknown OS";
  if (ua.includes("windows nt 10.0") || ua.includes("windows nt 11.0")) os = "Windows 10/11";
  else if (ua.includes("windows nt 6.3")) os = "Windows 8.1";
  else if (ua.includes("windows nt 6.1")) os = "Windows 7";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("mac os x") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("cros")) os = "ChromeOS";
  else if (ua.includes("linux")) os = "Linux";

  // ── Browser Detection (Order matters due to UA token spoofing) ──
  let browser = "Unknown Browser";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("chrome/") && !ua.includes("chromium")) browser = "Chrome";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "Safari";

  // ── Device Type ──
  let deviceType = "desktop";
  if (ua.includes("mobile") || ua.includes("iphone") || (ua.includes("android") && !ua.includes("tablet"))) {
    deviceType = "mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    deviceType = "tablet";
  }

  const device = `${browser} on ${os}`;

  return {
    device,
    browser,
    os,
    deviceType
  };
}

function parseDeviceInfo(req) {
  const userAgent = req.headers["user-agent"] || "";
  const parsed = parseUserAgent(userAgent);
  // req.ip follows the "trust proxy" setting in app.js (one proxy hop), so it is the address our own proxy
  // saw. Never read X-Forwarded-For directly: its first value is whatever the client chose to send.
  const ip = (req.ip || "").replace(/^::ffff:/, "") || "Unknown IP";

  return {
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    deviceType: parsed.deviceType,
    ip
  };
}

module.exports = {
  parseUserAgent,
  parseDeviceInfo
};


