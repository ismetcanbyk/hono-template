import { prometheus } from "@hono/prometheus";

/**
 * Prometheus metrics middleware
 * Provides /metrics endpoint and registers metrics
 */
const { printMetrics, registerMetrics } = prometheus();

export { printMetrics, registerMetrics };
