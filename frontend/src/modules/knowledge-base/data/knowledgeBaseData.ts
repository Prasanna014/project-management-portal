export type ExtensionPolicy = {
  category: string;
  extensions: string[];
  useCase: string;
  notes: string;
};

export const USER_RESTORE_WINDOW_DAYS = 30;
export const ADMIN_RESTORE_WINDOW_DAYS = 60;

export const EXTENSION_POLICIES: ExtensionPolicy[] = [
  {
    category: "Open document support",
    extensions: [".md", ".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx"],
    useCase: "SOPs, knowledge articles, runbooks, reports, and markdown-based internal documentation.",
    notes: "Markdown (.md) is explicitly supported for knowledge-first authoring and lightweight version control.",
  },
  {
    category: "Media and diagrams",
    extensions: [".png", ".jpg", ".jpeg", ".svg", ".webp", ".vsdx", ".mp4", ".mov", ".wav"],
    useCase: "Architecture diagrams, screenshots, video walkthroughs, and training assets.",
    notes: "Preview support should be added later for large files and binary assets.",
  },
  {
    category: "Structured packages",
    extensions: [".json", ".xml", ".zip", ".7z"],
    useCase: "Export bundles, structured knowledge payloads, archived SOP packs, and handover kits.",
    notes: "The backend stores any extension; these are recommended enterprise governance examples, not a hard allow-list.",
  },
];

export const IMPLEMENTATION_BACKLOG = [
  "Add document versioning, approval workflow, and ownership transfer for production governance.",
  "Integrate malware scanning and MIME validation before external rollout.",
  "Add storage abstraction for Azure Blob or S3-style object storage when moving beyond local filesystem storage.",
  "Introduce retention reporting dashboards and policy-based purge exceptions for legal hold scenarios.",
];

export function getDaysSince(value?: string | null) {
  if (!value) {
    return 0;
  }
  const ms = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}
