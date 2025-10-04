CREATE TABLE room_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  room_name TEXT NOT NULL,
  
  enabled BOOLEAN DEFAULT true,
  
  controller_upgrade_enabled BOOLEAN DEFAULT false,
  controller_downgrade_enabled BOOLEAN DEFAULT false,
  
  energy_low_enabled BOOLEAN DEFAULT false,
  energy_low_threshold INTEGER DEFAULT 5000,
  energy_critical_enabled BOOLEAN DEFAULT false,
  energy_critical_threshold INTEGER DEFAULT 1000,
  
  hostile_creeps_enabled BOOLEAN DEFAULT false,
  hostile_creeps_threshold INTEGER DEFAULT 1,
  
  tower_low_energy_enabled BOOLEAN DEFAULT false,
  tower_low_energy_threshold INTEGER DEFAULT 500,
  
  spawn_idle_enabled BOOLEAN DEFAULT false,
  
  storage_full_enabled BOOLEAN DEFAULT false,
  storage_full_threshold INTEGER DEFAULT 90,
  
  rampart_low_hits_enabled BOOLEAN DEFAULT false,
  rampart_low_hits_threshold INTEGER DEFAULT 10000,
  
  wall_low_hits_enabled BOOLEAN DEFAULT false,
  wall_low_hits_threshold INTEGER DEFAULT 10000,
  
  check_interval INTEGER DEFAULT 60,
  last_check_time TIMESTAMPTZ,
  last_notification_time TIMESTAMPTZ,
  notification_cooldown INTEGER DEFAULT 300,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_name, server_url, room_name)
);

CREATE INDEX idx_room_notifications_player ON room_notifications(player_name, server_url);
CREATE INDEX idx_room_notifications_enabled ON room_notifications(enabled) WHERE enabled = true;
CREATE INDEX idx_room_notifications_check ON room_notifications(last_check_time) WHERE enabled = true;

ALTER TABLE room_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON room_notifications
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON room_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON room_notifications
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON room_notifications
  FOR DELETE USING (true);
