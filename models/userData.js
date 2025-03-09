import mongoose from "mongoose";

const CollabRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  docID: { type: String, required: true, unique: true }, // Ensure uniqueness in each document
});

const UserDataSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  CollabRooms: { type: [CollabRoomSchema], default: [] }, // Store an array of objects
});

const UserDoc = mongoose.model("UserDoc", UserDataSchema);

export default UserDoc;
