import { getDb } from "~/libs/db";

/**
 * 获取用户当前的积分详细余量
 */
export async function getUserCredits(userId: string) {
    const db = getDb();
    const res = await db.query(
        "SELECT subscription_credits, permanent_credits, subscription_status, current_period_end FROM user_available WHERE user_id = $1",
        [userId]
    );
    
    if (res.rowCount === 0) {
        return { subscription: 0, permanent: 0, total: 0, status: 'none' };
    }
    
    const row = res.rows[0];
    return {
        subscription: row.subscription_credits || 0,
        permanent: row.permanent_credits || 0,
        total: (row.subscription_credits || 0) + (row.permanent_credits || 0),
        status: row.subscription_status,
        expiresAt: row.current_period_end
    };
}

/**
 * 核心扣费函数：双轨制消耗
 * 策略：优先消耗订阅积分 (subscription_credits)，不足部分消耗永久积分 (permanent_credits)
 */
export async function deductUserCredits(userId: string, amount: number): Promise<boolean> {
    const db = getDb();
    
    try {
        // 使用数据库事务确保扣费的原子性
        await db.query("BEGIN");

        // 1. 锁行并查询当前余量
        const res = await db.query(
            "SELECT subscription_credits, permanent_credits FROM user_available WHERE user_id = $1 FOR UPDATE",
            [userId]
        );

        if (res.rowCount === 0) {
            await db.query("ROLLBACK");
            return false;
        }

        const subCredits = res.rows[0].subscription_credits || 0;
        const permCredits = res.rows[0].permanent_credits || 0;
        const totalAvailable = subCredits + permCredits;

        if (totalAvailable < amount) {
            await db.query("ROLLBACK");
            return false; // 余额不足
        }

        let newSubCredits = subCredits;
        let newPermCredits = permCredits;

        if (subCredits >= amount) {
            // 订阅积分足够
            newSubCredits = subCredits - amount;
        } else {
            // 订阅积分不足，先清空订阅，再扣永久
            const remainingToDeduct = amount - subCredits;
            newSubCredits = 0;
            newPermCredits = permCredits - remainingToDeduct;
        }

        // 2. 更新数据库
        await db.query(
            "UPDATE user_available SET subscription_credits = $1, permanent_credits = $2, updated_at = now() WHERE user_id = $3",
            [newSubCredits, newPermCredits, userId]
        );

        await db.query("COMMIT");
        return true;
    } catch (e) {
        await db.query("ROLLBACK");
        console.error("Deduct Credits Error:", e);
        return false;
    }
}

/**
 * 增加积分逻辑 (用于 Pack 购买)
 */
export async function addPermanentCredits(userId: string, amount: number) {
    const db = getDb();
    await db.query(
        "UPDATE user_available SET permanent_credits = permanent_credits + $1, updated_at = now() WHERE user_id = $2",
        [amount, userId]
    );
}

/**
 * 重置/更新订阅积分 (用于 Webhook 续费回调)
 */
export async function refreshSubscriptionCredits(userId: string, planCredits: number, planName: string, expiry: Date) {
    const db = getDb();
    await db.query(
        `UPDATE user_available 
         SET subscription_credits = $1, 
             subscription_plan = $2, 
             subscription_status = 'active', 
             current_period_end = $3, 
             updated_at = now() 
         WHERE user_id = $4`,
        [planCredits, planName, expiry, userId]
    );
}
