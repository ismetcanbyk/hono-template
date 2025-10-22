import pino from "pino";
import pretty from "pino-pretty";
import { env } from "@/config/environment.config";

/**
 * Application-wide Pino logger configuration
 * Outputs to stdout with pretty printing in development, JSON in production
 */
const createLogger = () => {
	const isDevelopment = env.NODE_ENV === "development";

	// Pretty print configuration for development
	const prettyStream = pretty({
		colorize: true,
		translateTime: "HH:MM:ss Z",
		ignore: "pid,hostname",
		singleLine: false,
	});

	return pino(
		{
			level: env.LOG_LEVEL,
			timestamp: pino.stdTimeFunctions.isoTime,
			formatters: {
				level: (label) => {
					return { level: label.toUpperCase() };
				},
			},
		},
		isDevelopment ? prettyStream : pino.destination(1), // 1 = stdout
	);
};

/**
 * Global logger instance
 * Use this instead of console.log/console.error/console.info
 *
 * @example
 * // Simple logging
 * logger.info('Server started');
 * logger.error('Something went wrong');
 *
 * // Structured logging with context
 * logger.info({ userId: 123, action: 'login' }, 'User logged in');
 * logger.error({ err: error, userId: 123 }, 'Login failed');
 *
 * // Using 'err' key for errors automatically formats stack traces
 * logger.error({ err: new Error('Database connection failed') }, 'DB Error');
 */
export const logger = createLogger();

/**
 * Type-safe logger instance
 */
export type Logger = typeof logger;
