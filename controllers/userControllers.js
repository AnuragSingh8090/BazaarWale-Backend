import userModel from "../models/userModel.js";
import sendEmail from "../emailService/emailSender.js";

export const verifyUserEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.verifyUserEmailOTP = otp;
    user.verifyUserEmailOTPExpires = otpExpires;

    await user.save();

    const userEmailData = {
      email_id: email,
      subject: "Verify Your Email",
      text: `Your verification code is ${otp}`,
      html: `<p>Your verification code is <b>${otp}</b></p>`,
    };
    const emailResponse = await sendEmail(userEmailData);
    if (!emailResponse) {
      return res.status(400).json({
        success: false,
        message: "Email not sent",
      });
    }

    res.status(200).json({
      success: true,
      message: `Otp sent to ${email}`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message.split(":").at(-1).trim(),
    });
  }
};

export const verifyUserEmailOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body || {};

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP length",
      });
    }

    const user = await userModel
      .findById(userId)
      .select("+verifyUserEmailOTP +verifyUserEmailOTPExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.verifyUserEmailOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (user.verifyUserEmailOTPExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    if (user.verifyUserEmailOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.verifyUserEmailOTP = undefined;
    user.verifyUserEmailOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.userId || {};
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Required",
      });
    }
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.isAccountBlocked) {
      return res.status(400).json({
        success: false,
        message:
          "Account Blocked by Admin, You cannot delete your account, Please Contact Admin",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Accout Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const manageTwoFactorAuth = async (req, res) => {
  try {
    const userId = req.userId || {};
    const {twoFactorAuth} = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Required",
      });
    }
    if (!twoFactorAuth) {
      return res.status(400).json({
        success: false,
        message: "Two Factor Auth Action Required",
      });
    }
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (twoFactorAuth === "true") {
      user.twoFactorAuth = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Two Factor Authentication Enabled",
      });
    } else if (twoFactorAuth === "false") {
      user.twoFactorAuth = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Two Factor Authentication Disabled",
      });
    }
    return res.status(400).json({
        success : false,
        message:"Nothing changed"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};
