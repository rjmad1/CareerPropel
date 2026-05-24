# CareerPropel - AI-Native Career Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Material-UI](https://img.shields.io/badge/Material--UI-5-blue?logo=mui&style=flat-square)](https://mui.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?logo=postgresql&style=flat-square)](https://www.postgresql.org)

## 🎯 Overview

**CareerPropel** is a production-ready job application management platform demonstrating full-stack development excellence. Built with modern technologies, enterprise-grade security, and professional UI/UX design.

**Live Demo:** [careerpropel.vercel.app](https://careerpropel.vercel.app) *(Coming Soon)*

---

## ✨ Key Features

### 🎨 **Production-Ready UI**
- Material Design System with custom theming
- Responsive layouts (mobile, tablet, desktop)
- Professional login, dashboard, and landing pages
- Smooth animations and transitions
- Accessibility-first implementation

### 🔐 **Enterprise Security** (Phases 1-3)
- **Authentication:** NextAuth.js with session management
- **Authorization:** Role-Based Access Control (RBAC)
- **2FA:** Two-Factor Authentication with TOTP support
- **API Keys:** Secure key management with rotation
- **Audit Logging:** Complete activity tracking
- **Threat Detection:** Anomaly scoring and monitoring
- **Rate Limiting:** API endpoint throttling
- **CSRF Protection:** Token-based validation

### 📱 **Core Features**
- Job application tracking with status workflow
- Material-UI form components with validation
- Real-time job list with sorting/filtering
- User authentication and authorization
- Comprehensive activity logging

---

## 🏗️ Architecture

### **Frontend**
- Next.js 14 with App Router
- Material-UI (MUI) 5 components
- TypeScript for type safety
- Emotion for CSS-in-JS styling

### **Backend**
- Next.js API Routes
- NextAuth.js for authentication
- Prisma ORM for database access
- Zod for input validation

### **Database**
- PostgreSQL for data persistence
- Redis for caching (optional)

### **Deployment**
- Vercel for hosting and CI/CD
- GitHub for version control

---

## 🚀 Deploy to Vercel (5 Minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### Step 2: Import Project
1. Click "New Project" on Vercel dashboard
2. Click "Import Git Repository"
3. Search for and select "CareerPropel"

### Step 3: Add Environment Variables
In Vercel project settings, add:
```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=generate-a-random-string-here
DATABASE_URL=your-postgresql-connection-string
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Get your live URL!

---

## 💻 Run Locally

```bash
# Clone and setup
git clone https://github.com/rjmad1/CareerPropel.git
cd CareerPropel
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database URL

# Setup database
npm run db:push

# Start development
npm run dev
```

Access at: http://localhost:3000

---

## 📊 Tech Stack

**Frontend:** Next.js 14 | React 18 | Material-UI | TypeScript
**Backend:** Next.js API Routes | NextAuth.js | Prisma ORM
**Database:** PostgreSQL | Redis
**Deployment:** Vercel | GitHub
**Security:** RBAC | 2FA | API Keys | Audit Logging | Rate Limiting

---

## 🔒 Security Highlights

✓ NextAuth.js authentication
✓ Role-Based Access Control (RBAC)
✓ Two-Factor Authentication (2FA/TOTP)
✓ API Key management with hashing
✓ Comprehensive audit logging
✓ Threat detection system
✓ Input validation (Zod)
✓ XSS prevention
✓ SQL injection protection (Prisma)
✓ CSRF protection
✓ Rate limiting (100 req/min reads, 20-30 writes)
✓ OWASP Top 10 compliance

---

## 📈 Project Stats

- **88+ Files** across the full stack
- **17,000+ Lines** of production code
- **10+ Material-UI** components customized
- **8+ API Endpoints** with security
- **12+ Security Features** implemented
- **Production-Ready** build verified

---

## 🎓 Skills Demonstrated

✓ Full-Stack Development (Next.js/React/Node)
✓ Database Design & Prisma ORM
✓ Enterprise Security Implementation
✓ Material Design UI/UX
✓ TypeScript Type Safety
✓ API Authentication & Authorization
✓ DevOps & Deployment (Vercel)
✓ Git Version Control & GitHub

---

## 📚 Get Started

1. **Deploy to Vercel** (recommended) - see section above
2. **Run Locally** - clone and follow local setup
3. **Explore Code** - check out the architecture
4. **Customize** - make it your own!

---

## 🤝 Want to Collaborate?

This project is open for:
- Additional OAuth providers
- Advanced job filtering
- Interview preparation features
- Resume integration
- Email notifications
- Mobile app version

---

## 📄 License

MIT - Open for learning and reuse

---

## 👤 About

Built as a demonstration of full-stack development expertise combining modern technologies with enterprise-grade security.

**GitHub:** [@rjmad1](https://github.com/rjmad1)

---

**⭐ Star this repo if you found it helpful!**
