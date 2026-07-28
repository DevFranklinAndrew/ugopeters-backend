import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import envConfig from "./configurations/env.configuration";
import AppError from "./errors/app.error";
import globalErrorHandler from "./errors/global.error";
import apiRouter from "./routers/api.router";

const appConfig = (app: Application) => {
  app
    .use(cors({ credentials: true, origin: [envConfig.CLIENT_URL] }))
    .use(helmet())
    .use(express.json())
    .use(cookieParser())
    .set("trust proxy", 1)
    .use(morgan("dev"));

  app.get("/health", (_req: Request, res: Response) =>
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );

  app.use("/api", apiRouter);

  app.use((req, _res, next) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)),
  );

  app.use(globalErrorHandler);
};

export default appConfig;
