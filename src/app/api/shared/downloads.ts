// Shared state for download tracking
export const activeDownloads = new Map<string, any>();

// Helper functions
export function getDownload(id: string) {
  return activeDownloads.get(id);
}

export function setDownload(id: string, data: any) {
  activeDownloads.set(id, data);
}

export function deleteDownload(id: string) {
  activeDownloads.delete(id);
}

export function hasDownload(id: string) {
  return activeDownloads.has(id);
}

// Debug function
export function debugActiveDownloads() {
  console.log("🔍 Active downloads:", Array.from(activeDownloads.keys()));
  return activeDownloads.size;
}
