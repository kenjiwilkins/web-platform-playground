import type { RunPayload } from './protocol.ts';

/**
 * sandbox 内で実行する HTML 文書を組み立てる。
 * console の捕捉スクリプトを最初に差し込み、ユーザーの CSS/HTML/JS をその後に置く。
 * ユーザーのコードにはスタイルを一切足さない（素のブラウザ挙動を観察するため）。
 */
export function composeDocument(payload: RunPayload, parentOrigin: string): string {
  const escapeScript = (code: string) => code.replace(/<\/script/gi, '<\\/script');
  const capture = `(${captureConsole.toString()})(${JSON.stringify(parentOrigin)}, ${JSON.stringify(
    payload.detect ?? null,
  )});`;
  return [
    '<!doctype html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<script>${escapeScript(capture)}</script>`,
    payload.css ? `<style>${payload.css.replace(/<\/style/gi, '<\\/style')}</style>` : '',
    '</head>',
    '<body>',
    payload.html,
    payload.js ? `<script type="module">${escapeScript(payload.js)}</script>` : '',
    '</body>',
    '</html>',
  ].join('\n');
}

/**
 * iframe 内で実行される関数。toString() して埋め込むので、外側の変数を参照しないこと。
 */
function captureConsole(parentOrigin: string, detect: string | null) {
  const post = (message: unknown) => parent.postMessage(message, parentOrigin);
  const format = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (value instanceof Node) return `<${value.nodeName.toLowerCase()}>`;
    try {
      return JSON.stringify(value, null, 2) ?? String(value);
    } catch {
      return String(value);
    }
  };
  for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      post({ type: 'wpp:console', level, args: args.map(format) });
    };
  }
  addEventListener('error', (event) => {
    post({ type: 'wpp:error', message: event.message, stack: event.error?.stack });
  });
  addEventListener('unhandledrejection', (event) => {
    post({ type: 'wpp:error', message: `Unhandled rejection: ${format(event.reason)}` });
  });
  addEventListener('load', () => {
    if (detect) {
      try {
        const result = new Function(`return (${detect});`)();
        post({
          type: 'wpp:detect',
          expression: detect,
          result: format(result),
          ok: Boolean(result),
        });
      } catch (error) {
        post({ type: 'wpp:detect', expression: detect, result: format(error), ok: false });
      }
    }
    // module スクリプトの同期部分が終わるのを待ってから完了を通知する
    setTimeout(() => post({ type: 'wpp:done' }), 0);
  });
}
