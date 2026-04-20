import {
  getPostsBySource,
  initDb,
  updateSourceLastFetched,
  getSourceById,
  upsertPostForSource,
  upsertSource,
} from "./db.ts";
import { ExternalSourceProxyBase } from "./main.ts";
import { SourceType } from "./types.ts";
import type { Pool, Post, Source, Tag } from "./types.ts";

export {
  ExternalSourceProxyBase,
  getPostsBySource,
  initDb,
  Pool,
  Post,
  Source,
  SourceType,
  Tag,
  updateSourceLastFetched,
  getSourceById,
  upsertPostForSource,
  upsertSource,
};
