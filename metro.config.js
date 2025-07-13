const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig(__dirname);

    const config = {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
        },
        resolver: {
            assetExts: assetExts.filter(ext => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg'],
        },
    };

    return mergeConfig(getDefaultConfig(__dirname), config);
})();
