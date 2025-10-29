declare module "expo-media-library" {
  export type PermissionStatus = "granted" | "denied" | "undetermined";

  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: string;
  }

  export type MediaLibraryPermissionHook = [
    PermissionResponse | null,
    (options?: { request?: boolean }) => Promise<PermissionResponse>
  ];

  export function usePermissions(): MediaLibraryPermissionHook;
  export function saveToLibraryAsync(uri: string): Promise<void>;
}
