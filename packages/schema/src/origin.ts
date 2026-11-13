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

/** カンマ区切りのオリジン一覧。各要素に parseOrigin と同じ検証をかける。 */
export function parseOrigins(value: string | undefined, name: string, fallback: string): string[] {
  const items = (value?.trim() || fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(items.map((s) => parseOrigin(s, name, s)))];
}
