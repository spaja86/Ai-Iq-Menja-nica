# Changelog

All notable changes to the Crypto Exchange Mobile App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Crypto Exchange Mobile App
- User authentication with email/password
- Biometric authentication support (Face ID/Fingerprint)
- Real-time market data and price updates
- Trading interface with multiple order types
- Wallet management with multi-asset support
- Deposit and withdrawal functionality
- Transaction history tracking
- Push notifications for trades and alerts
- Settings and preferences management
- Dark mode support (planned)
- Internationalization support (planned)

### Security
- Secure token storage with expo-secure-store
- Automatic token refresh
- Session timeout handling
- Biometric authentication for sensitive operations

### Features by Screen

#### Login/Register
- Email and password authentication
- Username creation
- Password strength validation
- Terms of service agreement
- Biometric authentication option

#### Dashboard
- Total portfolio value display
- 24h change tracking
- Quick actions (Deposit, Withdraw, Trade, History)
- Market overview with top gainers/losers
- Top assets display

#### Trade
- Trading pair selection
- Real-time price updates
- Order type selection (Limit, Market)
- Buy/Sell interface
- Order quantity and price input
- Market statistics (24h High, Low, Volume)
- Percentage-based quantity selection

#### Wallet
- Multi-asset balance display
- Total portfolio value
- Quick deposit/withdraw actions
- Asset-specific actions
- Recent transaction history
- Transaction status tracking
- Filter for zero balances

#### Settings
- Profile management
- KYC verification status
- Email and phone verification
- Security settings (Password, 2FA, Biometric)
- Notification preferences
- Theme selection
- Language and currency selection
- Help and support access
- Terms and privacy policy links

### Technical
- React Native 0.73.2
- Expo SDK 50
- TypeScript for type safety
- Zustand for state management
- React Navigation v6
- Axios for API calls
- expo-local-authentication for biometrics
- expo-notifications for push notifications
- expo-secure-store for encrypted storage

### Known Issues
- None at initial release

### Planned Features
- Advanced trading charts
- Price alerts
- Staking functionality
- NFT marketplace integration
- Referral program
- Advanced analytics
- Social trading features

---

## How to Update

### For Users
1. Check the App Store or Google Play Store for updates
2. Enable automatic updates for seamless experience

### For Developers
1. Pull latest changes from repository
2. Run `npm install` to update dependencies
3. Check migration guides for breaking changes
4. Test thoroughly before deploying

---

**Note**: This changelog will be updated with each release. Please check regularly for updates and new features.
