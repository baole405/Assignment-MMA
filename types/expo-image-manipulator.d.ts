declare module "expo-image-manipulator" {
  export enum SaveFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
  }

  export type ImageManipulatorAction =
    | { rotate: number }
    | { flip: { vertical?: boolean; horizontal?: boolean } }
    | { resize: { width?: number; height?: number } };

  export interface ImageManipulatorOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export interface ImageResult {
    uri: string;
    width?: number;
    height?: number;
    base64?: string;
  }

  export function manipulateAsync(
    uri: string,
    actions: ImageManipulatorAction[],
    options?: ImageManipulatorOptions
  ): Promise<ImageResult>;
}
