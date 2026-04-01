CREATE TYPE task_category AS ENUM ('private', 'professional');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE time_of_day AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE achievement_type AS ENUM ('tasks', 'habits', 'journal', 'streaks', 'general');
