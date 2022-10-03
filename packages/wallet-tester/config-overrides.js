const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        buffer: require.resolve('buffer')
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        })
    );
    return config;
  }
