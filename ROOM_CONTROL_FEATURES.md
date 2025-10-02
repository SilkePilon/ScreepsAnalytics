# Room Control Features

## Overview
The Room Control component provides comprehensive monitoring and management capabilities for Screeps game rooms.

## Features Implemented

### 🏠 Room Selection
- **Search Bar**: Enter any room name (e.g., E0N0, W5N3) to load room data
- **My Rooms Quick Access**: Automatic detection and quick access buttons for all rooms owned by the authenticated user
- **Room Name Validation**: Automatic uppercase conversion for room names

### 🔄 Auto-Refresh
- **Manual/Auto Toggle**: Switch between manual refresh and automatic 10-second refresh intervals
- **Refresh Button**: Manual refresh with loading indicator animation
- **Real-time Updates**: Keeps room data current during active monitoring

### 📊 Overview Tab
Shows comprehensive room statistics including:

#### Controller Information
- RCL (Room Controller Level) display
- Progress percentage to next level
- Visual progress indicator

#### Energy Statistics
- Energy Available in spawns and extensions
- Total Energy Capacity
- Energy fill percentage

#### Room Owner
- Display of room owner username with badge
- Owner ID tracking for filtering

#### Structure Overview
- Total count of all major structures:
  - Spawns (blue icon)
  - Extensions (yellow icon)
  - Towers (red icon)
  - Storage (green icon)
  - Links (cyan icon)
  - Labs (purple icon)
  - Containers (orange icon)

#### Room Statistics
- Displays all available statistics from room-overview endpoint
- Organized in a clean grid layout

#### Visual Room Map
- **Canvas-based 50x50 room visualization**
- **Terrain rendering**: Plain, wall, and swamp terrain types
- **Structure visualization**: Color-coded structures with clear legends
- **Creep visualization**: Circular markers for creeps
- **Energy bars**: Yellow bars showing energy levels in structures
- **Health bars**: Green/red bars showing structure health
- **Owner highlighting**: Different opacity for structures owned by different users
- **Interactive legend**: Shows all structure types and their colors

### 👥 Creeps Tab
Displays all creeps in the selected room with:
- **Creep Name**: Display name or "Unnamed"
- **Position**: x, y coordinates with badge styling
- **Body Parts**: Grouped body part composition (e.g., "move: 4, work: 2")
- **Health Bar**: Visual health indicator with percentage
- **Total Count**: Shows total creep count in tab label

### 🏗️ Structures Tab
Comprehensive structure listing organized by type:

#### Spawns
- Spawn name
- Position coordinates
- Energy level (current/max)
- Health bar visualization

#### Towers
- Position coordinates
- Energy level (current/max)
- Health bar visualization

#### Storage Units
- Position coordinates
- Total resource count
- Detailed resource breakdown by type
- Displays all resources in a grid layout

### 📦 Resources Tab
Resource monitoring with:
- **Grid Layout**: Cards for each resource type
- **Resource Type**: Display name
- **Amount**: Formatted numbers with thousand separators
- **Visual Icons**: Consistent iconography
- **Aggregated View**: Combines resources from all storage and containers

## Technical Features

### API Endpoints
Three new endpoints added to `/api/screeps/route.ts`:

1. **get-room-objects**: Fetches all objects in a room
   - Returns: Array of room objects with positions, types, and properties
   
2. **get-room-stats**: Fetches room statistics and overview
   - Returns: Room statistics including owner, totals, and metrics
   
3. **get-room-terrain**: Fetches encoded terrain data
   - Returns: 2500-character encoded terrain string
   
4. **get-user-rooms**: Fetches all rooms owned by a user
   - Returns: Array of room names

### Data Structures

#### RoomObject Interface
```typescript
interface RoomObject {
  _id: string
  type: string
  x: number
  y: number
  user?: string
  name?: string
  energy?: number
  energyCapacity?: number
  hits?: number
  hitsMax?: number
  level?: number
  progress?: number
  progressTotal?: number
  store?: Record<string, number>
  body?: Array<{ type: string; hits: number }>
}
```

### Performance Optimizations
- **Parallel API Calls**: All room data (objects, stats, terrain) loaded in parallel using Promise.all
- **Efficient Filtering**: Helper functions for quick object filtering by type
- **Conditional Rendering**: Only renders sections with available data
- **Canvas Rendering**: Hardware-accelerated canvas for room visualization
- **Auto-refresh Management**: Clean interval management with proper cleanup

### Error Handling
- Comprehensive try-catch blocks for all API calls
- User-friendly toast notifications for success/failure
- Graceful fallbacks for missing data
- Clear error messages

### User Experience
- **Loading States**: Spinner animation on refresh button during data fetch
- **Empty States**: Helpful messages when no data is available
- **Responsive Design**: Mobile-friendly grid layouts
- **Visual Feedback**: Toast notifications for all actions
- **Color Coding**: Consistent color scheme for structure types
- **Accessibility**: Proper labels and semantic HTML

## Usage Example

1. **Enter Server Settings**: Configure API URL, username, and password in Settings dialog
2. **Navigate to Rooms Tab**: Click on "Rooms" in the main navigation
3. **Quick Access**: If you have rooms, click any "My Rooms" button
4. **Manual Search**: Enter any room name in search bar and click "Load Room"
5. **Enable Auto-Refresh**: Toggle auto-refresh for real-time monitoring
6. **Explore Tabs**: Switch between Overview, Creeps, Structures, and Resources
7. **Visual Analysis**: Study the room map to understand layout and defenses

## Future Enhancements (Optional)
- Construction site management
- Flag placement and removal
- Creep spawning interface
- Structure repair controls
- Resource transfer controls
- Multi-room comparison view
- Historical data tracking
- Alert notifications for attacks
