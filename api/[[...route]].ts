import { handle } from "hono/vercel";
import app from "../server/src/app.js";

export default handle(app);
