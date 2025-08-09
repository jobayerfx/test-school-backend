// types/AuthRequest.ts
import { Request } from "express";

export interface AuthUserPayload {
  id: string;
  role: "admin" | "student" | "supervisor";
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}
