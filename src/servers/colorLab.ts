import {getDb} from "~/libs/db";
import {ColorLabReport} from "~/libs/colorLabTypes";
import {v4 as uuidv4} from "uuid";

export type ColorLabSessionStatus = "created" | "paid" | "analyzed";

export const createColorLabSession = async (email: string | null, ip: string | null = null) => {
  const db = getDb();
  const id = uuidv4();
  // Attempt to insert with IP, fallback if column missing (graceful degradation or user needs to run migration)
  try {
      await db.query(
        "insert into color_lab_sessions(id, email, status, ip) values($1,$2,$3,$4)",
        [id, email, "created", ip],
      );
  } catch (e: any) {
      // If column 'ip' doesn't exist, fallback to old insert
      if (e.message.includes('column "ip" of relation "color_lab_sessions" does not exist')) {
          await db.query(
            "insert into color_lab_sessions(id, email, status) values($1,$2,$3)",
            [id, email, "created"],
          );
      } else {
          throw e;
      }
  }
  return id;
};

export const checkIpLimit = async (ip: string, limit: number = 5, hours: number = 24) => {
    if (!ip) return true; // No IP, allow (or block? allow for now)
    const db = getDb();
    try {
        const res = await db.query(
            `select count(*) as count from color_lab_sessions 
             where ip = $1 
             and created_at > now() - interval '${hours} hours'`,
            [ip]
        );
        const count = parseInt(res.rows[0].count);
        return count < limit;
    } catch (e: any) {
        // If column 'ip' missing, we can't limit by IP. 
        console.warn("IP Limit check failed (DB schema update needed?):", e.message);
        return true; 
    }
};

export const saveColorLabReport = async (
  sessionId: string,
  season: string | null,
  payload: ColorLabReport | null,
  status: string = 'completed',
  inputImageUrl: string | null = null,
  imageHash: string | null = null
) => {
  const db = getDb();
  await db.query(
    `insert into color_lab_reports(session_id, season, payload, status, input_image_url, image_hash) 
     values($1,$2,$3,$4,$5,$6) 
     on conflict (session_id) 
     do update set 
       season = excluded.season, 
       payload = excluded.payload, 
       status = excluded.status,
       input_image_url = COALESCE(excluded.input_image_url, color_lab_reports.input_image_url),
       image_hash = COALESCE(excluded.image_hash, color_lab_reports.image_hash),
       created_at = now()`,
    [sessionId, season, payload, status, inputImageUrl, imageHash],
  );
};

export const getColorLabReport = async (
  sessionId: string,
): Promise<{ 
    report: ColorLabReport | null; 
    status: string; // Add status
    rating?: string;
    ownerEmail?: string;
    imageUrl: string | null;
    drapingImages: { best: string | null; worst: string | null };
} | null> => {
  const db = getDb();
  
  // 1. Get Session & Report (Left Join to allow missing report)
  // Fetch session status as well
  const sessionRes = await db.query(
    `SELECT s.email as owner_email, s.status as session_status, r.payload, r.rating, r.status as report_status, r.input_image_url
     FROM color_lab_sessions s
     LEFT JOIN color_lab_reports r ON s.id = r.session_id
     WHERE s.id = $1
     LIMIT 1`,
    [sessionId],
  );

  if (sessionRes.rows.length === 0) {
    return null; // Session invalid
  }

  const sessionRow = sessionRes.rows[0];

  // 2. Get All Images
  const imagesRes = await db.query(
    `select url, image_type from color_lab_images where session_id=$1`,
    [sessionId]
  );

  let userImageUrl = sessionRow.input_image_url || null; // Prefer report record
  let bestDraping = null;
  let worstDraping = null;

  imagesRes.rows.forEach((row: any) => {
      if ((row.image_type === 'user_upload' || !row.image_type) && !userImageUrl) {
          userImageUrl = row.url;
      } else if (row.image_type === 'best_draping') {
          bestDraping = row.url;
      } else if (row.image_type === 'worst_draping') {
          worstDraping = row.url;
      }
  });

  // Determine status: Report status > Session status > Fallback
  let status = sessionRow.report_status || sessionRow.session_status || (sessionRow.payload ? 'completed' : 'draft');
  
  // Map backend status to frontend status
  if (status === 'analyzing') {
      status = 'processing';
  } else if (status === 'created') {
      status = 'draft';
  }

  return {
    report: sessionRow.payload as ColorLabReport | null,
    status: status,
    rating: sessionRow.rating,
    ownerEmail: sessionRow.owner_email,
    imageUrl: userImageUrl,
    drapingImages: {
        best: bestDraping,
        worst: worstDraping
    }
  };
};

export const getColorLabReportsByEmail = async (email: string) => {
  const db = getDb();
  
  // Get all sessions for this email, joined with report status
  // We want to show:
  // 1. Completed reports (status='completed')
  // 2. Draft reports (status='draft' or no report record yet but session exists?)
  // Actually our new flow creates a report record immediately.
  
  const query = `
    SELECT 
      s.id as session_id,
      s.created_at,
      r.status,
      r.season,
      r.input_image_url,
      (SELECT url FROM color_lab_images WHERE session_id = s.id AND (image_type = 'user_upload' OR image_type IS NULL) LIMIT 1) as backup_image_url
    FROM color_lab_sessions s
    LEFT JOIN color_lab_reports r ON s.id = r.session_id
    WHERE s.email = $1
    ORDER BY s.created_at DESC
  `;
  
  const res = await db.query(query, [email]);
  
  return res.rows.map((row: any) => ({
      sessionId: row.session_id,
      createdAt: row.created_at,
      status: row.status || 'draft', // If no report record, it's effectively a draft/created session
      season: row.season,
      imageUrl: row.input_image_url || row.backup_image_url
  }));
};

export const addToColorLabWaitlist = async (params: {
  email: string;
  locale?: string;
  interest?: string;
  price_range?: string;
}) => {
  const db = getDb();
  const {email, locale, interest, price_range} = params;
  await db.query(
    "insert into color_lab_waitlist(email, locale, interest, price_range) values($1,$2,$3,$4)",
    [email, locale ?? null, interest ?? null, price_range ?? null],
  );
};

export const deleteColorLabSession = async (sessionId: string, email: string) => {
  const db = getDb();
  await db.query(
    "delete from color_lab_sessions where id = $1 and email = $2",
    [sessionId, email]
  );
};

