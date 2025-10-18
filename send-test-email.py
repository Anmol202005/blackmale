#!/usr/bin/env python3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

def send_test_email(to_address):
    # Create message
    msg = MIMEMultipart()
    msg['From'] = 'test@example.com'
    msg['To'] = to_address
    msg['Subject'] = 'Test Email for TempMail Service'

    # Email body
    body = f"""
    Hello!

    This is a test email sent to {to_address}.

    If you can see this in your TempMail inbox, the service is working correctly!

    Best regards,
    TempMail Test System
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to MailHog SMTP server
        server = smtplib.SMTP('localhost', 1025)
        server.send_message(msg)
        server.quit()
        print(f"✅ Test email sent successfully to {to_address}")
        print("📧 Check your TempMail inbox at http://localhost:3000")
        print("📧 Check MailHog interface at http://localhost:8025")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "fastbag7076@localhost"
    send_test_email(email)