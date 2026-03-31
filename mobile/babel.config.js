module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@screens': './screens',
            '@hooks': './hooks',
            '@services': './services',
            '@types': './types',
            '@components': './components',
            '@navigation': './navigation',
            '@contexts': './contexts',
            '@utils': './utils',
          },
        },
      ],
    ],
  };
};
