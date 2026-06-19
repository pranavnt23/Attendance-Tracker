import os
import logging
from dotenv import load_dotenv
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

load_dotenv()

# Configure Logger
logger = logging.getLogger("app.utils.email")

async def send_otp_email(email: str, otp: str):
    """
    Asynchronously sends a minimal, CSS-styled OTP email using fastapi-mail.
    """
    mail_from = os.getenv("MAIL_FROM", "")
    mail_from_name = "Attendance Portal"
    if mail_from and "<" in mail_from and ">" in mail_from:
        parts = mail_from.split("<")
        mail_from_name = parts[0].strip().strip('"').strip("'")
        mail_from = parts[1].replace(">", "").strip()

    try:
        conf = ConnectionConfig(
            MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
            MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
            MAIL_FROM=mail_from,
            MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
            MAIL_SERVER=os.getenv("MAIL_SERVER"),
            MAIL_FROM_NAME=mail_from_name,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
    except Exception as e:
        logger.error(f"Email configuration validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email sending failure"
        )
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Attendance Portal Password Reset OTP</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
                color: #333333;
            }}
            .card {{
                max-width: 480px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }}
            .header {{
                background-color: #2563eb;
                padding: 24px;
                text-align: center;
                color: #ffffff;
                font-weight: bold;
                font-size: 20px;
            }}
            .body {{
                padding: 32px 24px;
            }}
            .greeting {{
                font-size: 16px;
                margin-bottom: 20px;
                font-weight: 500;
            }}
            .otp-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .otp-box {{
                display: inline-block;
                background-color: #eff6ff;
                border: 2px dashed #3b82f6;
                color: #2563eb;
                font-size: 32px;
                font-weight: 800;
                padding: 12px 24px;
                border-radius: 6px;
                letter-spacing: 4px;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 16px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
                border-top: 1px solid #f1f5f9;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                Attendance Portal
            </div>
            <div class="body">
                <div class="greeting">Hello,</div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">Your OTP for password reset is:</p>
                <div class="otp-container">
                    <div class="otp-box">{otp}</div>
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.5;">This OTP is valid for <strong>5 minutes</strong>.</p>
            </div>
            <div class="footer">
                Attendance Portal
            </div>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Attendance Portal Password Reset OTP",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email sending failure"
        )
