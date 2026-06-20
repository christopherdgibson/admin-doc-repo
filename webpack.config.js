const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    resolve: {
        ...defaultConfig.resolve,
        alias: {
            ...defaultConfig.resolve.alias,
            '@components': path.resolve(__dirname, 'src/admin-doc-repo/components'),
            '@admin-doc-repo': path.resolve(__dirname, 'src/admin-doc-repo'),
            '@block-root': path.resolve(__dirname, 'src/admin-doc-repo')
        },
    },
};

//MiniCssExtractPlugin for proper css execution?
