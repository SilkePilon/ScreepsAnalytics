# Room Notification System

A comprehensive, intelligent notification system for monitoring Screeps rooms with advanced customization and smart polling optimization.

## Features

### 📊 Event Categories

#### Controller Events
- **Controller Upgraded**: Notified when RCL increases
- **Controller Downgraded**: Notified when RCL decreases

#### Energy Alerts
- **Low Energy Warning**: Configurable threshold (1,000-50,000)
- **Critical Energy Alert**: Urgent low energy alerts (100-10,000)

#### Defense Alerts
- **Hostile Creeps Detected**: Alert when enemy creeps enter room
  - Configurable threshold (1-20 creeps)
- **Rampart Low Hits**: When ramparts fall below threshold (1,000-100,000 hits)
- **Wall Low Hits**: When walls fall below threshold (1,000-100,000 hits)

#### Structure Alerts
- **Tower Low Energy**: When towers need refilling (100-1,000 energy)
- **Spawn Idle**: When spawns aren't producing creeps
- **Storage Nearly Full**: When storage reaches capacity (50-100%)

### 🎯 Smart Polling System

The notification system uses intelligent polling that adapts based on your configured alerts:

- **Hostile Creeps Enabled**: Checks every 30 seconds (critical)
- **Critical Energy Enabled**: Checks every 45 seconds
- **5+ Alerts Active**: Checks every 60 seconds
- **3-4 Alerts Active**: Checks every 90 seconds
- **1-2 Alerts Active**: Checks every 120 seconds
- **No Alerts**: Checks every 300 seconds (minimal load)

This ensures timely notifications while minimizing server load.

### ⚙️ Advanced Configuration

#### Timing Settings
- **Check Interval**: How often to poll the room (30-300 seconds)
- **Notification Cooldown**: Minimum time between duplicate alerts (60-3600 seconds)

#### Smart Recommendations
The system automatically suggests optimal check intervals based on your active notifications, balancing responsiveness with server efficiency.

### 📱 Responsive Design
- **Desktop**: Full dialog with scrollable content
- **Mobile**: Native drawer interface for better UX
- **Organized Layout**: Accordion-based categorization for easy navigation

## Setup

### 1. Database Setup

Run the SQL schema in your Supabase dashboard:

```bash
cat my-app/sql/room_notifications.sql
```

This creates the `room_notifications` table with all necessary fields and RLS policies.

### 2. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_CONTROLLER_DOWNGRADE=10
```

### 3. Usage

In any room view, click the **Notifications** button to:
1. Enable/disable notifications for that room
2. Configure which events to monitor
3. Set custom thresholds for numeric alerts
4. Adjust timing settings

## Architecture

### Components

- **`room-notifications-dialog.tsx`**: Main UI component with Dialog/Drawer logic
- **`/api/room-notifications/route.ts`**: API endpoint for saving/loading configs
- **Supabase Integration**: Persistent storage with RLS policies

### Data Flow

1. User opens notification dialog
2. System loads existing config from Supabase (or defaults)
3. User modifies settings with real-time UI updates
4. Smart polling recommendation updates automatically
5. Save to Supabase with optimistic UI updates
6. Background worker checks rooms based on intervals

### Optimization Strategy

The system minimizes backend requests through:
- **Dynamic Polling**: Check intervals adapt to notification priority
- **Cooldown System**: Prevents notification spam
- **Conditional Checking**: Only enabled rooms are monitored
- **Batch Processing**: Multiple rooms can be checked efficiently
- **Indexed Queries**: Database optimized for fast lookups

## Future Enhancements

- [ ] Real-time notifications via WebSocket
- [ ] Email/SMS integration
- [ ] Historical notification log
- [ ] Multi-room notification dashboard
- [ ] Notification templates/presets
- [ ] Export/import configurations
- [ ] Notification analytics and insights

## UI Components Used

- `Dialog` / `Drawer`: Responsive modal containers
- `Accordion`: Organized event categories
- `Switch`: Enable/disable toggles
- `Slider`: Threshold adjustments
- `Badge`: Status indicators
- `Separator`: Visual organization
- `Input`: Manual value entry

## Performance Considerations

- Minimal re-renders with React state management
- Debounced slider updates
- Lazy loading of notification configs
- Efficient Supabase queries with proper indexing
- Client-side validation before API calls
