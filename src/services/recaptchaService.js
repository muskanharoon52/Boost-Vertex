const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

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
    const minimumScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
    const score = typeof data.score === 'number' ? data.score : null;
    const scorePass = score === null ? true : score >= minimumScore;

    return {
      success: data.success === true && scorePass,
      score,
      errors: data['error-codes'] || [],
      reason: data.success === true && scorePass ? null : 'verification_failed',
    };
  } catch (error) {
    return {
      success: false,
      reason: 'service_unavailable',
      errors: ['request_failed'],
      message: error.message,
    };
  }
};

module.exports = { verifyRecaptcha };
