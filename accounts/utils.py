from django.conf import settings
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import os
from dotenv import load_dotenv

load_dotenv()


class Util:
    @staticmethod
    def send_verification_email(email, absurl, username, subject, email_body, email_title):
        try:
            body_html = render_to_string('verification-email.html', {'absurl': absurl, 'username': username,
                                                                     'email_body': email_body, 'email_title': email_title})

            from_email = os.getenv('EMAIL_HOST_USER')
            to_email = email

            msg = EmailMultiAlternatives(
                subject,
                'Verification Email',
                from_email=from_email,
                to=[to_email]
            )

            msg.attach_alternative(body_html, "text/html")

            img_dir = './images'
            image_name = 'verification_image.jpeg'
            file_path = os.path.join(img_dir, image_name)
            
            try:
                with open(file_path, 'rb') as f:
                    img = MIMEImage(f.read())
                    img.add_header('Content-ID', '<verification_image>')
                    img.add_header('Content-Disposition', 'inline', filename=image_name)
                    msg.attach(img)
            except FileNotFoundError:
                print(f"Image file not found: {file_path}")

            msg.send()

            print("Email sent successfully!")

        except Exception as e:
            print(f"Error sending email: {e}")
            