import axios from "axios";
import Constants from "expo-constants";

import { ArtTool } from "@/types/artTool";

const resolveApiUrl = () => {
  const fromProcess =
    typeof process !== "undefined" ? process.env?.ART_TOOLS_API_URL : "";
  const fromExpo = Constants?.expoConfig?.extra?.ART_TOOLS_API_URL ?? "";
  const fromManifest = Constants?.manifest?.extra?.ART_TOOLS_API_URL ?? "";

  const url = fromProcess || fromExpo || fromManifest || "";
  if (!url) {
    throw new Error(
      "ART_TOOLS_API_URL chưa được cấu hình. Vui lòng thêm vào file .env và app.config.js."
    );
  }
  return url.replace(/\/+$/, "");
};

export const fetchArtTools = async (): Promise<ArtTool[]> => {
  const baseUrl = resolveApiUrl();
  const { data } = await axios.get<ArtTool[]>(baseUrl);
  return data;
};

export const fetchArtTool = async (id: string): Promise<ArtTool> => {
  const baseUrl = resolveApiUrl();
  const { data } = await axios.get<ArtTool>(`${baseUrl}/${id}`);
  return data;
};
