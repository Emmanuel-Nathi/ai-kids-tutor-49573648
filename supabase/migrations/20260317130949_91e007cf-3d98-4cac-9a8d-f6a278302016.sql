CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_points_child_id ON points(child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_child_id ON sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_homework_child_id ON homework(child_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_child_id ON reward_claims(child_id);
CREATE INDEX IF NOT EXISTS idx_rewards_parent_id ON rewards(parent_id);