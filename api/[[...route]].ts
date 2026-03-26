import { handle } from "hono/vercel";
import app from "../server/src/app.js";

export const config = {
  runtime: "edge",
};

export default handle(app);
