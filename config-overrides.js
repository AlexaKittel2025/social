const { override, addBabelPreset } = require('customize-cra');

module.exports = override(
  // Desabilitar verificações de tipo do TypeScript durante o build
  (config) => {
    config.module.rules.forEach(rule => {
      if (Array.isArray(rule.oneOf)) {
        rule.oneOf.forEach(oneOfRule => {
          if (
            oneOfRule.loader && 
            oneOfRule.loader.includes('ts-loader')
          ) {
            oneOfRule.options = {
              ...oneOfRule.options,
              transpileOnly: true,
              happyPackMode: true
            };
          }
        });
      }
    });
    
    return config;
  }
); 