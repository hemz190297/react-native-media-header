// Metro config for developing the library in place: the example links `react-native-media-header`
// to the parent folder, so Metro must watch it and must resolve React / React Native from the
// example's node_modules only (two copies of React = "Invalid hook call").
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const root = path.resolve(__dirname, '..');
const config = getDefaultConfig(__dirname);

config.watchFolders = [root];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
config.resolver.extraNodeModules = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
};
const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [new RegExp(`^${escaped}/node_modules/.*`)];

module.exports = config;
