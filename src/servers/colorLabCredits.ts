import { getDb } from "~/libs/db";

/**
 * 专门为 Color Lab 分析设计的原子扣费函数
 * 逻辑：在同一个数据库事务中，完成“防重扣校验”+“扣除积分”+“记录日志”+“更新会话状态”
 */
export async function deductCreditsForAnalysis(userId: string, sessionId: string): Promise<{ success: boolean; message?: string }> {
    const db = getDb();
    
    try {
        await db.query("BEGIN");

        // 1. 锁住会话行，防止并发请求绕过状态检查
        const sessionRes = await db.query(
            "SELECT status, updated_at FROM color_lab_sessions WHERE id = $1 FOR UPDATE",
            [sessionId]
        );

        if (sessionRes.rowCount === 0) {
            await db.query("ROLLBACK");
            return { success: false, message: "Session not found" };
        }

        const currentStatus = sessionRes.rows[0].status;
        const updatedAt = new Date(sessionRes.rows[0].updated_at || 0).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        // 如果状态已经是已完成，说明积分已经扣过了
        if (['protected', 'completed', 'analyzed'].includes(currentStatus)) {
            await db.query("ROLLBACK");
            return { success: true, message: "Already deducted" }; 
        }

        // 如果处于 'analyzing' 状态：
        if (currentStatus === 'analyzing') {
            // 如果是在 5 分钟内更新的，说明可能还在跑，让它继续
            if (now - updatedAt < fiveMinutes) {
                await db.query("ROLLBACK");
                return { success: true, message: "Already deducted" }; 
            }
            // 如果超过 5 分钟还在 'analyzing'，说明之前的分析崩了
            // 我们不重新扣费（因为之前扣过了），但允许流程继续往下走重新触发 AI
            console.log(`Session ${sessionId} stuck in analyzing for >5m. Re-triggering...`);
            await db.query("COMMIT"); // 提交当前事务，允许 analyze 接口继续
            return { success: true }; 
        }

        // 2. 锁住用户积分行并检查余额
        const userRes = await db.query(
            "SELECT subscription_credits, permanent_credits FROM user_available WHERE user_id = $1 FOR UPDATE",
            [userId]
        );

        if (userRes.rowCount === 0) {
            await db.query("ROLLBACK");
            return { success: false, message: "User account not found" };
        }

        const subCredits = userRes.rows[0].subscription_credits || 0;
        const permCredits = userRes.rows[0].permanent_credits || 0;
        const amount = 40;

        if (subCredits + permCredits < amount) {
            await db.query("ROLLBACK");
            return { success: false, message: "Insufficient credits" };
        }

        // 3. 执行扣费计算
        let newSubCredits = subCredits;
        let newPermCredits = permCredits;
        if (subCredits >= amount) {
            newSubCredits = subCredits - amount;
        } else {
            newPermCredits = permCredits - (amount - subCredits);
            newSubCredits = 0;
        }

        // 4. 更新积分
        await db.query(
            "UPDATE user_available SET subscription_credits = $1, permanent_credits = $2, updated_at = now() WHERE user_id = $3",
            [newSubCredits, newPermCredits, userId]
        );

        // 5. 插入日志
        await db.query(
            "INSERT INTO credit_logs(user_id, amount, type, description) VALUES($1, -40, 'usage', $2)",
            [userId, `Analysis: ${sessionId}`]
        );

        // 6. 更新会话状态为 'analyzing'
        await db.query(
            "UPDATE color_lab_sessions SET status = 'analyzing', updated_at = now() WHERE id = $1",
            [sessionId]
        );

        await db.query("COMMIT");
        return { success: true };

    } catch (e) {
        await db.query("ROLLBACK");
        console.error("Atomic Deduction Error:", e);
        return { success: false, message: "Internal error during deduction" };
    }
}
