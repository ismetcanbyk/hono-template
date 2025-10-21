import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { openAPI } from "better-auth/plugins";
import { database } from "./database/db.js";
import { env } from "./env.js";

export const createAuth = () => {
	return betterAuth({
		database: mongodbAdapter(database.getDb()),
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				redirectUri: `http://localhost:3000/`,
			},
			facebook: {
				clientId: env.FACEBOOK_CLIENT_ID,
				clientSecret: env.FACEBOOK_CLIENT_SECRET,
			},
		},
		plugins: [openAPI()],
	});
};
