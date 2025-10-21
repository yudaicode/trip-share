// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Expo Router configuration
config.resolver = {
  ...config.resolver,
  assetExts: [...(config.resolver?.assetExts || [])],
  sourceExts: [...(config.resolver?.sourceExts || [])],
};

module.exports = config;
