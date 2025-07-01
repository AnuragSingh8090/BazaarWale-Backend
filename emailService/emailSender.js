import nodemailer from "nodemailer";

const sendEmail = async (data) => {
  try {
    const { email_id, subject, text, html } = data;
    if (!email_id || !subject || !text || !html) {
      return { success: false, message: "All fields are required" };
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      authMethod: "PLAIN",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email_id,
      subject: subject,
      text: text,
      html: html,
    });

    return { success: true, message: "Email sent successfully",};
  } catch (error) {
    return error.message;
  }
};

export default sendEmail;
