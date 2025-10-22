import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Auth } from "@/config";

/**
 * Authentication middleware factory
 * Attaches user session to context if authenticated
 */
export function authMiddleware(auth: Auth) {
	return async (c: Context, next: Next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", session?.user ?? null);
		c.set("session", session?.session ?? null);
		await next();
	};
}

/**
 * Protected route middleware
 * Requires user to be authenticated, throws 401 if not
 */
export function requireAuth(getAuth: () => Promise<Auth>) {
	return async (c: Context, next: Next) => {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session?.user || !session?.session) {
			throw new HTTPException(401, {
				message: "Unauthorized - Authentication required",
			});
		}

		c.set("user", session.user);
		c.set("session", session.session);
		await next();
	};
}

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 */
// export function requireRole(
//   getAuth: () => Promise<Auth>,
//   allowedRoles: string | string[]
// ) {
//   return async (c: Context, next: Next) => {
//     const auth = await getAuth();
//     const session = await auth.api.getSession({ headers: c.req.raw.headers });

//     if (!session?.user || !session?.session) {
//       throw new HTTPException(401, {
//         message: "Unauthorized - Authentication required",
//       });
//     }

//     const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
//     const userRole = (session.user as any).role;

//     if (!userRole || !roles.includes(userRole)) {
//       throw new HTTPException(403, {
//         message: "Forbidden - Insufficient permissions",
//       });
//     }

//     c.set("user", session.user);
//     c.set("session", session.session);
//     await next();
//   };
// }
