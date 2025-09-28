import { getSessionUser } from "./clerk";
export { authOptions, auth, getCurrentUser } from "./nextauth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}
