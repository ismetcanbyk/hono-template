import type { Session, User } from "@/config";

/**
 * Application environment type definition
 * Extends Hono's context with custom variables
 */
export type AppEnv = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};
