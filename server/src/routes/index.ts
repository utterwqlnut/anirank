import { Hono } from "hono";
import health from "./health.js";
import anime from "./anime.js";
import battle from "./battle.js";

const api = new Hono();

api.route("/health", health);
api.route("/anime", anime);
api.route("/battle", battle);

export default api;
