/**
 * Centralized error logging utility.
 * In development: logs to console with structured output.
 * In production: sends errors to Sentry (if REACT_APP_SENTRY_DSN is configured).
 */

import * as Sentry from '@sentry/react';

const isDev = process.env.NODE_ENV === 'development';
const sentryEnabled = !isDev && !!process.env.REACT_APP_SENTRY_DSN;

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

      // Send to Sentry with context
      if (sentryEnabled) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        Sentry.captureException(errorObj, {
          extra: context,
          tags: {
            component: context.component || 'unknown',
            action: context.action || 'unknown',
          },
        });
      }
    }
  },

  /**
   * Log a warning (non-fatal issue, always logged).
   */
  warn(message, context = {}) {
    if (isDev) {
      console.warn('[ErrorLogger:warn]', message, context);
    } else if (sentryEnabled) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
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

  /**
   * Set user context for error reports (call on login/logout).
   */
  setUser(user) {
    if (sentryEnabled) {
      if (user) {
        Sentry.setUser({ id: user.uid, email: user.email });
      } else {
        Sentry.setUser(null);
      }
    }
  },
};

export default errorLogger;
