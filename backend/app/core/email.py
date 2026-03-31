"""
Email service for sending verification, password reset, and notification emails.
"""
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template

from app.core.config import settings


class EmailService:
    """Email service for sending transactional emails."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text email body (optional)
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Attach plain text version if provided
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)
            
            # Attach HTML version
            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            # Log error in production
            print(f"Email sending failed: {e}")
            return False
    
    def send_verification_email(self, to_email: str, verification_token: str) -> bool:
        """Send email verification link."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to AI IQ Exchange!</h1>
                </div>
                <div class="content">
                    <p>Thank you for registering with AI IQ Crypto Exchange.</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <p style="text-align: center;">
                        <a href="{{ verification_url }}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{{ verification_url }}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2026 AI IQ Exchange. All rights reserved.</p>
                    <p>Contact: {{ support_email }}</p>
                    <p style="margin-top: 10px;">
                        Follow us: 
                        <a href="https://www.facebook.com/Spaja86" style="color: #667eea; text-decoration: none;">Facebook</a> | 
                        <a href="https://www.instagram.com/spaja.1986" style="color: #667eea; text-decoration: none;">Instagram</a> | 
                        <a href="https://www.tiktok.com/@spaja.1986" style="color: #667eea; text-decoration: none;">TikTok</a> | 
                        <a href="https://www.youtube.com/@spajanikopenevolution" style="color: #667eea; text-decoration: none;">YouTube</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            verification_url=verification_url,
            support_email=settings.EMAIL_FROM
        )
        
        return self.send_email(
            to_email=to_email,
            subject="Verify Your Email - AI IQ Exchange",
            html_content=html_content
        )
    
    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Send password reset link."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>We received a request to reset your password for your AI IQ Exchange account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="{{ reset_url }}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{{ reset_url }}</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your password will not change until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2026 AI IQ Exchange. All rights reserved.</p>
                    <p>Contact: {{ support_email }}</p>
                    <p style="margin-top: 10px;">
                        Follow us: 
                        <a href="https://www.facebook.com/Spaja86" style="color: #667eea; text-decoration: none;">Facebook</a> | 
                        <a href="https://www.instagram.com/spaja.1986" style="color: #667eea; text-decoration: none;">Instagram</a> | 
                        <a href="https://www.tiktok.com/@spaja.1986" style="color: #667eea; text-decoration: none;">TikTok</a> | 
                        <a href="https://www.youtube.com/@spajanikopenevolution" style="color: #667eea; text-decoration: none;">YouTube</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            reset_url=reset_url,
            support_email=settings.EMAIL_FROM
        )
        
        return self.send_email(
            to_email=to_email,
            subject="Reset Your Password - AI IQ Exchange",
            html_content=html_content
        )
    
    def send_welcome_email(self, to_email: str, name: str) -> bool:
        """Send welcome email after successful verification."""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to AI IQ Exchange, {{ name }}! 🎉</h1>
                </div>
                <div class="content">
                    <p>Your email has been verified and your account is now active!</p>
                    <p>You can now access all features of our platform:</p>
                    <div class="feature">
                        <strong>💱 Trade Cryptocurrencies</strong><br>
                        Access real-time trading with BTC, ETH, and more
                    </div>
                    <div class="feature">
                        <strong>💼 Manage Your Wallet</strong><br>
                        Secure multi-currency wallet with instant deposits
                    </div>
                    <div class="feature">
                        <strong>📊 Advanced Analytics</strong><br>
                        AI-powered market insights and trading signals
                    </div>
                    <div class="feature">
                        <strong>🔒 Enterprise Security</strong><br>
                        2FA, encryption, and cold storage protection
                    </div>
                    <p style="text-align: center;">
                        <a href="{{ platform_url }}" class="button">Start Trading Now</a>
                    </p>
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Complete KYC verification for higher limits</li>
                        <li>Enable 2FA for enhanced security</li>
                        <li>Make your first deposit</li>
                        <li>Explore our trading features</li>
                    </ol>
                </div>
                <div class="footer">
                    <p>© 2026 AI IQ Exchange. All rights reserved.</p>
                    <p>Need help? Contact: {{ support_email }}</p>
                    <p style="margin-top: 10px;">
                        Follow us: 
                        <a href="https://www.facebook.com/Spaja86" style="color: #667eea; text-decoration: none;">Facebook</a> | 
                        <a href="https://www.instagram.com/spaja.1986" style="color: #667eea; text-decoration: none;">Instagram</a> | 
                        <a href="https://www.tiktok.com/@spaja.1986" style="color: #667eea; text-decoration: none;">TikTok</a> | 
                        <a href="https://www.youtube.com/@spajanikopenevolution" style="color: #667eea; text-decoration: none;">YouTube</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            name=name,
            platform_url=settings.FRONTEND_URL,
            support_email=settings.EMAIL_FROM
        )
        
        return self.send_email(
            to_email=to_email,
            subject="Welcome to AI IQ Exchange!",
            html_content=html_content
        )


# Global email service instance
email_service = EmailService()
