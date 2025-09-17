# Charged Admin Dashboard

A modern React-based admin dashboard for the Charged ride-sharing platform, built with TypeScript and Material-UI.

## 🚀 Features

- **Dashboard Overview**: Real-time analytics and key metrics
- **Rider Management**: Complete rider profile and ride history management
- **Driver Management**: Driver profiles, documents, and performance tracking
- **Promotions System**: Create and manage marketing campaigns
- **Referral Programs**: Track and manage referral rewards
- **Business Accounts**: Corporate account management
- **Scheduled Rides**: Future ride scheduling and management
- **Tips Management**: Driver tip tracking and analytics
- **Rewards System**: Loyalty program management

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **State Management**: React Context
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Jest + Playwright
- **Build Tool**: Create React App

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd charged-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Testing

- **Unit Tests**: `npm test`
- **E2E Tests**: `npm run e2e`
- **Accessibility Tests**: `npm run a11y`
- **Performance Tests**: `npm run perf`
- **Coverage Report**: `npm run test:cov`

## 🏗️ Build & Deploy

- **Production Build**: `npm run build`
- **Lint Code**: `npm run lint`
- **Type Check**: `npm run typecheck`
- **Format Code**: `npm run format`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── API/                # API integration layer
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── firebase/           # Firebase configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_URL=https://api.charged.autos
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
```

### Firebase Setup

The app uses Firebase for authentication. Configure your Firebase project in `src/firebase/firebaseConfig.ts`.

## 🎨 UI Components

The dashboard uses Material-UI components with a custom theme:

- **Primary Color**: Blue (#1976d2)
- **Secondary Color**: Pink (#f50057)
- **Typography**: System fonts with fallbacks
- **Responsive Design**: Mobile-first approach

## 📊 API Integration

The app integrates with the Charged API with automatic fallback to mock data for local development:

- **Production API**: `https://api.charged.autos`
- **Mock Data**: Available for all endpoints when API is unavailable
- **Error Handling**: Graceful degradation with user-friendly messages

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run unit tests
- `npm run e2e` - Run end-to-end tests
- `npm run lint` - Lint code
- `npm run typecheck` - Type check
- `npm run format` - Format code

## 📝 Development Notes

- **Mock Data**: The app automatically falls back to mock data when the API is unavailable
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Testing**: Comprehensive test suite with unit, integration, and E2E tests
- **Accessibility**: WCAG 2.1 AA compliant components
- **Performance**: Optimized bundle size and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software for Charged ride-sharing platform.

---

**Built with ❤️ for the Charged team**