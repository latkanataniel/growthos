CREATE TABLE achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  type achievement_type NOT NULL,
  points integer NOT NULL DEFAULT 0,
  criteria jsonb NOT NULL DEFAULT '{}',
  tier text NOT NULL DEFAULT 'bronze'
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT TO authenticated USING (true);

CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id),
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE point_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events" ON point_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON point_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Award points function
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_ref uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO point_events (user_id, points, reason, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_ref);

  UPDATE profiles
  SET points = points + p_amount,
      level = GREATEST(1, (
        SELECT COALESCE(
          (SELECT MAX(n) FROM generate_series(1, 10) AS n WHERE 50 * n * (n - 1) <= (profiles.points + p_amount)),
          1
        )
      ))
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update habit streak function
CREATE OR REPLACE FUNCTION update_habit_streak(p_habit_id uuid)
RETURNS void AS $$
DECLARE
  v_streak integer := 0;
  v_date date := CURRENT_DATE;
  v_found boolean;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND completed_date = v_date
    ) INTO v_found;

    EXIT WHEN NOT v_found;
    v_streak := v_streak + 1;
    v_date := v_date - 1;
  END LOOP;

  UPDATE habits
  SET current_streak = v_streak,
      longest_streak = GREATEST(longest_streak, v_streak)
  WHERE id = p_habit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
