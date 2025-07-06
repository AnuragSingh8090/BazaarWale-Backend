import mongoose from "mongoose";
import validator from 'validator'

const newsletterSchema = new mongoose.Schema({
  email : {
   type: String,
   required : [true, 'Email is Required'],
   validate: [validator.isEmail, "Please provide a valid email"],
   trim:true,
   lowercase : true,
   unique: true,
  }
},{timestamps:true})

const newsleteerModel = mongoose.model.newsletter || mongoose.model('newsletter', newsletterSchema)
export default newsleteerModel