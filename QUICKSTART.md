# Quick Start Guide

## Initial Setup

1. **Start the development server:**
   ```bash
   cd my-app
   npm install
   npm run dev
   ```

2. **Open the dashboard:**
   Navigate to `http://localhost:3000` in your browser

3. **Configure server connection:**
   - Click the gear icon (⚙️) in the top-right
   - Enter your Screeps server details:
     - API URL: `http://127.0.0.1:3000` (your Screeps server)
     - Username: Your Screeps username
     - Password: Your Screeps password
     - Shard: `shard0` (or your custom shard name)
     - Polling Interval: `30000` (30 seconds)
   - Click "Test Connection"
   - Click "Save Settings"

4. **View your analytics:**
   The dashboard will automatically load and refresh data based on your polling interval.

## Dashboard Features

### Top Statistics Cards
- **Total Players**: All registered players on the server
- **Total Rooms**: Number of rooms controlled by players
- **Average GCL**: Server-wide average Global Control Level
- **Top Player GCL**: Highest GCL and player name

### Player Comparison Chart
- Visual comparison of top players by GCL and room count
- Switch between Top 5, 10, or 20 players

### Player Leaderboard Table
- Sortable columns (click column headers)
- Search by username
- Pagination controls
- Trophy icons for top 3 players
- Detailed stats per player:
  - Rank
  - Username
  - GCL (Global Control Level)
  - Number of rooms controlled
  - Average RCL (Room Control Level)
  - Creeps produced/lost
  - Energy harvested

### Controls
- **Refresh Button** (🔄): Manually refresh all data
- **Settings Button** (⚙️): Open configuration dialog
- **Pagination**: Navigate through player pages
- **Rows per page**: Adjust table display (10, 20, 30, 50, 100)

## Default API Endpoint

The dashboard expects your Screeps server API to be available at:
```
http://127.0.0.1:3000/api
```

If your server runs on a different port or URL, update it in the Settings dialog.

## Troubleshooting

### "Failed to load data" Error
1. Verify your Screeps server is running
2. Check the API URL in settings (should NOT end with `/api`)
3. Ensure your username and password are correct
4. Check browser console for detailed errors

### No Players Showing
- Wait 30-60 seconds for initial data load
- Click the refresh button
- Verify your server has active players
- Check that the shard name is correct

### Slow Performance
- Increase polling interval in settings
- Check your server's CPU usage
- Verify network connection to server

## Tips

- The polling interval determines how often data refreshes automatically
- Keep the minimum interval at 10000ms (10 seconds) to avoid overwhelming your server
- Settings are saved in your browser's localStorage
- Use the manual refresh button for immediate updates
- The table supports filtering by username for quick player lookup

## Next Steps

After setup, you can:
- Monitor player progression over time
- Track server population growth
- Identify top performers
- Analyze room control distribution
- Review detailed player statistics

For more information, see the full README.md file.
