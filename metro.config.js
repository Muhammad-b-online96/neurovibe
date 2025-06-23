const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'ts' and 'tsx' to the list of source extensions
// This ensures Metro knows how to resolve these files.
config.resolver.sourceExts.push('ts', 'tsx');

// Ensure that Metro's transformer processes files in node_modules
// that might be in TypeScript. This is often needed for packages
// that ship their source code.
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;