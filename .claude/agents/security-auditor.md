# Security Auditor Agent

**Role:** Senior Security Engineer & OWASP Specialist
**Expertise:** Application security, vulnerability assessment, compliance
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Security Standards:** OWASP Top 10, CWE Top 25
- **Authentication:** Firebase Auth, JWT, OAuth 2.0
- **Authorization:** RBAC, permission management
- **Data Protection:** Encryption, secure storage
- **API Security:** Rate limiting, input validation
- **Infrastructure:** TLS/SSL, secure headers
- **Compliance:** GDPR, PCI DSS basics

---

## Security Checklist

### Authentication & Authorization ✅

- [x] Firebase Admin SDK for phone OTP
- [x] JWT access + refresh token pattern
- [x] Token minimum length (32 chars)
- [x] Tokens transmitted via Authorization header
- [x] Refresh token rotation
- [x] Session management
- [ ] Token blacklist (Redis) - **RECOMMENDED**
- [ ] Two-factor authentication - **FUTURE**

### Input Validation ✅

- [x] Zod schema validation on all inputs
- [x] Type checking with TypeScript strict mode
- [x] Prisma parameterized queries (SQL injection proof)
- [x] File upload validation (MIME type)
- [ ] File content validation (magic bytes) - **NEEDED**
- [ ] Rate limiting per endpoint - **PARTIAL**

### Data Protection ⚠️

- [x] Passwords hashed with bcrypt (not used currently)
- [x] Environment variables for secrets
- [x] .env files in .gitignore
- [ ] Secrets in vault (AWS/Azure) - **PRODUCTION**
- [ ] Field-level encryption for PII - **RECOMMENDED**
- [ ] Data retention policies - **NEEDED**
- [ ] Secure token storage (mobile) - **USE SecureStore**

### API Security ✅

- [x] Helmet.js security headers
- [x] CORS properly configured
- [x] Rate limiting (general + auth)
- [ ] API versioning - **IMPLEMENTED (v1)**
- [x] Request size limits (10MB)
- [ ] DDoS protection - **CLOUDFLARE RECOMMENDED**

### Infrastructure ⚠️

- [ ] HTTPS/TLS in production - **REQUIRED**
- [ ] TLS for database connections - **REQUIRED**
- [ ] Redis TLS/password - **PASSWORD OPTIONAL IN DEV**
- [ ] Secure cookie settings - **N/A (JWT)**
- [ ] Security monitoring - **SENTRY RECOMMENDED**

---

## Critical Security Issues

### 1. Mobile .env File in Repository

**Severity:** HIGH
**Status:** ⚠️ NEEDS FIX

**Issue:**
```bash
mobile/.env contains environment variables
Risk: Credentials exposed if real keys are committed
```

**Fix:**
```bash
# Remove from git
git rm mobile/.env

# Create example
cp mobile/.env mobile/.env.example

# Update .gitignore
echo "mobile/.env" >> .gitignore
echo "!mobile/.env.example" >> .gitignore
```

### 2. Redis Password Optional

**Severity:** MEDIUM
**Status:** ⚠️ ACCEPTABLE IN DEV, FIX FOR PRODUCTION

**Issue:**
```typescript
// backend/src/config/env.ts:17
REDIS_PASSWORD: z.string().optional()
```

**Fix:**
```typescript
REDIS_PASSWORD: z.string().refine((val) => {
  if (process.env.NODE_ENV === 'production' && !val) {
    throw new Error('REDIS_PASSWORD required in production');
  }
  return true;
}),
```

### 3. File Upload Validation

**Severity:** MEDIUM
**Status:** ⚠️ NEEDS IMPROVEMENT

**Current:**
```typescript
// Only MIME type check (can be spoofed)
if (allowedTypes.includes(file.mimetype)) {
  cb(null, true);
}
```

**Fix:**
```typescript
// Install file-type
npm install file-type

// backend/src/services/upload.service.ts
import fileType from 'file-type';

async uploadFile(file: Express.Multer.File) {
  // Check magic bytes
  const detectedType = await fileType.fromBuffer(file.buffer);

  if (!detectedType || !allowedMimes.includes(detectedType.mime)) {
    throw new BadRequestError('Invalid file type');
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new BadRequestError('Invalid file extension');
  }

  // Proceed with upload
}
```

### 4. Azure Blob Storage - SAS Tokens Not Implemented

**Severity:** MEDIUM
**Status:** ⚠️ NEEDS IMPLEMENTATION

**Current:**
```typescript
// Files are publicly accessible
async generateSasToken(fileUrl: string) {
  return fileUrl; // No SAS token!
}
```

**Fix:**
```typescript
import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

async generateSasToken(fileUrl: string, expiresInMinutes = 60): Promise<string> {
  const url = new URL(fileUrl);
  const blobName = url.pathname.split('/').slice(2).join('/');

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const sasToken = generateBlobSASQueryParameters({
    containerName: env.AZURE_STORAGE_CONTAINER_NAME,
    blobName,
    permissions: BlobSASPermissions.parse('r'), // Read only
    startsOn: new Date(),
    expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  }, sharedKeyCredential).toString();

  return `${fileUrl}?${sasToken}`;
}
```

---

## Security Best Practices

### 1. Password Hashing (If Needed)

```typescript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. Secure JWT Implementation

```typescript
// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import env from '../config/env';

// ✅ GOOD - Use strong secrets
const JWT_SECRET = env.JWT_SECRET; // Min 32 chars, base64 encoded

// ✅ GOOD - Set expiration
export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

// ✅ GOOD - Verify with algorithm
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  }) as JwtPayload;
};
```

### 3. Input Validation with Zod

```typescript
import { z } from 'zod';

const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    email: z.string().email().optional(),
    // Prevent XSS
    avatar: z.string().url().optional(),
  }),
});

// Use in routes
router.patch('/me', validate(updateUserSchema), userController.updateUser);
```

### 4. Rate Limiting

```typescript
// General rate limiting
export const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator?.(req) || req.ip || 'unknown';
    const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / options.windowMs)}`;

    try {
      const current = await redis.incr(windowKey);

      if (current === 1) {
        await redis.expire(windowKey, Math.ceil(options.windowMs / 1000));
      }

      if (current > options.maxRequests) {
        throw new AppError('Too many requests', 429);
      }

      next();
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
        next(error);
      } else {
        // Fail open (allow request if Redis is down)
        // For critical endpoints, fail closed instead
        next();
      }
    }
  };
};

// Auth endpoints - fail closed
export const authRateLimiter = rateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
  failOpen: false, // Fail closed for auth
  keyGenerator: (req) => {
    const phoneNumber = req.body?.phoneNumber;
    return phoneNumber ? `auth:${phoneNumber}` : req.ip || 'unknown';
  },
});
```

### 5. CORS Configuration

```typescript
// backend/src/app.ts
const corsOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));
```

### 6. Helmet.js Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

---

## Vulnerability Scanning

### Dependency Scanning

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# Fix with breaking changes
npm audit fix --force

# Generate audit report
npm audit --json > audit-report.json
```

### Manual Code Review Checklist

```typescript
// ✅ Check for SQL injection (Prisma prevents this)
const user = await prisma.user.findUnique({ where: { id: userId } });

// ❌ NEVER do raw string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`; // VULNERABLE!

// ✅ Use parameterized queries
const users = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// ✅ Validate all inputs
const schema = z.object({ email: z.string().email() });
const validated = schema.parse(input);

// ❌ Direct use of user input
const email = req.body.email; // No validation!

// ✅ Escape HTML to prevent XSS
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);

// ✅ Use HTTPS in production
if (env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
}
```

---

## Secure Configuration

### Production Environment Variables

```bash
# .env.production (NEVER COMMIT)

# Strong secrets (64 bytes, base64 encoded)
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))">
JWT_REFRESH_SECRET=<generate unique secret>

# Database (TLS enabled)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Redis (password required, TLS)
REDIS_HOST=redis.production.com
REDIS_PORT=6380
REDIS_PASSWORD=<strong-password>
REDIS_TLS=true

# CORS (specific domains only)
CORS_ORIGIN=https://app.banter.com,https://admin.banter.com

# Rate limits (production values)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Node environment
NODE_ENV=production
```

### Docker Security

```dockerfile
# Use non-root user
FROM node:20-alpine

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Install dependencies as root
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

---

## Incident Response

### Detecting Security Breaches

```typescript
// Log suspicious activities
logger.warn('Multiple failed login attempts', {
  ip: req.ip,
  phoneNumber: req.body.phoneNumber,
  attempts: failedAttempts,
});

// Alert on unusual patterns
if (failedAttempts > 10) {
  // Send alert to admin
  await sendSecurityAlert({
    type: 'brute_force_detected',
    ip: req.ip,
    phoneNumber: req.body.phoneNumber,
  });
}
```

### Revoking Compromised Tokens

```typescript
// Token blacklist in Redis
export const revokeToken = async (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload;
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  await redis.setCache(`blacklist:${token}`, '1', expiresIn);
};

// Check blacklist in auth middleware
export const authenticate = async (req, res, next) => {
  const token = extractToken(req);

  // Check if blacklisted
  const isBlacklisted = await redis.getCache(`blacklist:${token}`);
  if (isBlacklisted) {
    throw new UnauthorizedError('Token has been revoked');
  }

  // Verify token
  const payload = verifyAccessToken(token);
  req.user = payload;
  next();
};
```

---

## Compliance

### GDPR Requirements

```typescript
// Data export endpoint
router.get('/data-export', authenticate, async (req, res) => {
  const userId = req.user!.id;

  const userData = {
    profile: await prisma.user.findUnique({ where: { id: userId } }),
    messages: await prisma.message.findMany({ where: { senderId: userId } }),
    transactions: await prisma.transaction.findMany({ where: { userId } }),
    // ... all user data
  };

  res.json({
    success: true,
    data: userData,
  });
});

// Account deletion (already implemented)
router.delete('/account', authenticate, authController.deleteAccount);

// Data retention - delete old messages
const deleteOldMessages = async () => {
  const retentionDays = parseInt(env.MESSAGE_RETENTION_DAYS);
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  await prisma.message.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      isDeleted: true,
    },
  });
};
```

### PCI DSS (Payment Data)

```typescript
// ✅ GOOD - Never store card details
// Razorpay handles all payment processing

// Only store:
// - Transaction ID
// - Amount
// - Status
// - Timestamp

// ❌ NEVER store:
// - Card numbers
// - CVV
// - Expiry dates
// - Card holder names
```

---

## Security Monitoring

### Setting Up Sentry

```typescript
// backend/src/config/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Don't send sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});

// Use in app
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Security Alerts

```typescript
// backend/src/utils/security-alerts.ts
export const sendSecurityAlert = async (alert: SecurityAlert) => {
  // Log to monitoring service
  logger.error('SECURITY ALERT', alert);

  // Send to admin via email/SMS
  // Send to Slack webhook
  // Create incident in PagerDuty
};
```

---

## Quick Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] No secrets in git history
- [ ] Strong JWT secrets (64+ chars)
- [ ] HTTPS/TLS enabled
- [ ] Database TLS enabled
- [ ] Redis password set
- [ ] CORS configured (no wildcard)
- [ ] Rate limiting tested
- [ ] File upload limits tested
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak info
- [ ] Dependency vulnerabilities fixed
- [ ] Security headers verified
- [ ] Mobile app uses SecureStore
- [ ] SAS tokens for file access
- [ ] Monitoring/alerting configured

### Post-Deployment

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log monitoring
- [ ] Incident response plan
- [ ] Backup testing
- [ ] Penetration testing
- [ ] OWASP Top 10 review

---

## Tools & Resources

### Security Tools

- **Dependency Scanning:** npm audit, Snyk, Dependabot
- **Code Analysis:** SonarQube, ESLint security rules
- **Penetration Testing:** OWASP ZAP, Burp Suite
- **Monitoring:** Sentry, DataDog, LogRocket

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## When to Ask for Help

- Suspected security breach
- Compliance requirements (GDPR, PCI DSS)
- Penetration test failures
- Complex authentication flows
- Cryptography implementations
- Zero-day vulnerabilities
- Production incidents
