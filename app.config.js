import "dotenv/config";

export default ({ config }) => {
  return {
    expo: {
      ...config.expo,
      extra: {
        ...(config.expo?.extra || {}),
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
        ART_TOOLS_API_URL: process.env.ART_TOOLS_API_URL || "",
      },
    },
  };
};
