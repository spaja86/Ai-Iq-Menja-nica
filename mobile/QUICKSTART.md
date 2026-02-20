# 🚀 Crypto Exchange Mobile - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
```

### 2. Install Expo CLI
```bash
npm install -g expo-cli
```

### 3. Setup Project
```bash
cd mobile
npm install
cp .env.example .env
```

### 4. Start Development Server
```bash
npm start
```

### 5. Run on Device
- **Option A**: Scan QR code with Expo Go app
- **Option B**: Press `i` for iOS simulator
- **Option C**: Press `a` for Android emulator

## 📱 Test the App

### Test Credentials (Development)
```
Email: demo@cryptoexchange.com
Password: Demo123!
```

## 🎯 What You Can Do

✅ **Login/Register** with email or biometric auth  
✅ **View Dashboard** with portfolio overview  
✅ **Trade** crypto with market/limit orders  
✅ **Manage Wallet** with deposits/withdrawals  
✅ **Configure Settings** and notifications  

## 🛠️ Development Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📂 Project Structure

```
mobile/
├── screens/          # UI screens
├── navigation/       # Navigation setup
├── hooks/           # Custom hooks (useAuth, useApi)
├── services/        # API service layer
├── types/           # TypeScript definitions
├── components/      # Reusable components
├── utils/           # Helper functions
└── App.tsx          # Root component
```

## 🔑 Key Features

### Authentication
- Email/password login & registration
- Biometric authentication (Face ID/Fingerprint)
- Automatic token refresh
- Secure storage with expo-secure-store

### Trading
- Real-time market data
- Multiple order types (Market, Limit)
- Order book visualization
- Trade history

### Wallet
- Multi-asset support
- Deposit & withdrawal
- Transaction history
- Real-time balance updates

### Security
- Encrypted token storage
- Session timeout
- Biometric authentication
- 2FA support

## 🎨 UI Highlights

- **Modern Design**: Clean, intuitive interface
- **Responsive**: Works on all screen sizes
- **Fast**: Optimized performance
- **Accessible**: Follows accessibility guidelines

## 🔧 Configuration

### API Endpoint
Update `.env`:
```bash
API_BASE_URL=https://your-api-url.com
WS_URL=wss://your-api-url.com/ws
```

### Push Notifications
- Automatically requested on first launch
- Configure in Settings screen
- Test with local notifications

### Biometric Auth
- Automatically detected on supported devices
- Enable in Settings > Security
- Works with Face ID & Fingerprint

## 📚 Next Steps

1. **Read Documentation**: Check [README.md](./README.md)
2. **Development Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **API Integration**: Connect to your backend API
4. **Customize**: Modify themes in `utils/theme.ts`
5. **Deploy**: Build for iOS/Android

## 🐛 Troubleshooting

**Metro bundler issues?**
```bash
npm start -- --clear
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS build failing?**
```bash
cd ios && pod install && cd ..
```

**Android build failing?**
```bash
cd android && ./gradlew clean && cd ..
```

## 💡 Pro Tips

- Use Expo Go for fast development
- Enable Fast Refresh for instant updates
- Use TypeScript for better code quality
- Test on both iOS and Android
- Keep dependencies updated

## 📞 Need Help?

- 📖 [Documentation](./README.md)
- 💬 [Expo Discord](https://chat.expo.dev/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 📧 support@cryptoexchange.com

---

**Happy Building! 🎉**

Made with ❤️ using React Native & Expo
