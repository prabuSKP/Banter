# Banter Project Sub-Agents

This directory contains specialized sub-agents for the Banter social audio/video platform project.

## Available Sub-Agents

### Core Development
1. **backend-dev** - Node.js/Express/TypeScript backend development
2. **mobile-dev** - React Native/Expo mobile app development
3. **database-engineer** - Prisma ORM and PostgreSQL management
4. **api-architect** - RESTful API design and OpenAPI documentation

### Specialized Features
5. **realtime-engineer** - Socket.IO real-time communication
6. **payment-integration** - Razorpay payment and wallet system
7. **storage-engineer** - Azure Blob Storage file management
8. **auth-security** - Firebase Auth, JWT, and security specialist

### Quality Assurance
9. **testing-engineer** - Jest testing and code coverage
10. **security-auditor** - Security vulnerabilities and compliance
11. **performance-optimizer** - Query optimization and caching

### Operations
12. **devops-engineer** - CI/CD, Docker, and deployment
13. **monitoring-specialist** - Logging, error tracking, and metrics

## Usage

To invoke a sub-agent:
```
@agent:backend-dev Please implement the user profile update endpoint
```

Or use the agent command:
```
/agent backend-dev
```

## Agent Selection Guide

| Task | Recommended Agent |
|------|-------------------|
| Create new API endpoint | backend-dev |
| Fix database query | database-engineer |
| Build mobile screen | mobile-dev |
| Implement Socket.IO event | realtime-engineer |
| Add payment feature | payment-integration |
| Upload/download files | storage-engineer |
| Fix security issue | security-auditor |
| Write unit tests | testing-engineer |
| Optimize performance | performance-optimizer |
| Setup CI/CD pipeline | devops-engineer |
| Add authentication | auth-security |
| Generate API docs | api-architect |
| Setup monitoring | monitoring-specialist |

## Project Context

**Tech Stack:**
- Backend: Node.js 20, Express 5, TypeScript 5.9
- Database: PostgreSQL + Prisma ORM
- Cache: Redis (ioredis)
- Mobile: React Native + Expo 54
- Real-time: Socket.IO 4.8
- Auth: Firebase Admin SDK + JWT
- Payments: Razorpay
- Storage: Azure Blob Storage
- RTC: Agora.io

**Project Status:** Backend 92% | Mobile 35% | Overall 67%
