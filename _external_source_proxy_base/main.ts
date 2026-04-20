import { DatabaseSync } from "node:sqlite";
import {
  getPostsBySource,
  getSourceById,
  initDb,
  updateSourceLastFetched,
  upsertSource,
  type DBSource,
} from "./db.ts";
import type { Source, SourceType } from "./types.ts";

export abstract class ExternalSourceProxyBase {
  protected db: DatabaseSync;

  constructor(dbPath: string = "data.db") {
    this.db = new DatabaseSync(dbPath);
    initDb(this.db);
  }

  /**
   * Searches for tags or pools on the external source.
   */
  abstract searchSources(
    searchTerm: string,
    type: SourceType,
  ): Promise<Source[] | null>;

  /**
   * Fetches new posts from the external source and stores them in the DB.
   */
  abstract updatePosts(sourceId: string, sourceType: SourceType): Promise<void>;

  /**
   * Retrieves posts associated with a source.
   * If newOnly is true, returns only posts fetched after the last time getPosts was called without newOnly.
   */
  async getPosts(
    sourceId: string,
    sourceType: SourceType,
    newOnly?: boolean,
  ): Promise<string | null> {
    let dbSource: DBSource | null = getSourceById(
      this.db,
      sourceId,
      sourceType,
    );

    // If we don't have the source in DB, we try to fetch it first
    if (!dbSource) {
      const results = await this.searchSources(sourceId, sourceType);
      const source = results?.find((s) => s.id.toString() === sourceId);
      if (!source) return null;
      dbSource = upsertSource(this.db, sourceId, sourceType, source.name);
    }

    if (!dbSource) return null;

    await this.updatePosts(sourceId, sourceType);

    const results = getPostsBySource(
      this.db,
      dbSource.id,
      dbSource.last_fetched_at,
      newOnly,
    );

    updateSourceLastFetched(this.db, dbSource.id);

    return JSON.stringify(results);
  }

  /**
   * Starts a web server to handle external requests.
   */
  serve(port: number = 8080) {
    console.log(`Starting server on port ${port}...`);
    Deno.serve({ port }, async (request: Request) => {
      const url = new URL(request.url);
      const params = url.searchParams;

      try {
        if (url.pathname === "/search") {
          const q = params.get("q");
          const type = params.get("type") as SourceType;
          if (!q || !type) {
            return new Response("Missing q or type", { status: 400 });
          }
          const results = await this.searchSources(q, type);
          return Response.json(results);
        }

        if (url.pathname === "/posts") {
          const id = params.get("id");
          const type = params.get("type") as SourceType;
          const newOnly = params.get("newOnly") === "true";
          if (!id || !type) {
            return new Response("Missing id or type", { status: 400 });
          }
          const results = await this.getPosts(id, type, newOnly);
          return new Response(results, {
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response("Not Found", { status: 404 });
      } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
      }
    });
  }
}
