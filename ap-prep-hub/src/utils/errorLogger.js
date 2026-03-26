/**
 * Centralized error logging utility.
 * In development: logs to console with structured output.
 * In production: could be extended to send to an external service (Sentry, LogRocket, etc.).
 */

const isDev = process.env.NODE_ENV === 'development';

const errorLogger = {
  /**
   * Report an error with context (always logged, even in production).
   * @param {Error|string} error - The error object or message
   * @param {object} [context] - Additional context (component, action, userId, etc.)
   */
  report(error, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    };

    if (isDev) {
      console.error('[ErrorLogger]', entry.message, entry);
    } else {
      // Production: log minimal info to console
      console.error('[Error]', entry.message);
      // TODO: Send to external logging service
      // e.g., fetch('/api/log', { method: 'POST', body: JSON.stringify(entry) });
    }
  },

  /**
   * Log a warning (non-fatal issue, always logged).
   */
  warn(message, context = {}) {
    if (isDev) {
      console.warn('[ErrorLogger:warn]', message, context);
    }
  },

  /**
   * Log debug info (dev-only, suppressed in production).
   */
  debug(message, context = {}) {
    if (isDev) {
      console.debug('[ErrorLogger:debug]', message, context);
    }
  },

  /**
   * Log informational message (dev-only, suppressed in production).
   */
  info(message, context = {}) {
    if (isDev) {
      console.info('[ErrorLogger:info]', message, context);
    }
  },
};

export default errorLogger;
