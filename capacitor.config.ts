import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c9b61c208edc4705bde89d099024f5b5',
  appName: 'interactify-slide-magic',
  webDir: 'dist',
  server: {
    url: 'https://c9b61c20-8edc-4705-bde8-9d099024f5b5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#020205'
    },
    ScreenOrientation: {
      orientation: 'portrait'
    }
  }
};

export default config;
