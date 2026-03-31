# Platform Setup Guide - Complete Integration

## Overview
This guide provides step-by-step instructions to fully integrate and deploy the AI IQ Crypto Exchange platform.

## ✅ What's Implemented

### Backend (FastAPI)
- ✅ User registration with email verification
- ✅ Login with JWT tokens and 2FA support
- ✅ Password reset functionality
- ✅ Email service with templates
- ✅ Trading engine with order matching
- ✅ Wallet management
- ✅ Payment processing (Stripe/PayPal ready)
- ✅ KYC verification structure
- ✅ Admin endpoints
- ✅ WebSocket for real-time updates

### Frontend (React + TypeScript)
- ✅ Login/Register page
- ✅ Email verification page
- ✅ Password reset flow
- ✅ Forgot password page
- ✅ Dashboard
- ✅ Trading interface
- ✅ Wallet management
- ✅ Settings page

### Integration Points
- ✅ HTML landing pages linked to React app
- ✅ Email verification workflow
- ✅ Password reset workflow
- ✅ Auto-login after registration

## 🚀 Quick Setup (Development)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Edit .env file with your settings
nano .env

# Required settings:
# - DATABASE_URL: PostgreSQL connection string
# - SMTP_USER: Gmail account for sending emails
# - SMTP_PASSWORD: Gmail app password
# - SECRET_KEY: Random secret key
# - FRONTEND_URL: http://localhost:5173

# Run database migrations
alembic upgrade head

# Start the backend
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Edit .env.local
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### 3. Access the Platform

- **Landing Page**: http://localhost:8888/index.html (or open index.html)
- **Trading Platform**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/docs
- **Backend Health**: http://localhost:8000/health

## 📧 Email Configuration

### Gmail Setup (Recommended for Development)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Create new app password for "Mail"
3. **Update .env**:
   ```env
   SMTP_USER=your.email@gmail.com
   SMTP_PASSWORD=your-app-password-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```

### Production Email (SendGrid, Amazon SES, etc.)

For production, use a dedicated email service:

```env
# Example with SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## 🔐 Email Verification Flow

### Registration Process
1. User registers with email/password
2. Account created but `is_verified=False`
3. Verification email sent automatically
4. User clicks link in email
5. Account verified → `is_verified=True`
6. Welcome email sent
7. User can now fully access platform

### Email Templates
Three email templates are sent automatically:
- **Verification Email**: Sent on registration
- **Password Reset**: Sent when user requests reset
- **Welcome Email**: Sent after successful verification

## 🔄 Password Reset Flow

1. User clicks "Forgot Password" on login page
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks link in email (valid for 1 hour)
5. Enters new password
6. Password updated
7. User redirected to login

## 🎯 User Registration Flow

```
1. User fills registration form
   ↓
2. POST /api/auth/register
   ↓
3. Account created (unverified)
   ↓
4. Verification email sent
   ↓
5. JWT tokens returned
   ↓
6. User can access platform (limited)
   ↓
7. User clicks verification link
   ↓
8. GET /verify-email?token=xxx
   ↓
9. Account verified
   ↓
10. Welcome email sent
   ↓
11. Full platform access enabled
```

## 📱 2FA (Two-Factor Authentication)

### Setup Process
1. User enables 2FA in Settings
2. QR code generated and displayed
3. User scans with authenticator app (Google Authenticator, Authy)
4. User enters 6-digit code to confirm
5. 2FA enabled on account

### Login with 2FA
1. User enters email/password
2. If 2FA enabled, prompted for code
3. User enters 6-digit code from app
4. Login successful

## 🧪 Testing

### Test Email Verification

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Check email for verification link
# Click link or manually verify:
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-verification-token"}'
```

### Test Password Reset

```bash
# Request password reset
curl -X POST http://localhost:8000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check email for reset link
# Reset password:
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token",
    "new_password": "newpassword123"
  }'
```

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

```bash
# Create secrets
kubectl create namespace crypto-exchange
./scripts/setup-secrets.sh

# Deploy services
kubectl apply -f k8s/

# Check status
kubectl get pods -n crypto-exchange
```

## 🔍 Troubleshooting

### Email Not Sending
- Check SMTP credentials in .env
- Verify Gmail app password (not regular password)
- Check spam folder
- Review backend logs for errors

### Frontend Not Connecting
- Ensure backend is running on port 8000
- Check CORS settings in backend config
- Verify VITE_API_URL in frontend .env.local

### Database Errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `alembic upgrade head`

## 📊 What's Left to Implement

### High Priority
- [ ] Real-time price feeds integration
- [ ] Payment gateway webhooks
- [ ] KYC document upload/verification
- [ ] Email template customization

### Medium Priority
- [ ] Background job queue (Celery)
- [ ] Rate limiting per user
- [ ] Session management improvements
- [ ] Mobile app deployment

### Low Priority
- [ ] Advanced analytics
- [ ] Trading bots/API
- [ ] Multi-language support
- [ ] Dark mode

## 🎓 Next Steps

1. **Configure Email** - Set up Gmail or SendGrid
2. **Test Registration** - Create account and verify email
3. **Test Trading** - Place test orders
4. **Enable 2FA** - Secure your test account
5. **Deploy to Production** - Follow deployment guide

## 📚 Additional Resources

- [API Documentation](../docs/API.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Security Best Practices](../docs/SECURITY.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)

## 💬 Support

- Email: spajicn@yahoo.com, spajicn@gmail.com
- GitHub Issues: Report bugs and feature requests

---

**Estimated Time to Full Platform Maturity**: 2-3 days with the above integrations complete.

The core infrastructure is 90% complete. Remaining work is mostly configuration, testing, and production deployment.
