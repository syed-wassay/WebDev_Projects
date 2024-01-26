# mp-asphalt-rest-api
# First Time Project Setup
## Requirements/Versions
- Python 3.9.x (3.9.13)
- pipenv 2023.8.28 or virtualenv 20.24.4
- GDAL

### Installing GDAL

To run this project, you need to install GDAL. We recommend using Homebrew on macOS.

# Install Homebrew (if not installed)
`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` 

# Install GDAL
`brew install gdal`

#### Add Environment Variables to Your Project
In your project, create or update your `.env` file:
```dotenv
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST='smtp.gmail.com' #for gmail smtp
EMAIL_PORT=587  # for gmail smtp
EMAIL_HOST_USER='your email address'
EMAIL_HOST_PASSWORD='your password'
POSTGRES_DB='your database'
POSTGRES_USER='user name'
POSTGRES_PASSWORD='your password'
PHONENUMBER_DEFAULT_REGION='your region'
PHONENUMBER_DEFAULT_FORMAT='E164'
DEFAULT_PASSWORD_FOR_USERS='provide a default password'
```
This will setup the database and email
## Web Server
- Setup virtual environment `virtualenv venv` and **activate it**
- Install dependencies `pip install -r requirements.txt`
### More Database
1. Make Database Migrations
    ```bash
    python manage.py makemigrations accounts
    python manage.py makemigrations appointment
    python manage.py makemigrations map_object
    ```
2. Migrate Database 
    ```bash
    python manage.py migrate
    ```
3. Setup a Super User 
    ```bash
    python manage.py createsuperuser
    ```
### Run Server
`python manage.py runserver`
