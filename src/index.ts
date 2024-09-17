import { config } from "dotenv";
import express from "express";
import { errorHandler } from "./infrastructure/errorHandler";
import { setupMiddleware } from "./infrastructure/middleware";
import { setupRoutes } from "./interfaces/routes";

config();

const app = express();
const PORT = process.env.PORT || 3001;

setupMiddleware(app);
setupRoutes(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
