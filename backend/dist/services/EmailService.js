"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Logger_1 = require("@/utils/Logger");
class EmailService {
    constructor() {
        this.transporter = null;
        this.logger = new Logger_1.Logger();
        this.isConfigured = this.initializeTransporter();
    }
    initializeTransporter() {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (!smtpHost || !smtpUser || !smtpPass) {
            this.logger.warn('Email service not configured - SMTP credentials missing');
            return false;
        }
        try {
            this.transporter = nodemailer_1.default.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.logger.info('Email service initialized successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to initialize email service:', error);
            return false;
        }
    }
    async sendInvitationEmail(invitation) {
        if (!this.isConfigured || !this.transporter) {
            this.logger.warn('Email service not configured - skipping invitation email');
            return false;
        }
        try {
            const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${invitation.token}`;
            const expiresAt = new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'Tailor Bill Craft'}" <${process.env.SMTP_USER}>`,
                to: invitation.email,
                subject: `You're invited to join ${invitation.organization.name}`,
                html: this.getInvitationEmailTemplate({
                    recipientEmail: invitation.email,
                    senderName: `${invitation.sender.firstName} ${invitation.sender.lastName}`,
                    organizationName: invitation.organization.name,
                    role: invitation.role,
                    invitationLink,
                    expiresAt,
                }),
                text: this.getInvitationEmailText({
                    recipientEmail: invitation.email,
                    senderName: `${invitation.sender.firstName} ${invitation.sender.lastName}`,
                    organizationName: invitation.organization.name,
                    role: invitation.role,
                    invitationLink,
                    expiresAt,
                }),
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.info('Invitation email sent successfully', {
                messageId: info.messageId,
                to: invitation.email,
                organizationId: invitation.organizationId,
            });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send invitation email:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                code: error?.code,
                response: error?.response,
                responseCode: error?.responseCode,
                command: error?.command
            });
            return false;
        }
    }
    async sendWelcomeEmail(email, firstName, organizationName) {
        if (!this.isConfigured || !this.transporter) {
            this.logger.warn('Email service not configured - skipping welcome email');
            return false;
        }
        try {
            const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'Tailor Bill Craft'}" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Welcome to ${organizationName}!`,
                html: this.getWelcomeEmailTemplate({
                    firstName,
                    organizationName,
                    dashboardLink,
                }),
                text: this.getWelcomeEmailText({
                    firstName,
                    organizationName,
                    dashboardLink,
                }),
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.info('Welcome email sent successfully', {
                messageId: info.messageId,
                to: email,
            });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send welcome email:', error);
            return false;
        }
    }
    getInvitationEmailTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .invitation-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .invitation-box p {
            margin: 10px 0;
        }
        .invitation-box strong {
            color: #667eea;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            opacity: 0.9;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .expiry-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .link-fallback {
            word-break: break-all;
            color: #667eea;
            font-size: 13px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 You're Invited!</h1>
        </div>
        
        <div class="content">
            <p>Hi there,</p>
            
            <p><strong>${data.senderName}</strong> has invited you to join their workspace on <strong>${process.env.APP_NAME || 'Tailor Bill Craft'}</strong>.</p>
            
            <div class="invitation-box">
                <p><strong>Workspace:</strong> ${data.organizationName}</p>
                <p><strong>Your Role:</strong> ${data.role}</p>
                <p><strong>Email:</strong> ${data.recipientEmail}</p>
            </div>
            
            <p>Click the button below to accept the invitation and join the workspace. You'll be able to create an account if you don't have one yet.</p>
            
            <div style="text-align: center;">
                <a href="${data.invitationLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Note:</strong> This invitation expires on <strong>${data.expiresAt}</strong>
            </div>
            
            <p class="link-fallback">
                If the button doesn't work, copy and paste this link into your browser:<br>
                ${data.invitationLink}
            </p>
            
            <p style="margin-top: 30px; color: #666;">
                If you weren't expecting this invitation, you can safely ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Tailor Bill Craft'}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
    getInvitationEmailText(data) {
        return `
You're Invited!

Hi there,

${data.senderName} has invited you to join their workspace on ${process.env.APP_NAME || 'Tailor Bill Craft'}.

Workspace: ${data.organizationName}
Your Role: ${data.role}
Email: ${data.recipientEmail}

Click the link below to accept the invitation and join the workspace:
${data.invitationLink}

⏰ Note: This invitation expires on ${data.expiresAt}

If you weren't expecting this invitation, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Tailor Bill Craft'}. All rights reserved.
This is an automated message, please do not reply to this email.
        `;
    }
    getWelcomeEmailTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome Aboard!</h1>
        </div>
        
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            <p>Welcome to <strong>${data.organizationName}</strong>! We're excited to have you as part of the team.</p>
            
            <p>You can now access your dashboard and start collaborating with your team.</p>
            
            <div style="text-align: center;">
                <a href="${data.dashboardLink}" class="cta-button">Go to Dashboard</a>
            </div>
            
            <p style="margin-top: 30px;">
                If you have any questions or need help getting started, feel free to reach out to your workspace administrator.
            </p>
            
            <p>Happy collaborating!</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Tailor Bill Craft'}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
    getWelcomeEmailText(data) {
        return `
Welcome Aboard!

Hi ${data.firstName},

Welcome to ${data.organizationName}! We're excited to have you as part of the team.

You can now access your dashboard and start collaborating with your team.

Go to Dashboard: ${data.dashboardLink}

If you have any questions or need help getting started, feel free to reach out to your workspace administrator.

Happy collaborating!

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Tailor Bill Craft'}. All rights reserved.
        `;
    }
    async verifyConnection() {
        if (!this.isConfigured || !this.transporter) {
            this.logger.error('Email service not configured - cannot verify connection');
            return false;
        }
        try {
            await this.transporter.verify();
            this.logger.info('Email service connection verified successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Email service connection verification failed:', {
                error: error instanceof Error ? error.message : String(error),
                code: error?.code,
                response: error?.response,
                responseCode: error?.responseCode,
                command: error?.command
            });
            return false;
        }
    }
    async testEmailSending() {
        if (!this.isConfigured || !this.transporter) {
            this.logger.error('Email service not configured - cannot test sending');
            return false;
        }
        try {
            const testMailOptions = {
                from: `"${process.env.APP_NAME || 'Tailor Bill Craft'}" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER,
                subject: 'Test Email - Tailor Bill Craft',
                text: 'This is a test email to verify SMTP configuration.',
                html: '<p>This is a test email to verify SMTP configuration.</p>'
            };
            const info = await this.transporter.sendMail(testMailOptions);
            this.logger.info('Test email sent successfully', {
                messageId: info.messageId,
                to: testMailOptions.to
            });
            return true;
        }
        catch (error) {
            this.logger.error('Test email sending failed:', {
                error: error instanceof Error ? error.message : String(error),
                code: error?.code,
                response: error?.response,
                responseCode: error?.responseCode,
                command: error?.command
            });
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map