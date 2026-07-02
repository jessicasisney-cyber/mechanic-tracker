import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "mechanic";
    } & DefaultSession["user"];
  }

  interface User {
    role: "owner" | "mechanic";
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "mechanic";
    } & DefaultSession["user"];
  }

  interface User {
    role: "owner" | "mechanic";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "owner" | "mechanic";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "owner" | "mechanic";
  }
}
