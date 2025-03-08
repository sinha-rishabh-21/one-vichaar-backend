import express from "express";
import router from "./routes/user.js";
import { logReqRes } from "./middleware/index.js";
import dbConnect from "./controller/dbconnect.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { setupWSConnection, setPersistence } = require("./utils/utils.cjs");
import * as Y from "yjs";
import cors from "cors";

dotenv.config();
const PORT = 8000;
const HOST = "0.0.0.0";

const app = express();
const server = http.createServer(app);
const mdb = await dbConnect("mongodb://localhost:27017/one-vichaar");

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use(logReqRes("log.txt"));
app.use("/", router);

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  console.log("New client connected:", req.url);
  setupWSConnection(ws, req);
});


setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    // get the state vector so we can just store the diffs between client and server
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);

    /* we could also retrieve that sv with a mdb function
     *  however this takes longer;
     *  it would also flush the document (which merges all updates into one)
     *   thats prob a good thing, which is why we always do this on document close (see writeState)
     */
    //const persistedStateVector = await mdb.getStateVector(docName);

    // in the default code the following value gets saved in the db
    //  this however leads to the case that multiple complete Y.Docs are saved in the db (https://github.com/fadiquader/y-mongodb/issues/7)
    //const newUpdates = Y.encodeStateAsUpdate(ydoc);

    // better just get the differences and save those:
    const diff = Y.encodeStateAsUpdate(ydoc, persistedStateVector);

    // store the new data in db (if there is any: empty update is an array of 0s)
    if (
      diff.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0
      ) > 0
    )
      mdb.storeUpdate(docName, diff);

    // send the persisted data to clients
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

    // store updates of the document in db
    ydoc.on("update", async (update) => {
      mdb.storeUpdate(docName, update);
    });

    // cleanup some memory
    persistedYdoc.destroy();
  },
  writeState: async (docName, ydoc) => {
    // This is called when all connections to the document are closed.

    // flush document on close to have the smallest possible database
    await mdb.flushDocument(docName);
  },
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
