import sendEmail from "../services/emailService.js";
import contactModel from "../models/contactModel.js";
import newsletterModel from "../models/newsletterModel.js";


export const contactUs = async (req, res) => {
  try {
    const { name, mobile, email, message } = req.body;

    if (!name || !mobile || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contact = await contactModel.create({
      name,
      mobile,
      email,
      message,
      userType: "unregistered",
    });

    await contact.save();

    const userEmailData = {
      email_id: email,
      subject: "Contact Us Form Submission",
      text: `Hello ${name}, \n Thank you for contacting us. \n We will get back to you soon. \n Best Regards, \n BazaarWale`,
      html: `<p>Hello ${name}, </p> <p>Thank you for contacting us. </p> <p>We will get back to you soon. </p> <p>Best Regards, </p> <b>BazaarWale</b>`,
    };
    await sendEmail(userEmailData);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message.split(":").at(-1).trim(),
    });
  }
};

export const newsletter = async (req, res) => {
  try {
    const {email } = req.body;

    if (!email ) {
      return res.status(400).json({
        success: false,
        message: "Email is Required",
      });

    }

    const alreadySubscribed = await newsletterModel.findOne({email})
    
    if(alreadySubscribed){
      return res.status(300).json({
        success: false,
        message : 'You have already Subscribed'
      })
    }

    const newsletter = await newsletterModel.create({
      email
    });

    await newsletter.save();

    const userEmailData = {
      email_id: email,
      subject: "Newsletter Subscription",
      text: `Hello User, \n Thank you for Subscribing to our Newsletter. \n We will upadate to our latest Arrivals . \n Best Regards, \n BazaarWale`,
      html: `<p>Hello User, </p> <p>Thank you for Subscribing to our Newsletter. </p> <p>We will upadate to our latest Arrivals . </p> <p>Best Regards, </p> <b>BazaarWale</b>`,
    };
    await sendEmail(userEmailData);

    return res.status(200).json({
      success: true,
      message: "Newsletter Subscribed successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: `Internal server error ${error}`,
      message: error.message.split(":").at(-1).trim(),
    });
  }
};

