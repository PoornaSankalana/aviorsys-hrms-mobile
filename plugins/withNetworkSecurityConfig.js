const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) => {
  // 1. Add the attribute to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const mainApplication = androidManifest.application[0];
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  // 2. Copy your XML file into the correct native folder
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resXmlPath = path.join(projectRoot, 'android/app/src/main/res/xml');
      
      if (!fs.existsSync(resXmlPath)) {
        fs.mkdirSync(resXmlPath, { recursive: true });
      }

      // This looks for your file in the root of your project
      const sourceFile = path.join(projectRoot, 'android-network-security-config.xml');
      const destinationFile = path.join(resXmlPath, 'network_security_config.xml');

      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, destinationFile);
      } else {
        console.warn(`⚠️ Network Security Config source file not found at ${sourceFile}`);
      }

      return config;
    },
  ]);

  return config;
};