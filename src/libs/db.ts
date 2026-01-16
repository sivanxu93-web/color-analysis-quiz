import { Pool } from "pg";

// Use globalThis to maintain the pool across hot reloads in development
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

export function getDb() {
  if (!globalForDb.conn) {
    const postgresUrl = process.env.POSTGRES_URL;
    const databaseUrl = process.env.DATABASE_URL;

    console.log("Debug Env Vars:");
    console.log(
      "POSTGRES_URL:",
      postgresUrl ? postgresUrl.replace(/:([^:@]+)@/, ":****@") : "undefined"
    );
    console.log(
      "DATABASE_URL:",
      databaseUrl ? databaseUrl.replace(/:([^:@]+)@/, ":****@") : "undefined"
    );

    const connectionString = postgresUrl || databaseUrl;

    if (!connectionString) {
      console.error(
        "CRITICAL ERROR: POSTGRES_URL or DATABASE_URL is not defined in environment variables."
      );
      throw new Error(
        "Database connection string is missing. Please check your .env or Vercel project settings."
      );
    } else {
      console.log(
        "DB Final Connection String:",
        connectionString.replace(/:([^:@]+)@/, ":****@")
      );
    }

    // 自动判断是否需要 SSL：如果不是本地连接 (localhost/127.0.0.1)，则默认开启 SSL
    const isLocal =
      connectionString?.includes("localhost") ||
      connectionString?.includes("127.0.0.1");
    const useSSL = !isLocal;

    let poolConfig: any = {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000,
      keepAlive: true,
    };

    try {
      // FORCE MANUAL PARSING to bypass "ENOTFOUND base" error
      const url = new URL(connectionString);
      poolConfig = {
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        host: url.hostname,
        port: parseInt(url.port || "5432"),
        database: url.pathname.slice(1), // Remove leading '/'
        ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        max: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
        keepAlive: true,
      };
      console.log("Manual URL parsing applied. Host:", poolConfig.host);
    } catch (e) {
      console.error("Manual URL parsing failed, falling back to string.", e);
    }

    globalForDb.conn = new Pool(poolConfig);

    globalForDb.conn.on("error", (err, client) => {
      console.error("Unexpected error on idle client", err);
      // process.exit(-1) // Do not exit, let it reconnect
    });
  }
  return globalForDb.conn;
}
