import userModel from "../models/userModel.js";
import sendEmail from "../services/emailService.js";
import addressModel from "../models/addressModel.js";
import bcrypt from "bcryptjs";

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
      .select(" -__v -createdAt -updatedAt ");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const userObject = user.toObject();
    const { _id, ...userData } = userObject;
    userData.userId = _id;

    return res.status(200).json({
      success: true,
      message: "User found",
      user: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const userDataBasic = async (req, res) => {
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
      .select(" -__v -createdAt -updatedAt -password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user : {
        name : user.name,
        email : user.email,
        cart : user.cart,
        userId : user._id
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error.message}`,
      message: "Something went wrong",
    });
  }
};

export const verifyUserEmail = async (req, res) => {
  try {
    const userId = req.userId || false;
    const { email } = req.body || false;
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
    const userId = req.userId || false;
    const { otp } = req.body || false;

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

    if (user.verifyUserEmailOTP !== Number(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.verifyUserEmailOTP = undefined;
    user.isEmailVerified = true;
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
    const userId = req.userId || false;
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
    const userId = req.userId || false;
    const { twoFactorAuth } = req.body;
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
      success: false,
      message: "Nothing changed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const manageLoginActivity = async (req, res) => {
  try {
    const userId = req.userId || false;
    const { loginActivity } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Required",
      });
    }
    if (!loginActivity) {
      return res.status(400).json({
        success: false,
        message: "Login Activity Action Required",
      });
    }
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (loginActivity === "true") {
      user.loginActivity = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Login Activity Enabled",
      });
    } else if (loginActivity === "false") {
      user.loginActivity = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Login Activity Disabled",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Nothing changed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Required",
      });
    }
    const userId = req.userId;

    const { name, gender, mobile, email, isEmailVerified, isMobileVerified } =
      req.body;

    if (!name || !gender || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["male", "female", "others"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gender",
      });
    }

    const emailVerifiedBool =
      isEmailVerified === true || isEmailVerified === "true";
    const mobileVerifiedBool =
      isMobileVerified === true || isMobileVerified === "true";

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name;
    user.gender = gender;
    user.mobile = mobile;
    user.email = email;
    user.isEmailVerified = user.isEmailVerified
      ? user.isEmailVerified
      : emailVerifiedBool;
    user.isMobileVerified = user.isMobileVerified
      ? user.isMobileVerified
      : mobileVerifiedBool;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || false;
    const userId = req.userId || false;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All Fields Required",
      });
    }

    if (currentPassword.length < 6 || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be greater than 6 characters",
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one uppercase letter",
      });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one lowercase letter",
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one special character",
      });
    }
    const user = await userModel.findById(userId).select("+password");
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password Entered!!",
      });
    }
    
    const isOldPasswordMatch = await bcrypt.compare(newPassword, user.password)
    if(isOldPasswordMatch){
      return res.status(400).json({
        success: false,
        message: "Old Password and New Password can not be same",
      });
    }


    const updatedPassword = await bcrypt.hash(newPassword, 10);

    user.password = updatedPassword;
    await user.save()

    res.status(200).json({
      success: true,
      message : "Password Updated Successfully!!"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
};

export const addNewAddress = async (req, res) => {
  try {
    const userId = req.userId || false;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Required",
      });
    }

 if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Address Details Required",
    });
  }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const userAddresses = await user.populate('address');

    // STEP 1: Create new address document first
    const newAddress = new addressModel(req.body);
    const savedAddress = await newAddress.save();

    // STEP 2: Push the address ObjectId to user's address array
    user.address.push(savedAddress._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "New Address Added Successfully",
      data: {
        addressId: savedAddress._id,
        address: savedAddress
      }
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message?.split(":").at(-1)?.trim() || "Unexpected error",
    });
  }
} 