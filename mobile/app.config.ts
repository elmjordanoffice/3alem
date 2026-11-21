import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * app.json plus the universal-link host, which differs per deployment.
 * Set APP_LINK_HOST (e.g. "aalim.example.com") when building a dev or store
 * build so https://<host>/a/<token> opens the app; aalim://a/<token> always works.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const host = process.env.APP_LINK_HOST?.trim();
  if (!host) return config as ExpoConfig;
  return {
    ...(config as ExpoConfig),
    ios: { ...config.ios, associatedDomains: [`applinks:${host}`] },
    android: {
      ...config.android,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "https", host, pathPrefix: "/a/" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
  };
};
