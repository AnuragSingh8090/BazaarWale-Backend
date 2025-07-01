import mongoose from 'mongoose'
import validator from 'validator'

const contactSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [50, "Name must be less than 50 characters long"],
    },
    email : {
         type: String,
         required : [true, "Email is required"],
         trim:true,
         lowercase : true,
         validate : [validator.isEmail, "Please provide a valid email"],
    },
    userType : {
        type : String,
        enum: ['registered', 'unregistered'],
        required : [true, "User type is required"],
        default : 'unregistered',
    },
    message : {
        type : String,
        required : [true, "Message is required"],
        trim : true,
        minlength : [10, "Message must be at least 10 characters long"],
        maxlength : [500, "Message must be less than 500 characters long"],
    },
    mobile : {
        type: String,
        required : [true, "Mobile is required"],
        trim : true,
        minlength : [10, "Mobile must be at least 10 characters long"],
        maxlength : [15, "Mobile must be less than 15 characters long"],
        validate : [validator.isMobilePhone, "Please provide a valid mobile number"],
    },
    resolved : {
        type : Boolean,
        default : false,
    }
},{timestapms:true})

const contactModel = mongoose.model('contact', contactSchema)

export default contactModel