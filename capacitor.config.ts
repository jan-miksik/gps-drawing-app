import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gpsdrawing.app',
  appName: 'GPS Drawing',
  webDir: 'dist',
  // Only add server config for development
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      url: 'http://192.168.1.48:3000',
      cleartext: true,
      androidScheme: 'http'
    }
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#000000'
    },
    Share: {
      // Share plugin configuration
    }
  }
};

export default config;
