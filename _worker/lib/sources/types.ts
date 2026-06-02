export interface SourceMedia {
  sourceId: string;
  url: string;
  previewUrl: string;
  tags: string[];
  pools: string[];
  width: number;
  height: number;
  md5: string;
  createdAt: Date;
  ext: string;
}

export interface MappingConfig {
  dataPath?: string;
  idPath: string;
  urlPath: string;
  previewUrlPath: string;
  tagsPath: string;
  tagsFormat: "string" | "array" | "object";
  poolsPath?: string;
  md5Path?: string;
  widthPath?: string;
  heightPath?: string;
  createdAtPath?: string;
  poolNameEndpoint?: string;
  poolNamePath?: string;
}
