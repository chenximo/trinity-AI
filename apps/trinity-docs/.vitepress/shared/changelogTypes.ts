export type ChangelogFileEntry = {
  rel: string;
  summary: string;
  linesAdded?: number;
  linesRemoved?: number;
  status?: string;
};

export type ChangelogRelease = {
  id: string;
  publishedAt: string;
  author: string;
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
  summary: string;
};
