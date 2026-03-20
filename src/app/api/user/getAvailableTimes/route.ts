import {getDb} from "~/libs/db";

export const revalidate = 0;
export const GET = async (req: Request) => {
  const query = new URL(req.url).searchParams;
  const userId = query.get("userId");

  const db = getDb();

  const result = {
    userId: userId,
    available_times: 0,
    subscription_credits: 0,
    permanent_credits: 0,
    subscription_status: 'none',
    subscription_plan: null,
    subscription_billing_cycle: null,
    subscription_id: null,
    current_period_end: null,
    validator_times: 0,
  };

  if (userId) {
    const res = await db.query(
        "SELECT available_times, subscription_credits, permanent_credits, subscription_status, subscription_plan, subscription_billing_cycle, subscription_id, current_period_end, validator_times FROM user_available WHERE user_id = $1",
        [userId]
    );

    if (res.rowCount !== 0) {
      const row = res.rows[0];
      result.available_times = (row.subscription_credits || 0) + (row.permanent_credits || 0);
      result.subscription_credits = row.subscription_credits || 0;
      result.permanent_credits = row.permanent_credits || 0;
      result.subscription_status = row.subscription_status || 'none';
      result.subscription_plan = row.subscription_plan;
      result.subscription_billing_cycle = row.subscription_billing_cycle;
      result.subscription_id = row.subscription_id;
      result.current_period_end = row.current_period_end;
      result.validator_times = row.validator_times || 0;
    } else {
      // Lazy init for new users
      const freeTimes = 4;
      await db.query(
          "INSERT INTO user_available(user_id, permanent_credits, available_times) VALUES($1, $2, $2)",
          [userId, freeTimes]
      );
      result.permanent_credits = freeTimes;
      result.available_times = freeTimes;
      
      if (freeTimes > 0) {
         await db.query("INSERT INTO credit_logs(user_id, amount, type, description) values($1, $2, 'bonus', 'Welcome bonus credits')", [userId, freeTimes]);
      }
    }
  }
  return Response.json(result);
}
