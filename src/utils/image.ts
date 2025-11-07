// Use the legacy filesystem API to avoid deprecation warnings from the new
// `expo-file-system` methods like getInfoAsync. The legacy import keeps the
// existing synchronous helpers working while we migrate to the new File/Directory
// API later if needed.
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

const DEFAULT_COMPRESS = 0.82;
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10 MB

export async function normalizeAndCompressImage(uri: string): Promise<ProcessedImage> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ rotate: 0 }],
    {
      compress: DEFAULT_COMPRESS,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const size = await getFileSize(manipulated.uri);

  return {
    uri: manipulated.uri,
    width: manipulated.width ?? 0,
    height: manipulated.height ?? 0,
    size,
  };
}

export async function getFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || typeof info.size !== "number") {
    return 0;
  }
  return info.size;
}

export function formatBytes(size: number): string {
  if (!size) {
    return "~0 B";
  }

  const units = ["B", "KB", "MB", "GB"] as const;
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  const value = size / Math.pow(1024, exponent);
  const formatted = value >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `~${formatted} ${units[exponent]}`;
}
