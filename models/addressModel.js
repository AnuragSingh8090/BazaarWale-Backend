import mongoose from "mongoose";
import validator from "validator";

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10 digit mobile number!`,
      },
    },
    streetDetails: {
      type: String,
      required: [true, "Street details are required"],
      trim: true,
      minlength: [3, "Street details must be at least 3 characters"],
      maxlength: [100, "Street details must be at most 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters"],
      maxlength: [50, "City must be at most 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      minlength: [2, "State must be at least 2 characters"],
      maxlength: [50, "State must be at most 50 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      validate: {
        validator: function (v) {
          return /^\d{5,6}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid postal code! It should be 5 or 6 digits.`,
      },
    },
    addressType: {
      type: String,
      required: [true, "Address type is required"],
      enum: {
        values: ["home", "work", "other"],
        message: "Address type must be either Home, Work, or Other",
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const addressModel =
  mongoose.models.Address ||
  mongoose.model("Address", addressSchema);

export default addressModel;

