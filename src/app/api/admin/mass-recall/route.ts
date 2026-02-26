import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const batch = parseInt(searchParams.get('batch') || '1'); // Default to batch 1
  const limit = 82;
  const offset = (batch - 1) * limit;

  // Security Check
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const db = getDb();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';

  try {
    // 1. Find a specific batch of users who have NEVER paid
    const usersQuery = `
      SELECT u.email, u.name, u.user_id
      FROM user_info u
      WHERE NOT EXISTS (
        SELECT 1 FROM color_lab_sessions s
        JOIN color_lab_reports r ON s.id = r.session_id
        WHERE s.email = u.email AND r.status = 'completed'
      )
      ORDER BY u.created_at ASC
      LIMIT $1 OFFSET $2;
    `;

    const usersResult = await db.query(usersQuery, [limit, offset]);
    const targetUsers = usersResult.rows;

    console.log(`[Mass Recall] Found ${targetUsers.length} potential non-paying users.`);

    const summary = {
        total: targetUsers.length,
        with_report: 0,
        no_report: 0,
        errors: 0
    };

    for (const user of targetUsers) {
      const { email, name, user_id } = user;
      const firstName = name ? name.split(' ')[0] : 'beauty';

      try {
        // 2. Try to find the LATEST 'protected' report for this user
        const reportQuery = `
          SELECT r.session_id, r.season as season_name
          FROM color_lab_sessions s
          JOIN color_lab_reports r ON s.id = r.session_id
          WHERE s.email = $1 AND r.status = 'protected'
          ORDER BY r.created_at DESC
          LIMIT 1;
        `;
        const reportResult = await db.query(reportQuery, [email]);
        const latestReport = reportResult.rows[0];

        let subject = "";
        let htmlContent = "";
        let targetUrl = "";

        if (latestReport) {
            // SCENARIO A: Found an abandoned report
            summary.with_report++;
            const season = latestReport.season_name || "Seasonal";
            subject = `Your AI Color Analysis is Ready: You are a ${season}! 🎨`;
            targetUrl = `${siteUrl}/report/${latestReport.session_id}?coupon=WELCOMEBACK`;
            
            htmlContent = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2>Hi ${firstName},</h2>
                    <p>Good news! We found your previous AI color analysis results in our system. You've been identified as a <strong>${season}</strong>.</p>
                    <p>Unlock your professional style guide and 30+ power colors today at <strong>50% OFF</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${targetUrl}" style="background-color: #1A1A2E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                            View My ${season} Report &rarr;
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Code <strong>WELCOMEBACK</strong> automatically applied.</p>
                </div>
            `;
        } else {
            // SCENARIO B: No report found, just recall to homepage
            summary.no_report++;
            subject = "Welcome Back: Your Personal Color Analysis Gift Inside 🎁";
            targetUrl = `${siteUrl}/?coupon=WELCOMEBACK`;

            htmlContent = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2>Hi ${firstName},</h2>
                    <p>We noticed you haven't discovered your true colors with our AI Stylist yet.</p>
                    <p>To welcome you back, we're giving you a <strong>50% discount</strong> on your first professional analysis report!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${targetUrl}" style="background-color: #1A1A2E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                            Start Free Quiz (50% OFF) &rarr;
                        </a>
                    </div>
                    <p>Stop guessing what looks good on you. Let AI reveal your perfect palette in 30 seconds.</p>
                </div>
            `;
        }

        // Send with rate limit
        await resend.emails.send({
          from: 'Color Analysis Quiz Team <support@coloranalysisquiz.app>',
          to: email,
          subject: subject,
          html: htmlContent
        });

        await new Promise(resolve => setTimeout(resolve, 800)); // Respect limits

      } catch (e) {
          console.error(`Error processing ${email}:`, e);
          summary.errors++;
      }
    }

    return NextResponse.json({ success: true, summary });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
