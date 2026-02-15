import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import { ENV } from "../../config/env";
import { IEmailService } from "../interface/IEmailService";

@injectable()
export class EmailService implements IEmailService {
  private transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,      
    port: 587,
    secure: false,
    auth: {
      user: ENV.SMTP_USER,    
      pass: ENV.SMTP_PASS,    
    },
  });

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"RentSphere" <${ENV.SMTP_USER}>`,
      to: email,
      subject: "Your RentSphere OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Your RentSphere OTP</h2>
          <div style="background: #059669; color: white; font-size: 32px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #6b7280; margin-top: 20px;">
            This code expires in <strong>5 minutes</strong>.<br>
            Enter it to verify your email address.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
