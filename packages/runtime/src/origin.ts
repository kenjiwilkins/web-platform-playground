/**
 * 許可オリジンとの照合。runner に埋め込まれるので外部依存を持たない。
 *
 * パターンは `https://<prefix>*<suffix>.<domain>` の形だけを受け付ける（検証は @wpp/schema の parseOrigins）。
 * `*` はホストの先頭ラベルの中でだけ一致し、英小文字・数字・ハイフンの 1 文字以上に一致する。
 * ドットをまたがないので、`https://web-*-team.vercel.app` が `https://web-x.evil-team.vercel.app` に一致することはない。
 */
export function originMatches(pattern: string, origin: string): boolean {
  const star = pattern.indexOf('*');
  if (star < 0) return pattern === origin;
  const prefix = pattern.slice(0, star);
  const suffix = pattern.slice(star + 1);
  if (origin.length <= prefix.length + suffix.length) return false;
  if (!origin.startsWith(prefix) || !origin.endsWith(suffix)) return false;
  return /^[a-z0-9-]+$/.test(origin.slice(prefix.length, origin.length - suffix.length));
}

export function isAllowedOrigin(allowed: readonly string[], origin: string): boolean {
  return allowed.some((pattern) => originMatches(pattern, origin));
}
