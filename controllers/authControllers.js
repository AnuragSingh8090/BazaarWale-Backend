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
      message: `Internal server error`,
      error: error.message.split(":").at(-1).trim(),
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
    const user = await userModel.findOne({ email }).select("+password");
    const safeUser = await userModel
      .findById(user._id.toString())
      .select("-password -__v -createdAt -updatedAt");

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
      message: `Internal server error ${error.message}`,
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
        success:true,
        message:"User found",
        user
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Internal server error ${error.message}`,
    });
  }
};

export const resetPassword = async (req, res) =>{
    try{
      const email = req.body.email;
      if(!email){
        return res.status(400).json({
            success:false,
            message:"Email is required",
        })
      }

      const user = await userModel.findOne({email})
      if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found",
        })
      }
      console.log(user)


    }
    catch(error){
        return res.status(400).json({
            success: false,
            message: `Internal server error ${error.message}`,
        })
    }
}