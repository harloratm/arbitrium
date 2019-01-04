module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? '/consilium/'
        : '/',
    productionSourceMap: false,
    configureWebpack: {
        entry: ['./src/main.js',],
    }
}
