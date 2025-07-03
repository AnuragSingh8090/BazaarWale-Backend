import sendEmail from '../emailService/emailSender.js'
import contactModel from '../models/contactModel.js'

export const contactUs = async (req, res) => {
    try{
        const {name, mobile, email, message} = req.body;

        if(!name || !mobile || !email || !message){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        const contact = await contactModel.create({
            name,
            mobile,
            email,
            message,
            userType : 'unregistered',
        })

        await contact.save()

        const userEmailData = {
            email_id: email,
            subject: "Contact Us Form Submission",
            text: `Hello ${name}, \n Thank you for contacting us. \n We will get back to you soon. \n Best Regards, \n BazaarWale`,
            html: `<p>Hello ${name}, </p> <p>Thank you for contacting us. </p> <p>We will get back to you soon. </p> <p>Best Regards, </p> <b>BazaarWale</b>`,
        }
        await sendEmail(userEmailData)

        return res.status(200).json({ 
            success:true,
            message:"Message sent successfully",
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            error: `Internal server error ${error.message}`,
            message: "Something went wrong",
        })
    }
}