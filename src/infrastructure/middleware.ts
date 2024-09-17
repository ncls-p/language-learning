import express from "express";
import path from "path";

export function setupMiddleware(app: express.Application): void {
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "..", "public")));
}
