# Room Control - Quick Start Guide

## Getting Started

### 1. Configure Server Settings
Before using Room Control, ensure your Screeps server is configured:
- Click the **Settings** icon (⚙️) in the sidebar
- Enter your **API URL** (e.g., `http://localhost:21025/api` or `https://screeps.com/api`)
- Enter your **Username**
- Enter your **Password**
- Set your **Shard** (default: `shard0`)
- Click **Save Settings**

### 2. Access Room Control
- Navigate to the **Rooms** tab in the main navigation
- The page will automatically load your owned rooms

## Features

### Quick Access to Your Rooms
- After loading, you'll see a "**My Rooms**" card with buttons for all your controlled rooms
- Click any room button to instantly load that room's data

### Search Any Room
- Use the search bar to enter any room name (e.g., `E0N0`, `W5N3`)
- Press **Enter** or click **Load Room**
- Room names are automatically converted to uppercase

### Auto-Refresh
- Click **Manual/Auto** button to toggle automatic refresh
- When enabled, room data refreshes every 10 seconds
- Useful for monitoring active combat or construction

### Overview Tab
Shows complete room information:
- **Controller Level (RCL)** with progress to next level
- **Energy Statistics** (available/capacity with percentage)
- **Creep Count**
- **Structure Overview** with counts of all major structures
- **Visual Room Map** showing terrain and structure positions

### Creeps Tab
View all creeps in the room:
- **Name** of each creep
- **Position** coordinates
- **Body Composition** (grouped by part type)
- **Health Bar** showing current hits

### Structures Tab
Detailed structure information organized by type:
- **Spawns**: Name, position, energy, health
- **Towers**: Position, energy, health
- **Storage**: Position, total resources, resource breakdown

### Resources Tab
Resource inventory:
- Cards for each resource type
- Total amounts from all storage and containers
- Formatted numbers with thousand separators

## Tips

### Performance
- Use **Auto-Refresh** only when actively monitoring
- Turn it off when not needed to reduce server load

### Visual Map
- **Colors** indicate structure types (see legend)
- **Opacity** shows ownership (brighter = your structures)
- **Yellow bars** on structures show energy levels
- **Green/Red bars** show structure health

### Navigation
- Use **My Rooms** buttons for quick switching between your rooms
- Use search for exploring enemy or neutral rooms

### Monitoring Multiple Rooms
- Open multiple browser tabs to monitor several rooms simultaneously
- Each tab maintains its own auto-refresh setting

## Troubleshooting

### "Failed to load room data"
- Check your server settings are correct
- Ensure the room name is valid (format: E/W + number + N/S + number)
- Verify your server is online and accessible

### No structures shown
- The room might be empty or neutral
- Check the room name is correct
- Try refreshing the data

### Auto-refresh not working
- Ensure you clicked the button to enable it (should show "Auto")
- Check browser console for errors
- Verify server connection in Settings

### Visual map not showing
- The terrain data might not be available
- Try refreshing the room
- Check browser console for canvas errors

## Keyboard Shortcuts

- **Enter** in search box: Load room
- Click room name in "My Rooms": Quick load

## API Usage

The Room Control feature uses these API endpoints:
- `/api/game/room-objects` - Get all objects in a room
- `/api/game/room-overview` - Get room statistics
- `/api/game/room-terrain` - Get terrain data
- `/api/user/rooms` - Get user's owned rooms

All requests are authenticated using your configured credentials.
