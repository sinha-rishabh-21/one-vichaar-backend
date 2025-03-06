import express from "express";
import router from "./routes/user.js";
import { logReqRes } from "./middleware/index.js";
import dbConnect from "./controller/dbconnect.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { createRequire } from "module";
import mongoose from "mongoose";

const require = createRequire(import.meta.url);
const { setupWSConnection } = require("./utils/utils.cjs");
mongoose.set("strictQuery", true);

dotenv.config();
const PORT = 8000;
const HOST = "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());
dbConnect("mongodb://localhost:27017/one-vichaar");
app.use(logReqRes("log.txt"));
app.use("/", router);

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  console.log("New client connected:", req.url);
  setupWSConnection(ws, req);
});

server.on("upgrade", (request, socket, head) => {
  //console.log("New upgrade request");
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server
  .listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.log(err);
  });
