import User from "../models/User.js";

export default async function handlerRegister(req, res) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      const newUser = new User({ name, email, password });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}