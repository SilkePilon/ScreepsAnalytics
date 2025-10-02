CREATE TABLE favorite_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  room_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_name, server_url, room_name)
);

CREATE INDEX idx_favorite_rooms_player ON favorite_rooms(player_name, server_url);

ALTER TABLE favorite_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON favorite_rooms
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON favorite_rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON favorite_rooms
  FOR DELETE USING (true);
