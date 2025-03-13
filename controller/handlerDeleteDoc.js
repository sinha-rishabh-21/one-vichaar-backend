import UserDoc from "../models/userData.js";
import jwt from "jsonwebtoken";

export default async function handlerDeleteDoc(req, res) {
  try {
    // Check for Authorization Header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Verify JWT Token
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user?.email) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { email } = user;
    const { id } = req.params; // Extract doc ID from params

    // Check if ID is provided
    if (!id) return res.status(400).json({ error: "Enter doc ID" });

    // Update document by removing the matching docID
    const deleted = await UserDoc.updateOne(
      { email }, // Find document by email
      { $pull: { CollabRooms: { docID: id } } } // Remove the docID
    );

    // Check if document was modified
    if (deleted.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "Document not found or already deleted" });
    }

    // Success Response
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
