import session from "express-session";
import { Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
