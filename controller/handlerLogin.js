import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../middleware/jwtAuth.js";


const handlerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.cookie("token", generateToken(email), {
      httpOnly: true,
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default handlerLogin;
