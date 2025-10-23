import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { openAPI } from "better-auth/plugins";
import { database } from "@/config/database.config";
import { env } from "@/config/environment.config";

/**
 * Authentication configuration using Better Auth
 * Supports email/password and social OAuth providers
 */
export async function createAuthConfig() {
	const db = await database.getDb();

	return betterAuth({
		database: mongodbAdapter(db),
		secret: env.BETTER_AUTH_SECRET,
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID || "",
				clientSecret: env.GOOGLE_CLIENT_SECRET || "",
				enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
			},
			facebook: {
				clientId: env.FACEBOOK_CLIENT_ID || "",
				clientSecret: env.FACEBOOK_CLIENT_SECRET || "",
				enabled: !!(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
			},
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					fieldName: "role", // the field name in the database
					required: false,
					defaultValue: "user", // the default role is `user`
					input: false, // don't allow user to set role
				},
			},
		},
		plugins: [openAPI()],
	});
}

// Type exports for Better Auth
export type Auth = Awaited<ReturnType<typeof createAuthConfig>>;
export type User = Auth["$Infer"]["Session"]["user"];
export type Session = Auth["$Infer"]["Session"]["session"];
