/**
 * Standard API response envelope.
 *
 * Every JSON endpoint responds with a consistent shape:
 *   success: { success: true, message, data, ...extra }
 *   error:   { success: false, message, errors? }
 *
 * `extra` carries sibling metadata that should stay top-level (e.g. `pagination`
 * on list endpoints) so existing consumers reading `body.pagination` keep working.
 * Legacy top-level keys (token, summary, analytics, etc.) are also allowed in
 * `extra` so older frontend code keeps working while the standardized response
 * structure remains the source of truth.
 */

const sendSuccess = (res, { status = 200, message = '', data = null, extra } = {}) =>
  res.status(status).json({ success: true, message, data, ...(extra || {}) });

const sendError = (res, { status = 500, message = 'Internal server error', errors } = {}) =>
  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });

module.exports = { sendSuccess, sendError };
