const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

const TRUTHY = ['true', '1', 'yes', 'on'];
const FALSY = ['false', '0', 'no', 'off'];

/**
 * Whether lead submissions must pass reCAPTCHA verification.
 *
 * - An explicit RECAPTCHA_ENABLED flag (true/false) always wins.
 * - Otherwise, enforce only in production when a secret key is configured.
 *
 * This keeps reCAPTCHA fully disabled for local/dev API testing (so a token
 * sent by the frontend widget is ignored rather than verified against Google),
 * while preserving production enforcement.
 */
const isRecaptchaEnforced = () => {
  const flag = String(process.env.RECAPTCHA_ENABLED || '').trim().toLowerCase();
  if (TRUTHY.includes(flag)) return true;
  if (FALSY.includes(flag)) return false;
  return process.env.NODE_ENV === 'production' && Boolean(process.env.RECAPTCHA_SECRET_KEY);
};

// Optional server-side hostname allowlist. reCAPTCHA v2 site keys are already
// restricted to specific domains in the Google admin console, so this is
// defense-in-depth and stays OFF unless RECAPTCHA_ALLOWED_HOSTNAMES is set
// (comma-separated), which keeps local testing on localhost frictionless.
const getAllowedHostnames = () =>
  String(process.env.RECAPTCHA_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

/**
 * Verify a reCAPTCHA v2 Checkbox ("I'm not a robot") token with Google.
 *
 * The v2 siteverify response is { success, challenge_ts, hostname, error-codes }.
 * v2 does NOT return a score (that is a v3 concept), so success is decided
 * purely by `success === true` plus the optional hostname allowlist.
 */
const verifyRecaptcha = async (token, remoteIp) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    return { success: true, skipped: true, reason: 'secret_not_configured' };
  }

  if (!token) {
    return { success: false, reason: 'missing_token', errors: ['missing-input-response'] };
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return { success: false, reason: 'service_unavailable', errors: ['http_error'] };
    }

    const data = await response.json();
    const hostname = data.hostname || null;
    const challengeTs = data.challenge_ts || null;

    if (data.success !== true) {
      return {
        success: false,
        reason: 'verification_failed',
        errors: data['error-codes'] || [],
        hostname,
        challengeTs,
      };
    }

    const allowedHostnames = getAllowedHostnames();
    if (allowedHostnames.length && hostname && !allowedHostnames.includes(hostname.toLowerCase())) {
      return {
        success: false,
        reason: 'hostname_mismatch',
        errors: ['hostname-not-allowed'],
        hostname,
        challengeTs,
      };
    }

    return { success: true, hostname, challengeTs, errors: [], reason: null };
  } catch (error) {
    return {
      success: false,
      reason: 'service_unavailable',
      errors: ['request_failed'],
      message: error.message,
    };
  }
};

module.exports = { verifyRecaptcha, isRecaptchaEnforced };
