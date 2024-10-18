import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import {transporter} from "../utils/nodemailer.js"; 

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      // Generate access token
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      // Set access token as an HTTP-only cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,  // Ensure it's not accessible via JavaScript (XSS protection)
        maxAge: 60 * 60 * 1000,  // 1 hour
      });

      // Set refresh token as an HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,  // 1 day
      });

      // Send access token and user data in the response body
      return res.status(200).json({
        message: "User logged in",
        data: {
          accessToken,
          ...formatUserResponse(user),
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export function handleLogout(req, res) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    // Verify the access token
    jwt.verify(accessToken, process.env.JWT_SECRET);

    // Clear both accessToken and refreshToken cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid access token" });
  }
}

export async function handleRefreshToken(req, res) {
  const refreshToken = req.cookies["refreshToken"] // Get refresh token from cookies

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Short lifespan for access token
    );

    // Optionally, rotate the refresh token (to increase security)
    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" } // 1-day lifespan for refresh token
    );

    // Set the new access token as an HTTP-only cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Set the new refresh token as an HTTP-only cookie (if rotating)
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return success response with the new access token (optional, since it's already in the cookie)
    return res.status(200).json({
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken, 
      },
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

export async function handleForgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if the user exists
    const user = await _findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token (JWT token valid for 1 hour)
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create reset URL
    const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetURL}" target="_blank">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function handleVerifyToken(req, res) { 
  try { 
    const verifiedUser = req.user; 
    return res.status(200).json({ message: "Token verified", data: verifiedUser }); 
  } catch (err) { 
    return res.status(500).json({ message: err.message }); 
  } 
}
