import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Set ASTRO_BASE (e.g. "/sda-tygerberg-website") when building for a GitHub
// Pages project site; leave unset for the Cloudflare production deploy,
// which serves from the domain root.
export default defineConfig({
  site: 'https://tygerbergsda.church',
  base: process.env.ASTRO_BASE || '/',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
