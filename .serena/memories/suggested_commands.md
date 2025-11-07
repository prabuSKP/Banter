# Banter - Suggested Commands

## Windows System Commands

Since this project is developed on Windows, use these commands:

### File Operations
- `dir` - List directory contents (instead of `ls`)
- `findstr` - Search in files (instead of `grep`)
- `type` - Display file contents (instead of `cat`)
- `cd` - Change directory
- `mkdir` - Create directory
- `del` - Delete file
- `rmdir` - Remove directory

### Git Commands
- `git status` - Check repository status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git push` - Push to remote
- `git pull` - Pull from remote
- `git branch` - List/manage branches
- `git checkout` - Switch branches

## Backend Development Commands

### Setup
```bash
cd backend
npm install
```

### Environment Setup
```bash
# Copy and edit environment file
copy .env.example .env
# Edit .env with your credentials
```

### Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Development
```bash
# Start development server (with hot reload via nodemon)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/integration/auth.test.ts

# Run tests in watch mode
npx jest --watch

# Run with verbose output
npx jest --verbose
```

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database (if seed script exists)
npx prisma db seed
```

## Mobile Development Commands

### Setup
```bash
cd mobile
npm install --legacy-peer-deps
```

### Environment Setup
```bash
# Create .env file and add:
EXPO_PUBLIC_API_URL=http://your-backend-url:5000
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_AGORA_APP_ID=your_app_id
# ... other variables
```

### Development
```bash
# Start Expo development server
npm start

# Start for Android
npm run android

# Start for iOS
npm run ios

# Start web version
npm run web
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Expo Specific
```bash
# Clear Expo cache
npx expo start -c

# Update Expo SDK
npx expo install --fix

# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios
```

## Common Development Workflows

### Starting Development (Full Stack)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

### After Database Schema Changes

```bash
cd backend
npx prisma migrate dev --name describe_changes
npm run prisma:generate
```

### Running Tests Before Commit

```bash
# Backend tests
cd backend
npm test

# Mobile tests
cd mobile
npm test
```

### Checking Logs

Backend logs are stored in `backend/logs/` directory:
```bash
# Windows
type backend\logs\combined.log
type backend\logs\error.log

# View latest logs
powershell -command "Get-Content backend\logs\combined.log -Tail 50"
```

## Troubleshooting Commands

### Backend Issues

```bash
# Clear node_modules and reinstall
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Reset database
npx prisma migrate reset

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

### Mobile Issues

```bash
# Clear cache and reinstall
cd mobile
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps

# Clear Expo cache
npx expo start -c

# Reset Metro bundler cache
npx expo start --clear
```

### Redis Issues

```bash
# Check Redis connection (if installed locally)
redis-cli ping

# Connect to Redis CLI
redis-cli
```

### PostgreSQL Issues

```bash
# Connect to database (if psql is installed)
psql -h localhost -U username -d banter_db

# Check if PostgreSQL is running
sc query postgresql
```

## Production Deployment

### Backend Build and Deploy

```bash
cd backend
npm run build
# Deploy dist/ folder to Azure App Service
```

### Mobile Build

```bash
cd mobile
# For internal testing
npx expo build:android
npx expo build:ios

# For production (with EAS)
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

## Performance and Monitoring

### Check App Status
```bash
# Backend health check
curl http://localhost:5000/health

# API health check
curl http://localhost:5000/api/v1/health
```

### Monitor Logs (Development)
- Backend logs automatically output to console with Winston
- Check `backend/logs/` for persistent logs

## Package Management

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update package
npm update package-name

# Update all packages (use with caution)
npm update

# Audit security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

## Code Quality (Manual)

Currently no automated linting, but TypeScript provides type checking:

```bash
# Backend type check
cd backend
npx tsc --noEmit

# Mobile type check  
cd mobile
npx tsc --noEmit
```

## Documentation Generation

### View Database Schema Visualization
```bash
cd backend
npx prisma studio
# Opens browser at http://localhost:5555
```

## Firebase Management

Firebase setup requires manual web console configuration:
- Go to Firebase Console (https://console.firebase.google.com)
- Enable Phone Authentication
- Download config files for mobile app
