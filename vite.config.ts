import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Grim Gambit',
        short_name: 'GrimGambit',
        theme_color: '#ffffff',
        icons: []
      }
    })
  ]
});