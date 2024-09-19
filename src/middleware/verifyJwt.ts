import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    (req as any).user = decoded.id;
    next();
  });
};
