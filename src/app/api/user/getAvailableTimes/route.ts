import {getDb} from "~/libs/db";

export const revalidate = 0;
export const GET = async (req: Request) => {
  const query = new URL(req.url).searchParams;
  const userId = query.get("userId");

  const db = getDb();

  const result = {
    userId: userId,
    available_times: 0,
    subscribeStatus: ''
  };

  if (userId) {

    const resultsSubscribe = await db.query('SELECT * FROM stripe_subscriptions where user_id=$1', [userId]);
    const originSubscribe = resultsSubscribe.rows;
    if (originSubscribe.length > 0) {
      if (originSubscribe[0].status == 'active') {
        result.subscribeStatus = originSubscribe[0].status
      }
    }

    const results = await db.query('SELECT * FROM user_available where user_id=$1', [userId]);
    const origin = results.rows;

    if (origin.length !== 0) {
      result.available_times = origin[0].available_times;
    } else {
      // Lazy init: If user exists but no credit record, give free times
      const freeTimes = Number(process.env.FREE_TIMES || 0);
      await db.query("insert into user_available(user_id, available_times) values($1, $2)", [userId, freeTimes]);
      result.available_times = freeTimes;
      
      // Optional: Log bonus
      if (freeTimes > 0) {
         await db.query("insert into credit_logs(user_id, amount, type, description) values($1, $2, 'bonus', 'Beta test free credits (Profile View)')", [userId, freeTimes]);
      }
    }
  }
  return Response.json(result);
}
