import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { parse } from 'yaml';
import { categories, metaSchema, type Category, type PlaygroundMeta } from './meta.ts';

/**
 * リポジトリルート（pnpm-workspace.yaml がある場所）の playgrounds/。
 * バンドル後は import.meta.url が当てにならないので、cwd から上に辿って探す。
 */
export function findPlaygroundsRoot(from = process.cwd()): string {
  let dir = from;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml が見つかりません');
    dir = parent;
  }
  return join(dir, 'playgrounds');
}

export interface VariantFiles {
  html: string;
  css: string;
  js: string;
}

export interface Playground {
  /** URL パス兼ディレクトリパス（例: css/properties/anchor-name） */
  path: string;
  category: Category;
  /** カテゴリ内のグループ（例: properties）。なければ null */
  group: string | null;
  slug: string;
  meta: PlaygroundMeta;
  readme: string;
  variants: { name: string; files: VariantFiles }[];
}

const readIf = (file: string) => (existsSync(file) ? readFileSync(file, 'utf8') : '');

function findMetaFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return findMetaFiles(full);
    return name === 'meta.yaml' ? [full] : [];
  });
}

/** playgrounds/ を走査して全 Playground を返す。スキーマ違反は例外にしてビルドを止める */
export function loadPlaygrounds(root = findPlaygroundsRoot()): Playground[] {
  return findMetaFiles(root)
    .map((metaFile) => {
      const dir = metaFile.slice(0, -'/meta.yaml'.length);
      const path = relative(root, dir).split(sep).join('/');
      const segments = path.split('/');
      const category = segments[0] as Category;
      if (!categories.includes(category)) {
        throw new Error(`${path}: カテゴリは ${categories.join(' / ')} のいずれか`);
      }
      const parsed = metaSchema.safeParse(parse(readFileSync(metaFile, 'utf8')));
      if (!parsed.success) {
        throw new Error(`${path}/meta.yaml が不正です:\n${parsed.error.message}`);
      }
      const meta = parsed.data;

      const variantDirs = readdirSync(dir).filter((name) =>
        statSync(join(dir, name)).isDirectory(),
      );
      const order = meta.variants ?? [...variantDirs].sort();
      const missing = order.filter((v) => !variantDirs.includes(v));
      if (missing.length > 0 || order.length === 0) {
        throw new Error(`${path}: バリアントが見つかりません (${missing.join(', ') || 'なし'})`);
      }

      return {
        path,
        category,
        group: segments.length > 2 ? (segments[1] ?? null) : null,
        slug: segments.at(-1) ?? path,
        meta,
        readme: readIf(join(dir, 'README.md')),
        variants: order.map((name) => ({
          name,
          files: {
            html: readIf(join(dir, name, 'index.html')),
            css: readIf(join(dir, name, 'style.css')),
            js: readIf(join(dir, name, 'main.js')),
          },
        })),
      } satisfies Playground;
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
