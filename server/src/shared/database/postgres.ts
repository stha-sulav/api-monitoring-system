import { Pool, type QueryResult, type QueryResultRow } from "pg";

import config from "../config/index";
import logger from "../utils/logger";

class PostgresConnection {
  private pool: Pool | null = null;

  /**
   * Create or return the existing PostgreSQL pool.
   */
  private getPool(): Pool {
    if (this.pool) {
      return this.pool;
    }

    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,

      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on("error", (error: Error) => {
      logger.error("Unexpected PostgreSQL pool error", error);
    });

    logger.info("PostgreSQL pool created");

    return this.pool;
  }

  /**
   * Test PostgreSQL connectivity.
   */
  async testConnection(): Promise<void> {
    try {
      const pool = this.getPool();

      const result = await pool.query("SELECT NOW()");

      logger.info(`PostgreSQL connected successfully at ${result.rows[0].now}`);
    } catch (error) {
      logger.error("Failed to connect to PostgreSQL", error);
      throw error;
    }
  }

  /**
   * Execute a parameterized SQL query.
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: any[] = [],
  ): Promise<QueryResult<T>> {
    const pool = this.getPool();
    const start = Date.now();

    try {
      const result = await pool.query<T>(text, params);

      const duration = Date.now() - start;

      logger.debug("Executed PostgreSQL query", {
        text,
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error("PostgreSQL query failed", {
        text,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Close the PostgreSQL pool.
   */
  async close(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      const pool = this.pool;

      await pool.end();

      this.pool = null;

      logger.info("PostgreSQL pool closed");
    } catch (error) {
      logger.error("Failed to close PostgreSQL pool", error);
      throw error;
    }
  }
}

export default new PostgresConnection();
