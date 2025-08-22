import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gps.pen.app',
  appName: 'GPS Pen',
  webDir: 'dist',
  // Only add server config for development
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      // url: 'http://192.168.1.48:3000',
      url: 'http://localhost:3000',
      cleartext: true,
      androidScheme: 'http'
    }
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: false,   // 👈 let iOS manage safe area
      splashImmersive: false,    // 👈 avoid forcing full bleed
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#000000"
    }
  }
};

export default config;
