// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    settings: {
      'import/core-modules': [
        'expo-camera',
        'expo-media-library',
        'expo-image-manipulator',
      ],
    },
  },
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
