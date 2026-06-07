import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'starorbit.db')

let db: Database.Database

export function initDB(): Database.Database {
  // 确保 data 目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  db = new Database(DB_PATH)

  // 启用 WAL 模式提升并发性能
  db.pragma('journal_mode = WAL')

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      open_id TEXT,
      nickname TEXT,
      avatar_url TEXT,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      channel TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      trade_no TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS timeline_nodes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      year INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      ai_generated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_nodes_user ON timeline_nodes(user_id);
  `)

  console.log('[DB] 数据库初始化完成')
  return db
}

export function getDB(): Database.Database {
  if (!db) {
    return initDB()
  }
  return db
}
