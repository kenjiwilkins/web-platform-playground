import { z } from 'zod';

/** HTML / CSS / JS / Web API の4カテゴリ。playgrounds/ 直下のディレクトリ名と一致する */
export const categories = ['html', 'css', 'js', 'api'] as const;
export type Category = (typeof categories)[number];

export const categoryLabels: Record<Category, string> = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  api: 'Web API',
};

/** playgrounds/<category>/.../meta.yaml のスキーマ */
export const metaSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    /** MDN の slug（/en-US/docs/ 以降）。MDN 側で改名されたらここだけ直す */
    mdn: z.string().optional(),
    spec: z.url().optional(),
    /** web-features の feature ID。Baseline 表示と feature-watch の突き合わせに使う */
    webFeature: z.string().optional(),
    /** BCD のキー（例: css.properties.anchor-name） */
    bcd: z.string().optional(),
    /** sandbox 内で評価する対応判定の式。truthy なら対応 */
    detect: z.string().optional(),
    requires: z
      .object({
        secureContext: z.boolean().default(false),
        crossOriginIsolated: z.boolean().default(false),
        /** Permissions-Policy で許可する機能名（camera, clipboard-write など） */
        permissions: z.array(z.string()).default([]),
      })
      .strict()
      .default({ secureContext: false, crossOriginIsolated: false, permissions: [] }),
    /** 実験的機能を動かすためのブラウザ起動フラグ（Playwright 用） */
    flags: z
      .object({
        chromium: z.array(z.string()).optional(),
        firefox: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      })
      .strict()
      .default({}),
    tags: z.array(z.string()).default([]),
    added: z.iso.date(),
    /** バリアントの表示順。省略時はディレクトリ名順 */
    variants: z.array(z.string()).optional(),
  })
  .strict();

export type PlaygroundMeta = z.infer<typeof metaSchema>;
