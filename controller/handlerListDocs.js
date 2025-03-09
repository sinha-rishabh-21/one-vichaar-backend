import UserDoc from "../models/userData.js";
import jwt from "jsonwebtoken";

export default async function handlerListDocs(req, res) {
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

    const userDocs = await UserDoc.findOne({ email });
    if (!userDocs) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userDocs.CollabRooms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
