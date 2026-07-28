import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Set ASTRO_BASE (e.g. "/sda-tygerberg-website") when building for a GitHub
// Pages project site; leave unset for the Cloudflare production deploy,
// which serves from the domain root.
export default defineConfig({
  // The origin every absolute URL is built from — canonical tags, Open Graph
  // URLs and the sitemap. This is the domain the Worker actually serves (see
  // `routes` in wrangler.jsonc); change it here and nowhere else if the church
  // moves to its own domain.
  site: 'https://tygerberg-sda.cloudkid.link',
  base: process.env.ASTRO_BASE || '/',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
