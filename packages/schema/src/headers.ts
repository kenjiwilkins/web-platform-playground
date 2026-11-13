import type { PlaygroundMeta } from './meta.ts';

export interface Header {
  key: string;
  value: string;
}

/**
 * sandbox 側でその Playground のパスに付けるレスポンスヘッダ。
 * cross-origin isolation が必要な API（SharedArrayBuffer など）や
 * Permissions-Policy が必要な API は meta.requires で宣言する。
 */
export function sandboxHeaders(meta: Pick<PlaygroundMeta, 'requires'>): Header[] {
  const headers: Header[] = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
  if (meta.requires.crossOriginIsolated) {
    headers.push(
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      // 親（web 側）の iframe から読み込めるようにする
      { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
    );
  }
  if (meta.requires.permissions.length > 0) {
    headers.push({
      key: 'Permissions-Policy',
      value: meta.requires.permissions.map((p) => `${p}=(self)`).join(', '),
    });
  }
  return headers;
}

/** iframe の allow 属性（親側でも委譲が必要） */
export function iframeAllow(meta: Pick<PlaygroundMeta, 'requires'>): string {
  return meta.requires.permissions.join('; ');
}
