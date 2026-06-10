export type ChangelogFileEntry = {
  rel: string;
  linesAdded?: number;
  linesRemoved?: number;
  status?: string;
};

export type ChangelogRelease = {
  id: string;
  publishedAt: string;
  author: string;
  /** 一两句话说明本次改了什么 */
  note: string;
  gitRef: string | null;
  gitDirty: boolean;
  files: ChangelogFileEntry[];
};

export type DevChangelog = {
  schemaVersion: 1;
  releases: ChangelogRelease[];
};

export type PendingDocChange = {
  rel: string;
  status: string;
  linesAdded: number;
  linesRemoved: number;
  /** 页面中文名，仅用于发布页展示 */
  label: string;
};

export type PendingDocChangesResult = {
  repoRoot: string;
  gitRef: string | null;
  gitDirty: boolean;
  files: PendingDocChange[];
  /** 按变更路径拼的发布说明建议（一两句话，可手改） */
  suggestedNote?: string;
};
