// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// The candidate copy lives once, in the web app's messages/*.json, and the app
// imports it directly. Watch only that folder (not the whole repo, whose
// node_modules and .next would make Metro crawl hundreds of thousands of files).
config.watchFolders = [path.join(repoRoot, "messages")];

// Packages come from this app's node_modules. (The web app's node_modules sit above
// this folder but outside Metro's watched roots, so they can never be bundled.)
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

module.exports = config;
