import jwt, { type SignOptions } from "jsonwebtoken";
import envConfig from "../configurations/env.configuration";

export interface JwtPayload {
  id: string;
}

const signToken = (id: string): string =>
  jwt.sign({ id }, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;

export { signToken, verifyToken };
