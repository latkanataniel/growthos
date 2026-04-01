CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  frequency habit_frequency NOT NULL DEFAULT 'daily',
  frequency_config jsonb,
  category text,
  color text DEFAULT '#2563EB',
  icon text DEFAULT '🎯',
  is_active boolean DEFAULT true,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);
