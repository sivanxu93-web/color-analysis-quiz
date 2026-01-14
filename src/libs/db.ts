import {Pool} from 'pg'

// Use globalThis to maintain the pool across hot reloads in development
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined
}

export function getDb() {
  if (!globalForDb.conn) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    // console.log("Connecting to DB:", connectionString?.split('@')[1]); // Log host only for debug

    // 自动判断是否需要 SSL：如果不是本地连接 (localhost/127.0.0.1)，则默认开启 SSL
    const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
    const useSSL = !isLocal;

    globalForDb.conn = new Pool({
      connectionString,
      ssl: useSSL ? {rejectUnauthorized: false} : undefined,
      max: 10, // Set a reasonable max connection limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000, // 60s timeout for slow VPN connections
      keepAlive: true,
    });

    globalForDb.conn.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      // process.exit(-1) // Do not exit, let it reconnect
    })
  }
  return globalForDb.conn;
}
