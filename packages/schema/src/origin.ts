/**
 * 環境変数で受け取ったオリジンを検証し、`https://example.com` の形に揃える。
 * 未設定や空文字なら fallback を使う。スキームの付け忘れやパス付きの値はビルドを止める。
 * 末尾のスラッシュは取り除く（event.origin と完全一致で比べるため）。
 */
export function parseOrigin(value: string | undefined, name: string, fallback: string): string {
  const raw = value?.trim() || fallback;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      `${name} がオリジンとして解釈できません: "${raw}"（例: https://example.vercel.app）`,
    );
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`${name} は http:// か https:// で始めてください: "${raw}"`);
  }
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error(`${name} にはパスなどを含めず、オリジンだけを指定してください: "${raw}"`);
  }
  return url.origin;
}

/**
 * 許可オリジンのパターン。`https://<prefix>*<suffix>.<domain>` の形だけを受け付ける。
 * `*` は 1 つだけ、ホストの先頭ラベルの中に置き、前後に固定の文字列が必要。
 * `https://*.vercel.app` のような、他人のデプロイにも一致する広いパターンを防ぐため。
 * 照合は @wpp/runtime の originMatches（`*` はドットをまたがない）。
 */
export function parseOriginPattern(value: string, name: string): string {
  const raw = value.trim();
  if (!raw.includes('*')) return parseOrigin(raw, name, raw);
  const fail = (why: string) => {
    throw new Error(`${name} のパターンが不正です（${why}）: "${raw}"`);
  };
  if (raw.indexOf('*') !== raw.lastIndexOf('*')) fail('* は 1 つだけ');
  const normalized = parseOrigin(raw.replace('*', 'x'), name, raw);
  if (!normalized.startsWith('https://')) fail('パターンは https:// のみ');
  const host = raw.replace(/\/$/, '').slice('https://'.length);
  const [label = '', ...rest] = host.split('.');
  if (!label.includes('*')) fail('* はホストの先頭ラベルに置く');
  if (rest.length < 2) fail('* の後ろに 2 つ以上のラベルが必要');
  const [before = '', after = ''] = label.split('*');
  if (!before || !after) fail('* の前後に固定の文字列が必要（例: https://web-*-team.vercel.app）');
  if (!/^[a-z0-9-]+$/.test(before + after)) fail('先頭ラベルは英小文字・数字・ハイフンのみ');
  return `https://${host}`;
}

/** カンマ区切りのオリジン一覧。各要素は parseOrigin、`*` を含むものは parseOriginPattern で検証する。 */
export function parseOrigins(value: string | undefined, name: string, fallback: string): string[] {
  const items = (value?.trim() || fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(items.map((s) => parseOriginPattern(s, name)))];
}
