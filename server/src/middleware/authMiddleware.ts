import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub: string;
  email: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();


    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const userRole = decoded["custom:role"] || "";
      const userEmail = decoded.email?.toLowerCase();
      const isSuperAdmin = userEmail === superAdminEmail;
      req.user = {
        id: decoded.sub,
        role:  isSuperAdmin ? 'super_admin' : userRole,
        email: userEmail,
        isSuperAdmin
      };

       if (!allowedRoles.includes(req.user.role) && !isSuperAdmin) {
         res.status(403).json({ message: "Access Denied" });
         return;
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};