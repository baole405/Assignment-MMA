const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://example.com";
const UPLOAD_ENDPOINT = "/upload";

export async function uploadImage(uri: string, signal?: AbortSignal): Promise<void> {
  const form = new FormData();
  form.append(
    "file",
    {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as unknown as Blob
  );

  const response = await fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
    method: "POST",
    body: form,
    signal,
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(message ?? "Upload failed");
  }
}

async function safeReadError(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}
