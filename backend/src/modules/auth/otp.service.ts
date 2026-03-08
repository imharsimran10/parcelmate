import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/services/prisma.service';
import * as crypto from 'crypto';
import sgMail = require('@sendgrid/mail');

@Injectable()
export class OtpService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Initialize SendGrid
    const sendGridApiKey = this.config.get<string>('SENDGRID_API_KEY');
    if (sendGridApiKey && sendGridApiKey !== 'your_sendgrid_api_key') {
      sgMail.setApiKey(sendGridApiKey);
    }
  }

  async sendOtp(identifier: string, type: 'email' | 'phone'): Promise<void> {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.otpStore.set(`${type}:${identifier}`, { otp, expiresAt });

    // In production, integrate with SMS gateway (e.g., Twilio) or email service
    // For now, log to console in development
    if (this.config.get('NODE_ENV') === 'development') {
      console.log(`\n🔐 OTP for ${type} ${identifier}: ${otp}\n`);
    }

    if (type === 'email') {
      await this.sendEmailOtp(identifier, otp);
    } else {
      await this.sendSmsOtp(identifier, otp);
    }
  }

  async verifyOtp(identifier: string, type: 'email' | 'phone', otp: string): Promise<boolean> {
    const key = `${type}:${identifier}`;
    const stored = this.otpStore.get(key);

    if (!stored) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('OTP expired');
    }

    if (stored.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // OTP is valid, remove it
    this.otpStore.delete(key);
    return true;
  }

  private async sendEmailOtp(email: string, otp: string): Promise<void> {
    const sendGridApiKey = this.config.get<string>('SENDGRID_API_KEY');
    const isDevelopment = this.config.get('NODE_ENV') === 'development';

    // Log OTP in development mode
    if (isDevelopment) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📧 EMAIL OTP FOR: ${email}`);
      console.log(`🔐 OTP CODE: ${otp}`);
      console.log(`⏰ Valid for: 10 minutes`);
      console.log(`${'='.repeat(60)}\n`);
    }

    // In development mode without SendGrid configured, just log and return success
    if (isDevelopment && (!sendGridApiKey || sendGridApiKey === 'your_sendgrid_api_key')) {
      console.log('ℹ️  Development mode: Email not sent, OTP logged above.');
      return; // Success - no error thrown
    }

    // Production mode or development with SendGrid configured - attempt to send email
    try {
      const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@parcelmate.com';
      const fromName = this.config.get<string>('SENDGRID_FROM_NAME') || 'ParcelMate';

      const msg = {
        to: email,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: 'ParcelMate - Verify Your Email',
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      };

      // In development, bypass SSL verification to avoid certificate issues
      if (isDevelopment) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }

      await sgMail.send(msg);
      console.log(`✅ Email sent successfully to ${email}`);

      // Restore SSL verification
      if (isDevelopment) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }
    } catch (error) {
      // Restore SSL verification even on error
      if (isDevelopment) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }

      console.error('❌ Error sending email:', error);

      // Check if it's a SendGrid API error
      if (error.response) {
        const { body } = error.response;
        console.error('SendGrid API Error:', JSON.stringify(body, null, 2));
      }

      // In development mode, don't throw error - OTP is already logged
      if (isDevelopment) {
        console.warn('⚠️  Email sending failed, but OTP is logged above for testing.');
        return; // Success - no error thrown in dev mode
      }

      // In production, throw error
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }
  }

  private async sendSmsOtp(phone: string, otp: string): Promise<void> {
    const isDevelopment = this.config.get('NODE_ENV') === 'development';

    // Log OTP in development mode
    if (isDevelopment) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📱 SMS OTP FOR: ${phone}`);
      console.log(`🔐 OTP CODE: ${otp}`);
      console.log(`⏰ Valid for: 10 minutes`);
      console.log(`${'='.repeat(60)}\n`);
      console.log('ℹ️  Development mode: SMS not sent, OTP logged above.');
    }

    // TODO: Integrate with SMS gateway (e.g., Twilio, AWS SNS)
    // Example integration with Twilio:
    // const twilioSid = this.config.get('TWILIO_ACCOUNT_SID');
    // if (twilioSid && twilioSid !== 'your_twilio_account_sid') {
    //   await this.twilioClient.messages.create({
    //     body: `Your ParcelMate verification code is: ${otp}`,
    //     from: this.config.get('TWILIO_PHONE_NUMBER'),
    //     to: phone,
    //   });
    // }
  }

  // Clean up expired OTPs periodically
  cleanExpiredOtps(): void {
    const now = new Date();
    for (const [key, value] of this.otpStore.entries()) {
      if (now > value.expiresAt) {
        this.otpStore.delete(key);
      }
    }
  }
}
