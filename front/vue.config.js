/* eslint-disable */
const path = require('path');

const v = '0.2';

module.exports = {
    productionSourceMap: false,
    outputDir: path.resolve(__dirname, '../back/dist/front'),
    pages: {
        index: {
            entry: 'src/main.ts',
            title: `Sidly v${v} hours boost`,
        },
        login: {
            entry: 'src/login/main.ts',
            template: 'public/index.html',
            filename: 'login/index.html',
            title: `Sidly v${v} Auth`,
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@shared': path.resolve(__dirname, '../shared'),
            },
            extensions: ['.ts'],
        },
    },
    devServer: {
        historyApiFallback: {
            rewrites: [{
                    from: /^\/login\/?.*/,
                    to: path.posix.join('/', 'login/index.html'),
                },
                {
                    from: /./,
                    to: path.posix.join('/', 'index.html'),
                },
            ],
        },
    },
};