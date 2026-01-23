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
  season: string,
  payload: ColorLabReport,
) => {
  const db = getDb();
  await db.query(
    "insert into color_lab_reports(session_id, season, payload) values($1,$2,$3) on conflict (session_id) do update set season = excluded.season, payload = excluded.payload, created_at = now()",
    [sessionId, season, payload],
  );
};

export const getColorLabReport = async (
  sessionId: string,
): Promise<{ 
    report: ColorLabReport; 
    rating?: string;
    ownerEmail?: string;
    imageUrl: string | null;
    drapingImages: { best: string | null; worst: string | null };
} | null> => {
  const db = getDb();
  
  // 1. Get Report Payload, Rating AND Owner Email
  const reportRes = await db.query(
    `SELECT r.payload, r.rating, s.email as owner_email
     FROM color_lab_reports r
     JOIN color_lab_sessions s ON r.session_id = s.id
     WHERE r.session_id = $1
     LIMIT 1`,
    [sessionId],
  );
  if (reportRes.rows.length <= 0) {
    return null;
  }

  // 2. Get All Images
  const imagesRes = await db.query(
    `select url, image_type from color_lab_images where session_id=$1`,
    [sessionId]
  );

  let userImageUrl = null;
  let bestDraping = null;
  let worstDraping = null;

  imagesRes.rows.forEach((row: any) => {
      if (row.image_type === 'user_upload' || !row.image_type) {
          userImageUrl = row.url;
      } else if (row.image_type === 'best_draping') {
          bestDraping = row.url;
      } else if (row.image_type === 'worst_draping') {
          worstDraping = row.url;
      }
  });

  return {
    report: reportRes.rows[0].payload as ColorLabReport,
    rating: reportRes.rows[0].rating,
    ownerEmail: reportRes.rows[0].owner_email,
    imageUrl: userImageUrl,
    drapingImages: {
        best: bestDraping,
        worst: worstDraping
    }
  };
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

