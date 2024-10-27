import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'camera-gapp',
  webDir: 'www',

  // 21/10/24 DH: https://github.com/capacitor-community/photoviewer
  plugins: {
    PhotoViewer: {
      //iosImageLocation: 'Library/Images',
      androidImageLocation: 'Files/Images',
    }
  }
};

export default config;
