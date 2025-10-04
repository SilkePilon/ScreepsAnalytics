# Room Notification System

A comprehensive, intelligent notification system for monitoring Screeps rooms with browser notifications, advanced customization, and smart polling optimization.

## Features

### 🔔 Browser Notifications

The system uses native browser notifications to alert you even when the tab isn't active:

- **Permission Management**: Automatic permission request flow with clear UI
- **Test Notifications**: Sends a test notification when permission is granted
- **Priority-Based**: Critical alerts (hostile creeps, critical energy) require interaction
- **Per-Device**: Browser notification permissions are device/browser-specific
- **Smart Deduplication**: Tracks last notification time per event to prevent spam

### 📊 Event Categories

#### Controller Events
- **Controller Upgraded**: Notified when RCL increases
- **Controller Downgraded**: Notified when RCL will downgrade soon (within 24 hours)
  - Critical if < 12 hours remaining
  - High priority if < 24 hours remaining

#### Energy Alerts
- **Low Energy Warning**: Configurable threshold (1,000-50,000)
  - Only triggers if above critical threshold
- **Critical Energy Alert**: Urgent low energy alerts (100-10,000)
  - Requires user interaction

#### Defense Alerts
- **Hostile Creeps Detected**: Alert when enemy creeps enter room
  - Configurable threshold (1-20 creeps)
  - Critical priority, requires interaction
- **Rampart Low Hits**: When ramparts fall below threshold (1,000-100,000 hits)
  - High priority
- **Wall Low Hits**: When walls fall below threshold (1,000-100,000 hits)
  - High priority

#### Structure Alerts
- **Tower Low Energy**: When towers need refilling (100-1,000 energy)
  - High priority
- **Spawn Idle**: When all spawns aren't producing creeps
  - Normal priority
- **Storage Nearly Full**: When storage reaches capacity (50-100%)
  - Normal priority

### 🎯 Smart Polling System

The notification system uses intelligent polling that adapts based on your configured alerts:

- **Hostile Creeps Enabled**: Checks every 30 seconds (critical)
- **Critical Energy Enabled**: Checks every 45 seconds
- **5+ Alerts Active**: Checks every 60 seconds
- **3-4 Alerts Active**: Checks every 90 seconds
- **1-2 Alerts Active**: Checks every 120 seconds
- **No Alerts**: Checks every 300 seconds (minimal load)

Background worker checks all enabled rooms every 60 seconds by default. This ensures timely notifications while minimizing server load.

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
- **Permission Banner**: Clear warning when browser notifications aren't enabled

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

### 3. Browser Permissions

When you first enable notifications:
1. The system will request notification permission
2. Click "Allow" in the browser prompt
3. A test notification will be sent to confirm it's working
4. **Important**: Permissions are per-device/browser and don't sync across devices

If you previously denied permission:
- Chrome/Edge: Click the lock icon in the address bar → Notifications → Allow
- Firefox: Click the shield icon → Permissions → Notifications → Allow
- Safari: Safari menu → Settings → Websites → Notifications → Allow

### 4. Usage

In any room view, click the **Notifications** button to:
1. Grant browser notification permission (if needed)
2. Enable/disable notifications for that room
3. Configure which events to monitor
4. Set custom thresholds for numeric alerts
5. Adjust timing settings
6. **Send Test Notification**: Use the "Send Test" button to verify notifications are working

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
