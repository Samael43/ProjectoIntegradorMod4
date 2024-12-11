# Local Development Setup Guide

## Getting Started

### 1. Project Setup
1. Download the ZIP file
2. Extract it to your desired location
3. Open a terminal/command prompt in the extracted folder

### 2. Email Configuration
1. Locate the `settings.py` file in the task_manager directory
2. Create a copy and rename it to `.env`
3. Update the following credentials in `.env`:
```env
EMAIL_HOST_USER="youremail@gmail.com"
EMAIL_HOST_PASSWORD="your generated app password"
```

### 3. Virtual Environment Setup

#### Windows:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

#### macOS/Linux:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### 4. Install Dependencies
```bash
# Install required packages
pip install -r requirements.txt
```

### 5. Database Setup
```bash
# Generate database migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The application will be available at:
- 📱 Local: http://127.0.0.1:8000/api/docs/
- ⚙️ Admin: http://127.0.0.1:8000/admin/


## Security Tips
- 🔐 Regularly review and revoke unused app passwords
- 🚫 Don't use your main Google Account password
- ✨ Generate unique app passwords for different applications
- 📱 Keep 2-Step Verification enabled at all times
