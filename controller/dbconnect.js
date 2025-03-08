import mongoose from "mongoose";
import { MongodbPersistence } from "y-mongodb-provider";

export default async function dbConnect(url) {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const client = mongoose.connection.getClient(); // Get the raw MongoDB client

    // Ensure db and client exist before initializing persistence
    if (!db || !client) {
      throw new Error("MongoDB connection not initialized properly.");
    }

    // Create the Yjs MongoDB Persistence instance
    const mdb = new MongodbPersistence(
      { client, db },
      {
        collectionName: "yjsDocs",
        flushSize: 400,
        multipleCollections: false,
      }
    );

    return mdb; // Ensure this is returned properly
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow error so that the calling function knows it failed
  }
}
