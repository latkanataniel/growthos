INSERT INTO achievements (id, name, description, icon, type, points, criteria, tier) VALUES
-- Tasks
('first-task', 'Pierwszy krok', 'Ukończ swoje pierwsze zadanie', '🎯', 'tasks', 10, '{"tasks_completed": 1}', 'bronze'),
('task-10', 'Na dobrej drodze', 'Ukończ 10 zadań', '✅', 'tasks', 25, '{"tasks_completed": 10}', 'silver'),
('task-50', 'Maszyna do zadań', 'Ukończ 50 zadań', '⚡', 'tasks', 50, '{"tasks_completed": 50}', 'gold'),
('task-100', 'Centurion', 'Ukończ 100 zadań', '🏆', 'tasks', 100, '{"tasks_completed": 100}', 'platinum'),

-- Habits
('first-habit', 'Budowanie nawyku', 'Ukończ nawyk po raz pierwszy', '🌱', 'habits', 10, '{"habits_completed": 1}', 'bronze'),
('habit-streak-7', 'Tydzień mocy', '7-dniowy streak nawyku', '🔥', 'streaks', 25, '{"streak": 7}', 'silver'),
('habit-streak-30', 'Miesiąc wytrwałości', '30-dniowy streak nawyku', '💎', 'streaks', 75, '{"streak": 30}', 'gold'),
('habit-streak-100', 'Niezłomny', '100-dniowy streak nawyku', '👑', 'streaks', 200, '{"streak": 100}', 'platinum'),

-- Journal
('first-journal', 'Dziennikarz', 'Napisz pierwszy wpis w dzienniku', '📝', 'journal', 10, '{"journal_entries": 1}', 'bronze'),
('journal-full-day', 'Pełny dzień', 'Wypełnij wszystkie 3 sesje w jednym dniu', '📖', 'journal', 25, '{"full_days": 1}', 'silver'),
('journal-30', 'Miesiąc refleksji', '30 wpisów w dzienniku', '🧠', 'journal', 50, '{"journal_entries": 30}', 'gold'),

-- General
('level-5', 'W połowie drogi', 'Osiągnij poziom 5', '⭐', 'general', 50, '{"level": 5}', 'gold'),
('level-10', 'Mistrz GrowthOS', 'Osiągnij poziom 10', '🌟', 'general', 200, '{"level": 10}', 'platinum'),
('points-1000', 'Tysiącznik', 'Zbierz 1000 punktów', '💰', 'general', 50, '{"points": 1000}', 'gold');
