import {Pool} from 'pg'

let globalPool: Pool

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    // console.log("connectionString", connectionString);

    // 如果使用的是 Supabase 等托管 Postgres，一般需要开启 SSL。
    // 这里根据连接串中是否包含 'supabase.co' 简单判断，自动开启 SSL，
    // 本地 Postgres（例如 127.0.0.1）不会受影响。
    const useSSL = connectionString?.includes('supabase.co');

    globalPool = new Pool({
      connectionString,
      ssl: useSSL ? {rejectUnauthorized: false} : undefined,
    });
  }
  return globalPool;
}
