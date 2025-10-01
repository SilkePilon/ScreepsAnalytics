# Screeps Analytics Dashboard

A real-time analytics dashboard for Screeps private servers. Track player statistics, leaderboards, and server metrics with a beautiful, modern interface.

## Features

- **Real-time Player Leaderboard**: View all players ranked by GCL with detailed statistics
- **Server Statistics**: Track total players, rooms, average GCL, and top performers
- **Interactive Charts**: Visualize player performance and comparisons
- **Auto-refresh**: Configurable polling interval for real-time data updates
- **Settings Management**: Client-side storage of server credentials and preferences
- **Private Server Support**: Designed specifically for custom Screeps servers

## Player Statistics Tracked

- Username
- Global Control Level (GCL)
- Total Rooms Controlled
- Average Room Control Level (RCL)
- Creeps Produced
- Creeps Lost
- Energy Harvested
- Power Processed

## Prerequisites

- Node.js 18+
- A running Screeps private server
- Server credentials (username and password)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd ScreepsAnalytics
```

2. Navigate to the app directory:
```bash
cd my-app
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Configuration

### First-Time Setup

1. Click the **Settings** icon (gear) in the top-right corner
2. Configure your server connection:
   - **API URL**: Your Screeps server URL (e.g., `http://127.0.0.1:3000`)
   - **Username**: Your Screeps username
   - **Password**: Your Screeps password
   - **Shard Name**: The shard to monitor (default: `shard0`)
   - **Polling Interval**: How often to refresh data in milliseconds (minimum 10000ms)

3. Click **Test Connection** to verify your settings
4. Click **Save Settings** to store your configuration

### Authentication

The dashboard uses username/password authentication for private servers:
1. Enter your Screeps username and password in the settings
2. The app automatically handles signin and token management
3. Tokens are stored in memory and refreshed as needed
4. If authentication expires, the app automatically re-authenticates

### Settings Storage

All settings are stored in your browser's localStorage, meaning:
- Settings persist across page refreshes
- Settings are stored per-browser/device
- Passwords are stored in browser localStorage (use a secure browser)
- Settings don't sync between devices

## API Endpoints Used

The dashboard connects to your Screeps server API:

- `/api/auth/signin` - Authenticate with username/password
- `/api/auth/me` - Verify authentication
- `/api/leaderboard/list` - Fetch player list
- `/api/user/rooms` - Get user's controlled rooms
- `/api/game/room-overview` - Fetch room details and stats
- `/api/user/stats` - Get user statistics

## Production Build

To create a production build:

```bash
npm run build
npm start
```

## Development

The project uses:
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **TanStack Table** - Advanced table functionality

### Project Structure

```
my-app/
├── app/
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # Root layout with Toaster
│   └── globals.css           # Global styles
├── components/
│   ├── player-leaderboard.tsx     # Leaderboard table
│   ├── section-cards.tsx          # Stats cards
│   ├── chart-area-interactive.tsx # Player comparison chart
│   ├── settings-dialog.tsx        # Settings modal
│   ├── site-header.tsx            # Header with refresh
│   ├── app-sidebar.tsx            # Navigation sidebar
│   └── ui/                        # UI components
├── lib/
│   ├── screeps-api.ts        # API client and types
│   └── utils.ts              # Utilities
└── hooks/
    └── use-mobile.ts         # Mobile detection hook
```

## Troubleshooting

### Connection Issues

- Verify your Screeps server is running and accessible
- Check that the API URL is correct (should NOT include `/api` at the end)
- Ensure your username and password are correct
- Check browser console for detailed error messages

### No Data Showing

- Wait for the initial data fetch (may take 10-30 seconds for first load)
- Check that your server has active players
- Verify the shard name matches your server configuration
- Try clicking the refresh button manually

### Performance Issues

- Increase the polling interval in settings
- Reduce the number of players fetched (modify API calls)
- Check your server's API response times

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Inspired by the [Screeps](https://screeps.com/) game

## Support

For issues and questions:
- Open an issue on GitHub
- Check the Screeps documentation
- Join the Screeps community on Discord
