const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'api-requests.log');

/**
 * API Request/Response Logger Middleware
 * Logs all API requests with method, path, status, response time, admin user (if applicable)
 * Useful for analytics, debugging, and audit trails
 */
const apiLogger = (req, res, next) => {
  const start = Date.now();

  // Capture the original send function
  const originalSend = res.send;

  // Override res.send to log response details
  res.send = function (data) {
    const duration = Date.now() - start;
    const admin = req.admin ? req.admin.email : 'anonymous';
    const statusCode = res.statusCode;

    // Build log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      admin,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      requestSize: JSON.stringify(req.body).length,
      responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
    };

    // Write to log file
    fs.appendFile(
      logFile,
      JSON.stringify(logEntry) + '\n',
      (err) => {
        if (err) {
          console.error('Failed to write API log:', err);
        }
      }
    );

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Get analytics summary from logs
 * Returns statistics like top endpoints, average response times, error rates
 */
const getAnalyticsSummary = () => {
  try {
    if (!fs.existsSync(logFile)) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        endpoints: [],
        errorRate: 0,
        topAdmins: [],
      };
    }

    const logs = fs
      .readFileSync(logFile, 'utf-8')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));

    // Calculate metrics
    const totalRequests = logs.length;
    const totalDuration = logs.reduce((sum, log) => {
      const ms = parseInt(log.duration);
      return sum + ms;
    }, 0);
    const averageResponseTime = Math.round(totalDuration / totalRequests);

    // Endpoint statistics
    const endpoints = {};
    logs.forEach((log) => {
      const key = `${log.method} ${log.path.split('?')[0]}`;
      if (!endpoints[key]) {
        endpoints[key] = { count: 0, errors: 0, totalTime: 0 };
      }
      endpoints[key].count++;
      if (log.statusCode >= 400) {
        endpoints[key].errors++;
      }
      endpoints[key].totalTime += parseInt(log.duration);
    });

    // Convert to array and sort by count
    const endpointsArray = Object.entries(endpoints)
      .map(([key, value]) => ({
        endpoint: key,
        requestCount: value.count,
        errorCount: value.errors,
        errorRate: ((value.errors / value.count) * 100).toFixed(1) + '%',
        averageTime: Math.round(value.totalTime / value.count) + 'ms',
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    // Error rate
    const errors = logs.filter((log) => log.statusCode >= 400).length;
    const errorRate = ((errors / totalRequests) * 100).toFixed(1);

    // Top admins by request count
    const admins = {};
    logs.forEach((log) => {
      if (log.admin !== 'anonymous') {
        admins[log.admin] = (admins[log.admin] || 0) + 1;
      }
    });

    const topAdmins = Object.entries(admins)
      .map(([email, count]) => ({ email, requestCount: count }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 5);

    return {
      totalRequests,
      averageResponseTime: averageResponseTime + 'ms',
      endpoints: endpointsArray,
      errorRate: errorRate + '%',
      topAdmins,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reading analytics logs:', error);
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      endpoints: [],
      errorRate: 0,
      topAdmins: [],
      error: error.message,
    };
  }
};

module.exports = { apiLogger, getAnalyticsSummary };
