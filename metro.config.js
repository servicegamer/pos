const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
