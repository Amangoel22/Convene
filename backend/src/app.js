import cors from "cors";
import express from "express";
import helmet from "helmet";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({
      name: "convene-backend",
      status: "ok",
      scope: "Sprint 1 infrastructure only"
    });
  });

  return app;
}
