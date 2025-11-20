module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind
      'nativewind/babel',
      // Expo Router
      require.resolve('expo-router/babel'),
      // Reanimated (for animations)
      'react-native-reanimated/plugin',
    ],
  };
};
