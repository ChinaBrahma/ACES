import express from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import User from "../models/userSchema.js"; 
import jwt from "jsonwebtoken";
import { Clerk } from "@clerk/clerk-sdk-node";

const router = express.Router();
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// ⬅️ Normal auth routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Error in /me:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


//  New Clerk login route
router.post("/clerk-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    // Verify Clerk token
    const session = await clerk.sessions.verifyToken(token);
    const clerkUserId = session.userId;

    // Get Clerk user info
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0].emailAddress;
    const username = clerkUser.username || clerkUser.firstName || email;

    // Find or create user in MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username, email, password: "clerk_oauth_user" });
    }

    // Issue your own JWT (same as normal login flow)
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Clerk login successful" });
  } catch (err) {
    console.error("Error in /clerk-login:", err.message);
    res.status(401).json({ message: "Invalid Clerk token" });
  }
});

export default router;
