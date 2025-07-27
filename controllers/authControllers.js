import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../emailService/emailSender.js";

export const register = async (req, res) => {
  try {
    const { name, email, mobile, password, gender } = req.body;
    if (!name || !email || !mobile || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingUser = await userModel.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
      if (existingUser.mobile === mobile) {
        return res
          .status(400)
          .json({ success: false, message: "Mobile already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const emailData = {
      email_id: email,
      subject: "Account Created Successfully",
      text: `Hi ${name}, Your account on BazaarWala has been created successfully`,
      html: `<b>Hi ${name}, Your account on BazaarWala has been created successfully</b>`,
    };

    const response = await sendEmail(emailData);

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message.split(":").at(-1).trim(),
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let user;

    if (typeof email === "string" && email.includes("@")) {
      user = await userModel.findOne({ email }).select("+password");
    } else if (typeof email === "string" && /^\d{10}$/.test(email.trim())) {
      const mobile = Number(email.trim());
      user = await userModel.findOne({ mobile }).select("+password");
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Mobile" });
    }

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not Registered" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }

    const safeUser = await userModel
      .findById(user._id.toString())
      .select("-password -__v -createdAt -updatedAt");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const userData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const user = await userModel
      .findById(userId)
      .select(" -__v -createdAt -updatedAt");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const validateResetPasswordEmail = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email or Mobile required",
      });
    }

    let user;

    if (typeof email === "string" && email.includes("@")) {
      user = await userModel.findOne({ email });
    } else if (typeof email === "string" && /^\d{10}$/.test(email.trim())) {
      const mobile = Number(email.trim());
      user = await userModel.findOne({ mobile });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Mobile" });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpires;

    const emailData = {
      email_id: user.email,
      subject: "Reset Password OTP",
      text: `Your reset password OTP is ${otp}`,
      html: `<p>Your reset password OTP is <b>${otp}</b> </p> <p>This OTP will expire in 5 minutes</p>`,
    };

    const emailResponse = await sendEmail(emailData);
    if (!emailResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `OTP has sent to ${user.email} `,
      otpExpires,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const validateResetPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    let user;

    if (typeof email === "string" && email.includes("@")) {
      user = await userModel
        .findOne({ email })
        .select("+resetPasswordOTP +resetPasswordOTPExpires");
    } else if (typeof email === "string" && /^\d{10}$/.test(email.trim())) {
      const mobile = Number(email.trim());
      user = await userModel
        .findOne({ mobile })
        .select("+resetPasswordOTP +resetPasswordOTPExpires");
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Mobile" });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetPasswordOTPExpires < Date.now()) {
      user.resetPasswordOTP = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    let user;

    if (typeof email === "string" && email.includes("@")) {
      user = await userModel
        .findOne({ email })
        .select("+password +resetPasswordOTP +resetPasswordOTPExpires");
    } else if (typeof email === "string" && /^\d{10}$/.test(email.trim())) {
      const mobile = Number(email.trim());
      user = await userModel
        .findOne({ mobile })
        .select("+password +resetPasswordOTP +resetPasswordOTPExpires");
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Mobile" });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.resetPasswordOTPExpires < Date.now() ||
      user.resetPasswordOTP === null
    ) {
      user.resetPasswordOTP = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP expired, Please Resend OTP",
      });
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (decryptedPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = null;

    await user.save();

    const emailData = {
      email_id: email,
      subject: "Password Changed Successfully",
      text: `Your password has been changed successfully`,
      html: `<p>Your password for <b>BazaarWale</b> has been changed successfully</p>`,
    };

    await sendEmail(emailData);

    return res.status(200).json({
      success: true,
      message: "Password Changed successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};
