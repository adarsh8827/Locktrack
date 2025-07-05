# Deployment Guide - Excise MIA

## Development Environment

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Git for version control

### Local Development Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd excise-mia-app
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Access the App**
- Web: Opens automatically in browser
- iOS: Use Expo Go app or iOS Simulator
- Android: Use Expo Go app or Android Emulator

## Production Deployment

### Web Deployment

#### Option 1: Netlify (Recommended)
```bash
# Build for web
npm run build:web

# Deploy to Netlify
# Upload the dist folder to Netlify
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Mobile App Deployment

#### iOS App Store

1. **Setup EAS Build**
```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. **Configure app.json**
```json
{
  "expo": {
    "name": "Excise MIA",
    "slug": "excise-mia",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.excisemia",
      "buildNumber": "1"
    }
  }
}
```

3. **Build for iOS**
```bash
eas build --platform ios
```

4. **Submit to App Store**
```bash
eas submit --platform ios
```

#### Google Play Store

1. **Configure Android Settings**
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.excisemia",
      "versionCode": 1
    }
  }
}
```

2. **Build for Android**
```bash
eas build --platform android
```

3. **Submit to Google Play**
```bash
eas submit --platform android
```

## Firebase Setup (Production)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication and Firestore

### 2. Configure Authentication
```javascript
// Enable Email/Password authentication
// Configure authorized domains
// Set up security rules
```

### 3. Setup Firestore Database
```javascript
// Create collections: users, locks, schedules, trips, remarks
// Configure security rules
// Set up indexes for queries
```

### 4. Update Configuration
```typescript
// config/firebase.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 5. Environment Variables
```bash
# .env.production
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## Security Configuration

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Locks - role-based access
    match /locks/{lockId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Schedules - admin only
    match /schedules/{scheduleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
  }
}
```

### Authentication Rules
```javascript
// Only allow email/password authentication
// Require email verification (optional)
// Set password requirements
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load screens
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));
```

### Image Optimization
```typescript
// Use optimized image formats
// Implement lazy loading for images
// Use appropriate image sizes
```

### Bundle Optimization
```bash
# Analyze bundle size
npx expo export --dump-assetmap

# Optimize dependencies
npm audit
npm update
```

## Monitoring & Analytics

### Error Tracking
```typescript
// Implement error boundary
// Set up crash reporting
// Monitor API errors
```

### Performance Monitoring
```typescript
// Track app performance
// Monitor load times
// Track user interactions
```

## Backup & Recovery

### Database Backup
```bash
# Automated Firestore backups
# Regular data exports
# Version control for configurations
```

### Disaster Recovery Plan
1. Database restoration procedures
2. App rollback strategies
3. User communication plan

## Maintenance

### Regular Updates
- Security patches
- Dependency updates
- Feature enhancements
- Bug fixes

### Monitoring Checklist
- [ ] App performance metrics
- [ ] Error rates and crashes
- [ ] User feedback and reviews
- [ ] Security vulnerabilities
- [ ] Database performance