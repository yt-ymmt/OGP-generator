require('dotenv').config()

module.exports = {
    env: {
        ENV: process.env.ENV,
    },
    future: {
        webpack5: true,
    },
    webpack: (config) => {
        config.resolve.extensions = ['.tsx', '.ts', '.json', '.jsx', '.js'];
        config.resolve.fallback = {
            fs: false,
            path: false,
        }
        return config;
    },
};
