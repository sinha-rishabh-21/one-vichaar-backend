import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { authenticate, generateToken } from '../middleware/jwtAuth.js';

const router = express.Router();

router.get('/',authenticate,(req,res)=>{
    return res.send('Hello from user route');
})

//redirect to login in frontend when register is succcessful
router.post('/register', async (req,res) => {
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
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.cookie("token",generateToken(email),{
        httpOnly:true, 
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 3600000
    });

    res.status(200).json({ message: "Login successful!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deleteUser",authenticate, async (req, res) => {
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
});

export default router;