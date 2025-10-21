import type { Session, User } from "../auth.js";

export type AppEnv = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
