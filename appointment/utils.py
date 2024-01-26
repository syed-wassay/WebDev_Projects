from django.conf import settings
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import os
from dotenv import load_dotenv

load_dotenv()


class Util:
    @staticmethod
    def send_appointment_email(data):
        try:
            subject = data['email_subject']

            body_html = render_to_string('appointment.html', context={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'phone': data['phone'],
                'address': data['address'],
                'date_to': data['date_to'],
                'date_from': data['date_from'],
                'message': data['message']
            })

            from_email = os.getenv('EMAIL_HOST_USER') 
            to_email = data['to_email']

            msg = EmailMultiAlternatives(
                subject,
                data['email_subject'],  
                from_email=from_email,
                to=[to_email]
            )

            msg.attach_alternative(body_html, "text/html")

            img_dir = './images'  
            image_name = 'confirmed.jpeg'  
            file_path = os.path.join(img_dir, image_name)
            
            try:
                with open(file_path, 'rb') as f:
                    img = MIMEImage(f.read())
                    img.add_header('Content-ID', '<confirmed>')
                    img.add_header('Content-Disposition', 'inline', filename=image_name)
                    msg.attach(img)
            except FileNotFoundError:
                print(f"Image file not found: {file_path}")

            msg.send()

        except Exception as e:
            print(f"Error sending appointment email: {e}")
            