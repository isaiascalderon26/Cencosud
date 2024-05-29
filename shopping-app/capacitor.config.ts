import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cencosudx.shopping.app',
  appName: 'Mi Mall',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: "#ffffff"
    },
    GoogleAuth: {
      scopes: [
        "profile",
        "email"
      ],
      serverClientId: "803339148188-24ja1urghlj5vchuclg7rg8572ghp6h6.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
