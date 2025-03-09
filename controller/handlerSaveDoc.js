import jwt from "jsonwebtoken";
import UserDoc from "../models/userData.js";

export default async function handlerSaveDoc(req, res) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user?.email) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { email } = user;
    const { docID, docName } = req.body;

    if (!docName || !docID) {
      return res
        .status(400)
        .json({ error: "Document name and ID are required" });
    }

    await UserDoc.findOneAndUpdate(
      { email },
      { $addToSet: { CollabRooms: { name: docName, docID } } }, // Ensures unique (name, docID) pair
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Document saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
