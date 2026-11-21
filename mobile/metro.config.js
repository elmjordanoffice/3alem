// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Two folders of the web app are shared with the app and imported directly: the
// candidate copy (messages/*.json) and the brand's scene-art generator
// (src/lib/brand, pure TypeScript with no dependencies), so a scene's cover art
// is drawn identically on the web and in the app. Watch only those (not the
// whole repo, whose node_modules and .next would make Metro crawl hundreds of
// thousands of files).
config.watchFolders = [path.join(repoRoot, "messages"), path.join(repoRoot, "src", "lib", "brand")];

// Packages come from this app's node_modules. (The web app's node_modules sit above
// this folder but outside Metro's watched roots, so they can never be bundled.)
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

module.exports = config;
