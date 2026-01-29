import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Security Check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const db = getDb();

  try {
    // 1. Find abandoned drafts for automated recovery
    // Window: Created between 1 hour ago and 24 hours ago.
    // This gives them time to finish, but catches them while still "warm".
    const query = `
      SELECT 
        r.session_id,
        s.email,
        u.name,
        r.created_at
      FROM color_lab_reports r
      JOIN color_lab_sessions s ON r.session_id = s.id
      LEFT JOIN user_info u ON s.email = u.email
      WHERE r.status = 'draft'
        AND r.recovery_sent_at IS NULL
        AND s.email IS NOT NULL
        AND r.created_at < now() - interval '1 hour'
        AND r.created_at > now() - interval '24 hours'
      LIMIT 10;
    `;

    const result = await db.query(query);
    const abandonedDrafts = result.rows;

    console.log(`[Cron] Found ${abandonedDrafts.length} abandoned drafts.`);

    if (abandonedDrafts.length === 0) {
        return NextResponse.json({ success: true, processed: 0, message: "No abandoned drafts found." });
    }

    const results = [];

    // 2. Send Emails with Rate Limiting
    for (const draft of abandonedDrafts) {
      const { session_id, email, name } = draft;
      const firstName = name ? name.split(' ')[0] : 'there';
      const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app'}/report/${session_id}`;

      try {
        // Rate limit: Sleep 1 second before sending
        await new Promise(resolve => setTimeout(resolve, 1000));

        const emailResult = await resend.emails.send({
          from: 'Sivan from Color Analysis <support@coloranalysisquiz.app>',
          to: email,
          subject: '🎁 A special gift to complete your color analysis (50% OFF)',
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <p>Hi ${firstName},</p>
              <p>I noticed you started your color analysis but haven't unlocked the full results yet. I’d love to help you cross the finish line!</p>
              
              <div style="background-color: #FFFBF7; border: 1px solid #E8E1D9; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #1A1A2E; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">One-Time Exclusive Offer</p>
                <h2 style="margin: 0 0 5px 0; color: #E88D8D; font-size: 32px;">EXTRA 50% OFF</h2>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;">
                  Yes, this stacks on top of our existing discount!<br/>
                  <span style="text-decoration: line-through; color: #999;">$19.90</span> &rarr; <span style="text-decoration: line-through; color: #999;">$4.90</span> &rarr; <strong style="color: #E88D8D;">$2.45</strong>
                </p>
                <div style="background-color: #fff; border: 2px dashed #E88D8D; display: inline-block; padding: 12px 24px; font-weight: bold; font-size: 20px; color: #333; letter-spacing: 2px;">
                  CODE: WELCOMEBACK
                </div>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Valid for 48 hours.</p>
              </div>

              <p>We’ve also just released a major update:</p>
              <ul>
                <li>🎨 <strong>New "Color Fan" Mode:</strong> Compare your best vs. worst colors instantly.</li>
                <li>💄 <strong>Top Brand Picks:</strong> Get specific makeup recommendations for your season.</li>
              </ul>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${reportUrl}" style="background-color: #1A1A2E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  Unlock My Report Now &rarr;
                </a>
              </p>

              <p style="margin-top: 40px; font-size: 14px; color: #666;">Hope to see you inside!<br/>Sivan<br/>Founder, Color Analysis Quiz</p>
            </div>
          `
        });

        if (emailResult.error) {
            console.error(`Failed to send to ${email}:`, emailResult.error);
            results.push({ email, status: 'failed', error: emailResult.error });
        } else {
            // 3. Mark as sent
            await db.query(
                "UPDATE color_lab_reports SET recovery_sent_at = now() WHERE session_id = $1",
                [session_id]
            );
            console.log(`Sent recovery email to ${email}`);
            results.push({ email, status: 'sent' });
        }

      } catch (e: any) {
          console.error(`Error sending to ${email}:`, e);
          results.push({ email, status: 'error', error: e.message });
      }
    }

    return NextResponse.json({ 
        success: true, 
        processed: results.length, 
        details: results 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}