# Namada Analytics Dashboard

A comprehensive, real-time analytics dashboard for the Namada blockchain with a nostalgic Windows 95 interface. Monitor network metrics, privacy analytics, governance, and cross-chain activities with advanced visualization and alerting capabilities.

![Namada Analytics Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

### Phase 1: Core Network Analytics ✅
- **Real-time Network Statistics**: Block height, epoch, validator count
- **Validator Performance**: Voting power, commission rates, uptime
- **Live Data Polling**: Configurable update intervals (5s - 60s)
- **Windows 95 UI**: Authentic retro interface with minimize/maximize functionality
- **Responsive Design**: Works on desktop and mobile devices

### Phase 2: Advanced Visualizations ✅
- **Time Series Charts**: Historical data with Chart.js integration
- **Interactive Controls**: Timeframe selection, moving averages, trend lines
- **Data Export**: CSV/JSON export functionality
- **Validator Explorer**: Detailed validator information with search and filtering
- **Cross-Chain Analytics**: IBC transfers and bridge activity monitoring
- **Local Storage**: Data persistence and configurable retention

### Phase 3: Advanced Analytics ✅
- **Privacy Metrics (MASP Analytics)**: 
  - Anonymity set size tracking
  - Shielded balance monitoring
  - Privacy transaction analysis
  - Multi-asset shielded pool metrics
- **Governance Dashboard**:
  - Proposal tracking and voting
  - Participation rate analysis
  - Real-time governance statistics
  - Proposal details and voting history
- **Custom Alert System**:
  - Configurable alert conditions
  - Multiple notification methods (browser, email, webhook)
  - Real-time alert monitoring
  - Alert history and statistics
- **Comprehensive API**:
  - RESTful endpoints for all data
  - Webhook support
  - Subscription management
  - Real-time data access

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Windows 95 theme
- **Charts**: Chart.js with react-chartjs-2
- **Data Management**: Custom time series store with localStorage
- **API**: Next.js API routes with comprehensive endpoints
- **Deployment**: Vercel-ready with optimized build

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/namada-analytics-dashboard.git
   cd namada-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Dashboard Overview
The dashboard is organized into several key sections:

1. **Network Statistics Card**: Real-time block height, epoch, and validator count
2. **Validator Statistics Card**: Voting power, active validators, and performance metrics
3. **Time Series Charts**: Historical data visualization with interactive controls
4. **Privacy Metrics**: MASP analytics and anonymity set monitoring
5. **Governance Dashboard**: Proposal tracking and voting participation
6. **Alert System**: Custom alerts and notification management
7. **Validator Explorer**: Detailed validator information and search
8. **Cross-Chain Analytics**: IBC transfers and bridge activity

### Key Features

#### Real-time Data Polling
- Configure polling intervals from 5 seconds to 60 seconds
- Automatic data persistence with localStorage
- Configurable data retention periods

#### Interactive Charts
- Multiple timeframes (1h, 24h, 7d, 30d)
- Moving averages and trend lines
- Zoom and pan capabilities
- Export functionality (CSV/JSON)

#### Privacy Analytics
- Monitor anonymity set size over time
- Track shielded balance and transactions
- Analyze privacy transaction types (shield/unshield/transfer)
- Privacy level assessment

#### Governance Tracking
- View active, passed, and rejected proposals
- Monitor voting participation rates
- Track proposal details and voting results
- Historical governance data

#### Custom Alerts
- Create alerts for various metrics
- Set custom thresholds and conditions
- Multiple notification methods (browser, webhook)
- Real-time monitoring with configurable intervals
- Cooldown periods to prevent notification spam
- Alert history and trigger tracking
- Webhook testing and validation
- Comprehensive statistics and status indicators

#### Data Management
- Local storage configuration and monitoring
- Clear time series data, alerts, or all stored data
- Export and import configuration backups
- Storage usage statistics and monitoring
- Data persistence controls

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# RPC Endpoints (optional - uses defaults if not set)
NEXT_PUBLIC_NAMADA_RPC_URL=https://rpc.namada.com
NEXT_PUBLIC_NAMADA_INDEXER_URL=https://indexer.namada.com

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Customization
- **Polling Intervals**: Adjust in the Control Panel
- **Data Retention**: Configure in localStorage settings
- **Alert Thresholds**: Set custom alert conditions
- **UI Theme**: Modify Windows 95 styling in `globals.css`

## 📊 API Endpoints

The dashboard includes a comprehensive REST API:

### GET Endpoints
- `/api/analytics?endpoint=network-stats` - Network statistics
- `/api/analytics?endpoint=validator-stats` - Validator metrics
- `/api/analytics?endpoint=time-series` - Historical data
- `/api/analytics?endpoint=privacy-metrics` - MASP analytics
- `/api/analytics?endpoint=governance` - Governance data
- `/api/analytics?endpoint=cross-chain` - IBC analytics

### POST Endpoints
- `/api/analytics` - Create alerts and subscriptions

See [API Documentation](API_DOCUMENTATION.md) for complete details.

## 🎨 Windows 95 Theme

The dashboard features an authentic Windows 95 interface:

- **Classic Window Design**: Title bars, minimize/maximize buttons
- **Retro Color Scheme**: Gray backgrounds, blue title bars
- **Authentic Buttons**: 3D button styling with hover effects
- **Familiar Layout**: Windows 95-style window management
- **Responsive Design**: Works on all screen sizes

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔍 Development

### Project Structure
```
src/
├── app/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── NetworkStatsCard.tsx
│   │   ├── ValidatorStatsCard.tsx
│   │   ├── ChartsDashboard.tsx
│   │   ├── PrivacyMetrics.tsx
│   │   ├── GovernanceDashboard.tsx
│   │   ├── AlertSystem.tsx
│   │   └── ...
│   ├── lib/                 # Utility libraries
│   │   ├── indexer-client.ts
│   │   └── time-series-store.ts
│   └── api/                 # API routes
│       └── analytics/
│           └── route.ts
├── globals.css             # Windows 95 styling
└── ...
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain Windows 95 theme consistency
- Add tests for new features
- Update documentation for API changes

## 📈 Roadmap

### Phase 4: Advanced Features (Planned)
- **WebSocket Real-time Streaming**: Live data updates
- **GraphQL API**: Flexible data querying
- **Authentication**: User accounts and preferences
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: React Native companion app
- **Data Export**: Advanced reporting tools

### Phase 5: Enterprise Features (Future)
- **Multi-chain Support**: Analytics for other blockchains
- **Custom Dashboards**: User-defined layouts
- **Team Collaboration**: Shared dashboards and alerts
- **Advanced Security**: Role-based access control
- **Performance Optimization**: Caching and CDN integration

## 🐛 Troubleshooting

### Common Issues

**Charts not rendering data**
- Check browser console for errors
- Verify data is being fetched correctly
- Ensure Chart.js is properly registered

**API endpoints not responding**
- Check if the development server is running
- Verify endpoint URLs are correct
- Check network connectivity

**Windows 95 styling issues**
- Clear browser cache
- Ensure CSS is loading properly
- Check for conflicting styles

### Performance Optimization
- Use appropriate polling intervals
- Enable data persistence for faster loading
- Monitor memory usage with large datasets
- Optimize chart rendering for mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Namada Team**: For building an amazing privacy-focused blockchain
- **Chart.js**: For excellent charting capabilities
- **Windows 95**: For the iconic interface design
- **Next.js Team**: For the powerful React framework

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/your-username/namada-analytics-dashboard/issues)
- **Documentation**: [API Documentation](API_DOCUMENTATION.md)
- **Community**: Join our Discord server

---

**Built with ❤️ for the Namada community**

*Experience the future of blockchain analytics with a touch of nostalgia.*
