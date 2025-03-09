import User from "../models/User.js";
import bcrypt from "bcryptjs";

export default async function handlerDeleteUser(req, res) {
  const body = req.body;
  if (!body.email || !body.password) {
    return res.status(400).send("Fill all the required fields");
  }

  const userTodelete = await User.findOne({
    email: body.email,
  });

  if (!userTodelete) {
          return res.status(404).send("User not found");
        }

  const isMatch = await bcrypt.compare(body.password, userTodelete.password);

    if (isMatch) {
        await User.findByIdAndDelete(userTodelete._id);
        return res.status(200).json("User deleted successfully");
    } else {
        return res.status(400).send("Invalid credentials");
    }
}