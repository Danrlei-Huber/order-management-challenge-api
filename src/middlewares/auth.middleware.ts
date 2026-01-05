import jwt, { type JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config.js";
import type { RequestHandler } from "express";


export const authMiddleware: RequestHandler = (
  req,
  res,
  next
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token malformed" });
  }

  try {
    const decoded = jwt.verify(
                token,
                jwtConfig.secret as string
              ) as JwtPayload;

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
