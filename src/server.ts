import express, { type Express } from "express";
import appConfig from "./app.config";
import dbConfig from "./configurations/db.configuration";
import envConfig from "./configurations/env.configuration";

const app: Express = express();
const port = Number(envConfig.PORT);

appConfig(app);

const server = app.listen(port, () => {
  console.log(`Server is listening to PORT: ${port}`);
});

dbConfig();

process.on("uncaughtException", (error) => {
  console.error("uncaughtException:", error.name, error.message);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  if (error instanceof Error)
    console.error("unhandledRejection:", error.name, error.message);
  server.close(() => process.exit(1));
});
