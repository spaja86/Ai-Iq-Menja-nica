# Crypto Exchange Mobile - Development Guide

## 🎯 Getting Started for Developers

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 13+ and CocoaPods
- Android: Android Studio and JDK 11+

### First-Time Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

## 🏗️ Architecture Overview

### State Management
We use **Zustand** for lightweight state management:

```typescript
// Example: Auth Store
const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  login: async (credentials) => {
    const result = await api.login(credentials);
    set({ user: result.user, isAuthenticated: true });
  },
}));
```

### API Layer
All API calls go through `services/api.ts`:
- Automatic token refresh
- Request/response interceptors
- Error handling
- Type-safe responses

### Navigation
React Navigation v6 with:
- Stack Navigator for auth flow
- Bottom Tab Navigator for main app
- Type-safe navigation params

### Security
- Tokens stored in expo-secure-store (encrypted)
- Biometric authentication via expo-local-authentication
- HTTPS-only API calls
- No sensitive data in AsyncStorage

## 📝 Coding Standards

### TypeScript
- All components must have proper type definitions
- Use interfaces for props and state
- Avoid `any` type unless absolutely necessary
- Export types from `types/index.ts`

### Component Structure
```typescript
// Preferred pattern
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

### Hooks
- Use custom hooks for reusable logic
- Follow React hooks rules
- Place in `hooks/` directory

### Styling
- Use StyleSheet.create for performance
- Follow mobile-first approach
- Consistent spacing: 4, 8, 12, 16, 20, 24px
- Color palette defined in theme

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (TODO)
- Detox for iOS/Android
- Playwright for web

### Test Coverage
```bash
npm test -- --coverage
```

## 🚀 Build & Deploy

### Development Build
```bash
# iOS
expo build:ios -t simulator

# Android
expo build:android -t apk
```

### Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### OTA Updates
```bash
# Publish update without rebuild
eas update --branch production --message "Bug fixes"
```

## 📱 Platform-Specific Notes

### iOS
- Face ID requires `NSFaceIDUsageDescription` in app.json
- Test on multiple device sizes
- Check safe area insets

### Android
- Test on different API levels (21-33)
- Verify permissions in AndroidManifest
- Test with/without Google Play Services

## 🐛 Debugging

### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Use
Enable "Debug Remote JS" in dev menu
```

### Flipper
- Network inspector
- Layout inspector
- Redux DevTools (if using Redux)

### Common Issues

**Metro bundler cache**
```bash
npm start -- --clear
```

**Watchman issues**
```bash
watchman watch-del-all
```

**CocoaPods issues**
```bash
cd ios && pod install --repo-update
```

## 🔐 Security Checklist

- [ ] No hardcoded API keys
- [ ] Environment variables in .env (gitignored)
- [ ] Sensitive data in secure-store only
- [ ] SSL certificate pinning (production)
- [ ] Biometric auth for sensitive actions
- [ ] Input validation on all forms
- [ ] XSS prevention in WebViews
- [ ] Secure deep links

## 📊 Performance Optimization

### Images
- Use optimized image formats
- Implement lazy loading
- Cache with expo-image

### Lists
- Use FlatList with `getItemLayout`
- Implement pagination
- Virtual scrolling for long lists

### Network
- Cache API responses
- Implement request debouncing
- Use WebSockets for real-time data

### Bundle Size
```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Reduce bundle
- Tree shaking
- Code splitting
- Remove unused dependencies
```

## 🎨 Design System

### Colors
```typescript
const colors = {
  primary: '#0066FF',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  text: '#1A1A1A',
  textSecondary: '#666',
  background: '#F5F5F5',
  white: '#FFF',
};
```

### Typography
- Titles: 24-32px, bold
- Headings: 18-20px, semi-bold
- Body: 14-16px, regular
- Caption: 12px, regular

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- xxl: 24px

## 🔄 Git Workflow

### Branch Naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix`

### Commit Messages
```
feat: Add biometric authentication
fix: Resolve login token refresh issue
docs: Update README with setup instructions
style: Format code with prettier
refactor: Simplify order form logic
test: Add unit tests for auth service
```

### Pull Request Template
1. Description of changes
2. Related issues
3. Testing performed
4. Screenshots (if UI changes)
5. Breaking changes (if any)

## 📚 Resources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

### Tools
- [React Native Directory](https://reactnative.directory/)
- [Expo Snack](https://snack.expo.dev/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)

---

**Happy Coding! 🚀**
