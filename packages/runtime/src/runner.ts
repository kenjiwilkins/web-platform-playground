import { composeDocument } from './compose.ts';
import { isAllowedOrigin } from './origin.ts';
import type { ParentToSandbox } from './protocol.ts';

/**
 * sandbox 側の runner ページで動くスクリプト。
 * 許可された親オリジンからコードを受け取り、文書をまるごと置き換えて実行する。
 * allowedParentOrigins には `https://web-*-team.vercel.app` のようなパターンも含められる（origin.ts）。
 */
export function startRunner(allowedParentOrigins: readonly string[]) {
  addEventListener('message', (event: MessageEvent<ParentToSandbox>) => {
    if (!isAllowedOrigin(allowedParentOrigins, event.origin)) return;
    if (event.data?.type !== 'wpp:run') return;
    const html = composeDocument(event.data.payload, event.origin);
    document.open();
    document.write(html);
    document.close();
  });
  // 親のオリジンは事前に確定できず（Firefox に location.ancestorOrigins がない）、
  // 許可リストにはパターンも入るので、ready は宛先を絞らずに送る。
  // ready は合図だけで中身を持たない。コードを受け取る wpp:run は上で送信元を照合している。
  parent.postMessage({ type: 'wpp:ready' }, '*');
}
