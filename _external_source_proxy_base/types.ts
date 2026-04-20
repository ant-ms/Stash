export enum SourceType {
  tag = "tag",
  pool = "pool",
}

export interface Pool {
  type: SourceType.pool;
  id: string | number;
  name: string;
}

export interface Tag {
  type: SourceType.tag;
  id: string | number;
  name: string;
}

export type Source = Pool | Tag;

export interface Post {
  id_or_hash: string | number;
  file_url: string;
}
