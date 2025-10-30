import { useCallback } from "react";
import { router } from "expo-router";

export function openCameraModal() {
  router.push("/camera-modal");
}

export function useCameraModal() {
  const open = useCallback(() => {
    openCameraModal();
  }, []);

  const close = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, []);

  return { open, close };
}
