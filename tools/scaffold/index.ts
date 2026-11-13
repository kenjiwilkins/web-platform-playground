/**
 * Playground の雛形を作る。
 *
 *   pnpm new css/properties/field-sizing --feature field-sizing
 *
 * --feature に web-features の ID を渡すと、名前・説明・仕様 URL を meta.yaml に埋める。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { stringify } from 'yaml';
import webFeatures from 'web-features/data.json' with { type: 'json' };
import { categories, findPlaygroundsRoot } from '@wpp/schema';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { feature: { type: 'string' }, variant: { type: 'string', default: 'basic' } },
});

const path = positionals[0];
if (!path || !/^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(path)) {
  console.error('使い方: pnpm new <category>/<group>/<slug> [--feature <web-features id>]');
  process.exit(1);
}
const [category] = path.split('/');
if (!categories.includes(category as (typeof categories)[number])) {
  console.error(`カテゴリは ${categories.join(' / ')} のいずれか`);
  process.exit(1);
}

const dir = join(findPlaygroundsRoot(), path);
if (existsSync(dir)) {
  console.error(`${path} は既にあります`);
  process.exit(1);
}

type Feature = { kind: string; name?: string; description?: string; spec?: string | string[] };
const feature = values.feature
  ? (webFeatures.features as Record<string, Feature>)[values.feature]
  : undefined;
if (values.feature && feature?.kind !== 'feature') {
  console.error(`web-features に ${values.feature} が見つかりません（移動・分割済みの可能性）`);
  process.exit(1);
}
const spec = Array.isArray(feature?.spec) ? feature.spec[0] : feature?.spec;

const meta = {
  title: path.split('/').at(-1),
  summary: feature?.description ?? 'TODO: 一行の説明',
  ...(spec ? { spec } : {}),
  ...(values.feature ? { webFeature: values.feature } : {}),
  detect: 'TODO',
  tags: [],
  added: new Date().toISOString().slice(0, 10),
};

const variantDir = join(dir, values.variant!);
mkdirSync(variantDir, { recursive: true });
writeFileSync(join(dir, 'meta.yaml'), stringify(meta));
writeFileSync(join(dir, 'README.md'), '## 試したこと\n\n- \n\n## ハマりどころ\n\n- \n');
writeFileSync(join(variantDir, 'index.html'), '<p>Hello</p>\n');
writeFileSync(join(variantDir, 'style.css'), '');
writeFileSync(join(variantDir, 'main.js'), "console.log('ready');\n");

console.log(`作成しました: playgrounds/${path}/`);
console.log('meta.yaml の detect と summary を埋めてください。');
