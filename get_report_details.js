const { getDb } = require('./src/libs/db');
async function run() {
  const db = getDb();
  const res = await db.query("SELECT season, report FROM color_lab_reports WHERE session_id = '01ad29ee-e889-4425-bd4f-90a58e2f3afe'");
  console.log(JSON.stringify(res.rows[0]));
  process.exit(0);
}
run();
