import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parseOrigin } from '@wpp/schema';

export default defineConfig({
  site: parseOrigin(process.env.SITE_URL, 'SITE_URL', 'http://localhost:4321'),
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // 埋め込み用と Scratch は検索結果に出さない
      filter: (page) => !page.includes('/embed/') && !page.endsWith('/scratch/'),
    }),
  ],
  server: { port: 4321 },
});
