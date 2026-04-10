# Crypto Exchange Mobile App

A production-ready React Native mobile application for cryptocurrency trading, built with Expo and TypeScript.

## 🚀 Features

- **Authentication & Security**
  - Email/Password authentication
  - Biometric authentication (Face ID / Fingerprint)
  - Two-factor authentication support
  - Secure token storage with expo-secure-store

- **Trading**
  - Real-time market data
  - Multiple order types (Market, Limit, Stop-Limit)
  - Order book visualization
  - Trade history
  - Price charts

- **Wallet Management**
  - Multi-asset wallet
  - Deposit & withdrawal functionality
  - Transaction history
  - Real-time balance updates

- **User Experience**
  - Clean, modern UI design
  - Dark mode support
  - Push notifications
  - Offline support
  - Pull-to-refresh functionality

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app (for physical device testing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API configuration:
   ```
   API_BASE_URL=https://api.cryptoexchange.com
   WS_URL=wss://api.cryptoexchange.com/ws
   ```

## 🏃 Running the App

### Development Mode

```bash
# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

### Using Expo Go

1. Install Expo Go on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## 📁 Project Structure

```
mobile/
├── screens/              # Screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── TradeScreen.tsx
│   ├── WalletScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/           # Navigation configuration
│   └── AppNavigator.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   └── useApi.ts
├── services/            # API services
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── components/          # Reusable components
├── contexts/            # React contexts
├── utils/               # Utility functions
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Configuration

### API Configuration

Update the API base URL in `.env`:
```
API_BASE_URL=https://your-api-url.com
```

### Push Notifications

1. Configure your Expo project:
   ```bash
   expo build:ios
   expo build:android
   ```

2. Update `app.json` with your notification settings

### Biometric Authentication

Biometric authentication is automatically detected and enabled on supported devices. Configure permissions in `app.json`:

**iOS (Face ID)**:
```json
"infoPlist": {
  "NSFaceIDUsageDescription": "We use Face ID to secure your account"
}
```

**Android (Fingerprint)**:
```json
"permissions": [
  "USE_BIOMETRIC",
  "USE_FINGERPRINT"
]
```

## 📱 Building for Production

### iOS

1. **Configure app signing**
   ```bash
   expo build:ios
   ```

2. **Follow Expo prompts** to configure your Apple Developer account

3. **Download IPA** when build completes

### Android

1. **Generate keystore** (first time only)
   ```bash
   expo build:android -t app-bundle
   ```

2. **Follow Expo prompts** for keystore configuration

3. **Download AAB** for Play Store upload

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint

# Format code
npm run format
```

## 🔒 Security Best Practices

1. **Never commit sensitive data**
   - Keep `.env` files out of version control
   - Use environment variables for API keys

2. **Secure storage**
   - Sensitive data is stored using expo-secure-store
   - Tokens are encrypted at rest

3. **Network security**
   - All API calls use HTTPS
   - SSL certificate pinning (recommended for production)

4. **Authentication**
   - JWT tokens with automatic refresh
   - Biometric authentication for quick access
   - 2FA support for enhanced security

## 📚 Key Dependencies

- **React Native**: Mobile framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **Zustand**: State management
- **Axios**: HTTP client
- **expo-local-authentication**: Biometric auth
- **expo-notifications**: Push notifications
- **expo-secure-store**: Secure storage

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
# Clear cache and restart
npx expo start -c
```

**iOS build fails**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

**Android build fails**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

**Module not found**
```bash
rm -rf node_modules
npm install
```

## 📖 API Documentation

The app expects the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### Market Data
- `GET /market/pairs` - Get trading pairs
- `GET /market/orderbook/:symbol` - Get order book
- `GET /market/trades/:symbol` - Get recent trades
- `GET /market/klines/:symbol` - Get candlestick data

### Trading
- `POST /trading/orders` - Create order
- `GET /trading/orders` - Get user orders
- `DELETE /trading/orders/:id` - Cancel order

### Wallet
- `GET /wallet/balances` - Get balances
- `GET /wallet/transactions` - Get transactions
- `GET /wallet/deposit-address/:asset` - Get deposit address
- `POST /wallet/withdraw` - Withdraw funds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For support, email support@cryptoexchange.com or join our Discord channel.

## 🚀 Deployment

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📱 App Store Optimization

### Screenshots
Prepare screenshots for:
- iPhone (6.5", 5.5")
- iPad (12.9", 11")
- Android (Phone, Tablet)

### App Store Connect
1. Create app in App Store Connect
2. Upload build via Transporter or EAS
3. Fill in metadata
4. Submit for review

### Google Play Console
1. Create app in Play Console
2. Upload AAB via console or EAS
3. Fill in store listing
4. Submit for review

## 🔄 Updates & Maintenance

### Over-the-Air (OTA) Updates
```bash
# Publish update without new build
expo publish

# With EAS Update
eas update --branch production
```

### Version Management
Update version in:
- `app.json` (expo.version)
- `package.json` (version)

## 📊 Analytics & Monitoring

Consider integrating:
- Firebase Analytics
- Sentry (error tracking)
- Amplitude (user analytics)
- Firebase Crashlytics

## 🌐 Internationalization

The app supports internationalization. To add new languages:

1. Install i18n library
2. Create translation files
3. Configure language picker in settings

---

**Built with ❤️ using React Native & Expo**
