import { DatabaseSync } from "node:sqlite";
import type { Post, SourceType } from "./types.ts";

export interface DBSource {
  id: number;
  remote_id: string;
  type: SourceType;
  name: string;
  last_fetched_at: string | null;
}

/**
 * Initializes the database schema.
 * Creates 'sources', 'posts', and 'source_posts' tables if they don't already exist.
 */
export const initDb = (db: DatabaseSync) => {
  db.exec(
    `
			CREATE TABLE IF NOT EXISTS sources (
			  id INTEGER PRIMARY KEY AUTOINCREMENT,
			  remote_id TEXT NOT NULL,
			  type TEXT NOT NULL, -- "tag" or "pool"
			  name TEXT NOT NULL,
			  last_fetched_at DATETIME,
			  UNIQUE(remote_id, type)
			);

			CREATE TABLE IF NOT EXISTS posts (
			  id INTEGER PRIMARY KEY AUTOINCREMENT,
			  remote_id TEXT NOT NULL UNIQUE,
			  file_url TEXT NOT NULL,
			  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE IF NOT EXISTS source_posts (
			  source_id INTEGER NOT NULL,
			  post_id INTEGER NOT NULL,
			  PRIMARY KEY (source_id, post_id),
			  FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE,
			  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
			);
		  `,
  );
};

/**
 * Retrieves a source from the database by its remote ID and type.
 */
export const getSourceById = (
  db: DatabaseSync,
  remoteId: string,
  type: SourceType,
): DBSource | null => {
  return db
    .prepare("SELECT * FROM sources WHERE remote_id = ? AND type = ?")
    .get(remoteId, type) as unknown as DBSource | null;
};

/**
 * Upserts a source (tag or pool) into the 'sources' table.
 * If it already exists (based on remote_id and type), it ignores the insert.
 * Returns the database record for the source.
 */
export const upsertSource = (
  db: DatabaseSync,
  remoteId: string,
  type: SourceType,
  name: string,
): DBSource => {
  db.prepare(
    "INSERT OR IGNORE INTO sources (remote_id, type, name) VALUES (?, ?, ?)",
  ).run(remoteId, type, name);

  return db
    .prepare("SELECT * FROM sources WHERE remote_id = ? AND type = ?")
    .get(remoteId, type) as unknown as DBSource;
};

/**
 * Updates the 'last_fetched_at' timestamp for a source to the current time.
 */
export const updateSourceLastFetched = (db: DatabaseSync, id: number) => {
  db.prepare(
    "UPDATE sources SET last_fetched_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(id);
};

/**
 * Retrieves posts associated with a specific source.
 * If 'newOnly' is true, it filters for posts created after the source's 'lastFetchedAt' timestamp.
 */
export const getPostsBySource = (
  db: DatabaseSync,
  sourceId: number,
  lastFetchedAt: string | null,
  newOnly?: boolean,
): Post[] => {
  let query = `
    SELECT p.remote_id as id_or_hash, p.file_url
    FROM posts p
    JOIN source_posts sp ON p.id = sp.post_id
    WHERE sp.source_id = ?
  `;
  const params: (string | number)[] = [sourceId];

  if (newOnly && lastFetchedAt) {
    query += " AND p.created_at > ?";
    params.push(lastFetchedAt);
  }

  return db.prepare(query).all(...params) as unknown as Post[];
};

/**
 * Upserts a post and associates it with a source in the 'source_posts' table.
 * If the post already exists, it is ignored, but the association is still created/ignored.
 */
export const upsertPostForSource = (
  db: DatabaseSync,
  sourceId: number,
  post: Post,
) => {
  db.prepare(
    "INSERT OR IGNORE INTO posts (remote_id, file_url) VALUES (?, ?)",
  ).run(post.id_or_hash.toString(), post.file_url);

  const dbPost = db
    .prepare("SELECT id FROM posts WHERE remote_id = ?")
    .get(post.id_or_hash.toString()) as unknown as { id: number };

  db.prepare(
    "INSERT OR IGNORE INTO source_posts (source_id, post_id) VALUES (?, ?)",
  ).run(sourceId, dbPost.id);
};
