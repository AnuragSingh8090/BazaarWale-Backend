import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [20, "Name must be less than 20 characters long"],
      required: [true, "Name is required"],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      minlength: [4, "Email must be at least 4 characters long"],
      maxlength: [30, "Email must be less than 30 characters long"],
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    mobile: {
      type: String,
      minlength: [10, "Mobile must be at least 10 characters long"],
      maxlength: [15, "Mobile must be less than 15 characters long"],
      required: [true, "Mobile is required"],
      trim: true,
      unique: true,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid mobile number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "Gender must be either Male, Female, or Other",
      },
    },
    loginHistory: {
      type: Array,
      default: [],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: Array,
      default: [],
    },
    paymentMethod: {
      type: Array,
      default: [],
    },
    cart: {
      type: Array,
      default: [],
    },
    wishlist: {
      type: Array,
      default: [],
    },
    orders: {
      type: Array,
      default: [],
    },
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    emailOTP: {
      type: String,
      select: false,
    },
    emailOTPExpires: {
      type: Date,
      select: false,
    },
    mobileOTP: {
      type: String,
      select: false,
    },
    mobileOTPExpires: {
      type: Date,
      select: false,
    },
    isAccountBlocked: {
      type: Boolean,
      default: false,
      select: false,
    },
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordOTPExpires: {
      type: Date,
      select: false,
    },
    verifyUserEmailOTP: {
      type: String,
      select: false,
    },
    verifyUserEmailOTPExpires: {
      type: Date,
      select: false,
    },
    verifyUserMobileOTP: {
      type: String,
      select: false,
    },
    verifyUserMobileOTPExpires: {
      type: Date,
      select: false,
    },
    loginActivity : {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model.User || mongoose.model("User", userSchema);

export default userModel;
