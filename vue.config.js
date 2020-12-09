module.exports = {
    publicPath: '/',
    productionSourceMap: false,
    configureWebpack: {
        entry: ['./src/main.js',],
    },
    chainWebpack: config => {
        // remove the prefetch plugin
        config.plugins.delete('prefetch');
    },
};
