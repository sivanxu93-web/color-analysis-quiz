-- 升级用户可用点数表，支持双轨制积分
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS subscription_credits INTEGER DEFAULT 0;
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS permanent_credits INTEGER DEFAULT 0;
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS creem_customer_id VARCHAR;
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS subscription_id VARCHAR;
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR; -- 'standard', 'pro'
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS subscription_status VARCHAR; -- 'active', 'expired', 'past_due'
ALTER TABLE user_available ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- 数据平滑迁移：将旧的 available_times 归为 permanent_credits (永久积分)
UPDATE user_available 
SET permanent_credits = available_times 
WHERE available_times > 0 AND permanent_credits = 0;

COMMENT ON COLUMN user_available.subscription_credits IS '月度订阅积分 (月底重置)';
COMMENT ON COLUMN user_available.permanent_credits IS '永久积分 (购买 Pack 获得，永不过期)';
COMMENT ON COLUMN user_available.subscription_plan IS '订阅套餐类型: standard, pro';
COMMENT ON COLUMN user_available.subscription_status IS '订阅状态: active, past_due, canceled, expired';
