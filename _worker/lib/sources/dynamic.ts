import { SourceMedia, MappingConfig } from "./types";

const getValueByPath = (obj: any, path?: string): any =>
  path ? path.split(".").reduce((acc, part) => acc?.[part], obj) : undefined;

const extractTags = (post: any, mapping: MappingConfig): string[] => {
  const rawTags = getValueByPath(post, mapping.tagsPath);
  if (!rawTags) return [];

  const { tagsFormat } = mapping;
  if (tagsFormat === "string" && typeof rawTags === "string") return rawTags.split(" ");
  if (tagsFormat === "array" && Array.isArray(rawTags)) return rawTags;
  if (tagsFormat === "object" && typeof rawTags === "object") return Object.values(rawTags).flat() as string[];

  return [];
};

const extractPools = (post: any, mapping: MappingConfig): string[] => {
  const poolsRaw = getValueByPath(post, mapping.poolsPath);
  return Array.isArray(poolsRaw) ? poolsRaw.map(String) : [];
};

const extractDate = (post: any, mapping: MappingConfig): Date => {
  const rawDate = getValueByPath(post, mapping.createdAtPath);
  if (!rawDate) return new Date();
  return typeof rawDate === "number" ? new Date(rawDate * 1000) : new Date(rawDate);
};

const mapPost = (post: any, mapping: MappingConfig): SourceMedia | null => {
  const url = getValueByPath(post, mapping.urlPath);
  if (!url) return null;

  return {
    sourceId: String(getValueByPath(post, mapping.idPath)),
    url,
    previewUrl: getValueByPath(post, mapping.previewUrlPath),
    tags: extractTags(post, mapping),
    pools: extractPools(post, mapping),
    width: Number(getValueByPath(post, mapping.widthPath) || 0),
    height: Number(getValueByPath(post, mapping.heightPath) || 0),
    md5: getValueByPath(post, mapping.md5Path),
    createdAt: extractDate(post, mapping),
    ext: url.split(".").pop()?.split("?")[0] || "jpg",
  };
};

const buildHeaders = (config: any): Record<string, string> => {
  const headers: Record<string, string> = { "User-Agent": "Stash-SmartTags/1.0" };
  if (config.authType === "basic" && config.username && config.apiKey) {
    const auth = Buffer.from(`${config.username}:${config.apiKey}`).toString("base64");
    headers["Authorization"] = `Basic ${auth}`;
  }
  return headers;
};

const parseMapping = (configMapping: string): MappingConfig => {
  try {
    return JSON.parse(configMapping);
  } catch {
    return {} as MappingConfig;
  }
};

export const createSourceFetcher = (config: any) => ({
  fetchMedia: async (query: string, options: { isPool?: boolean; page?: number } = {}): Promise<SourceMedia[]> => {
    const mapping = parseMapping(config.mapping);
    const url = new URL(`${config.baseUrl}${config.searchEndpoint}`);
    
    if (config.queryParam) {
      url.searchParams.append(config.queryParam, options.isPool ? `pool:${query}` : query);
    }
    
    if (mapping.pageParam) {
      url.searchParams.append(mapping.pageParam, String(options.page ?? (mapping.pageStart ?? 1)));
    }
    
    if (mapping.limitParam && mapping.limit) {
      url.searchParams.append(mapping.limitParam, String(mapping.limit));
    }

    const response = await fetch(url.toString(), { headers: buildHeaders(config) });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);

    const dataText = await response.text();
    if (!dataText.trim()) return [];

    let data;
    try {
      data = JSON.parse(dataText);
    } catch {
      throw new Error("Failed to parse JSON response");
    }

    const postsRaw = mapping.dataPath ? getValueByPath(data, mapping.dataPath) : data;

    if (!Array.isArray(postsRaw)) return [];

    return postsRaw
      .map((p) => mapPost(p, mapping))
      .filter((p): p is SourceMedia => p !== null);
  },
  resolvePoolName: async (poolId: string): Promise<string> => {
    const mapping = parseMapping(config.mapping);
    if (!mapping.poolNameEndpoint || !mapping.poolNamePath) return poolId;

    const url = new URL(`${config.baseUrl}${mapping.poolNameEndpoint.replace("{id}", poolId)}`);
    try {
      const response = await fetch(url.toString(), { headers: buildHeaders(config) });
      if (!response.ok) return poolId;
      
      const data = await response.json();
      const name = getValueByPath(data, mapping.poolNamePath);
      return name ? String(name).replace(/_/g, " ") : poolId;
    } catch {
      return poolId;
    }
  }
});
