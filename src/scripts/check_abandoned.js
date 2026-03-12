
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.ivahqcbsqpstsybbohpy:coloranalysis888%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkStatus() {
  const emails = ['papaleogiuliana@gmail.com', 'heatherglaze@gmail.com'];
  try {
    for (const email of emails) {
      console.log(`\n--- Checking ${email} ---`);
      // Get all sessions for this email
      const res = await pool.query(`
        SELECT 
            s.id as session_id, 
            s.created_at as session_created,
            r.status as report_status, 
            r.created_at as report_created, 
            r.recovery_sent_at,
            NOW() as current_time,
            NOW() - r.created_at as time_diff
        FROM color_lab_sessions s
        JOIN color_lab_reports r ON s.id = r.session_id
        WHERE s.email = $1
        ORDER BY r.created_at DESC
      `, [email]);

      if (res.rows.length === 0) {
        console.log('No reports found.');
      } else {
        res.rows.forEach((row, i) => {
           console.log(`Report ${i+1}:`);
           console.log(`  Status: ${row.report_status}`);
           console.log(`  Created: ${row.report_created}`);
           console.log(`  Recovery Sent: ${row.recovery_sent_at}`);
           console.log(`  Age: ${row.time_diff}`);
           
           // Check logic locally
           const ageHours = row.time_diff.hours ? row.time_diff.hours : 0; 
           // Note: Postgres interval output in JS depends on driver parsing, 
           // usually simpler to judge by created_at timestamp vs current time logic manually or in SQL.
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
checkStatus();
