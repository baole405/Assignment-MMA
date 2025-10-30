declare module "expo-camera" {
  import * as React from "react";
  import { ViewProps } from "react-native";

  export type FlashMode = "off" | "on" | "auto" | "torch";
  export type CameraType = "front" | "back";

  export interface PermissionResponse {
    status: "granted" | "denied" | "undetermined";
    granted: boolean;
    canAskAgain: boolean;
    expires: string;
  }

  export interface CameraCapturedPicture {
    uri: string;
    width?: number;
    height?: number;
    exif?: Record<string, unknown> | null;
  }

  export interface TakePictureOptions {
    quality?: number;
    base64?: boolean;
    exif?: boolean;
    skipProcessing?: boolean;
  }

  export type CameraPermissionTuple = [
    PermissionResponse | null,
    (options?: { request?: boolean }) => Promise<PermissionResponse>
  ];

  export interface CameraViewProps extends ViewProps {
    flash?: FlashMode;
    zoom?: number;
    facing?: CameraType;
    enableTorch?: boolean;
    onCameraReady?: () => void;
  }

  export class CameraView extends React.Component<CameraViewProps> {
    static isAvailableAsync(): Promise<boolean>;
    takePictureAsync(options?: TakePictureOptions): Promise<CameraCapturedPicture>;
    pausePreview(): Promise<void>;
    resumePreview(): Promise<void>;
  }

  export const FlashMode: {
    off: FlashMode;
    on: FlashMode;
    auto: FlashMode;
    torch: FlashMode;
  };

  export const CameraType: {
    front: CameraType;
    back: CameraType;
  };

  export function useCameraPermissions(): CameraPermissionTuple;
}
