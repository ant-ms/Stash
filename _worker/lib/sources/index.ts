import { createSourceFetcher } from "./dynamic";

export const getSource = (config: any) => createSourceFetcher(config);
