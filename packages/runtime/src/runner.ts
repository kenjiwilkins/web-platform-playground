import { composeDocument } from './compose.ts';
import type { ParentToSandbox } from './protocol.ts';

/**
 * sandbox 側の runner ページで動くスクリプト。
 * 許可された親オリジンからコードを受け取り、文書をまるごと置き換えて実行する。
 */
export function startRunner(allowedParentOrigins: readonly string[]) {
  addEventListener('message', (event: MessageEvent<ParentToSandbox>) => {
    if (!allowedParentOrigins.includes(event.origin)) return;
    if (event.data?.type !== 'wpp:run') return;
    const html = composeDocument(event.data.payload, event.origin);
    document.open();
    document.write(html);
    document.close();
  });
  for (const origin of allowedParentOrigins) {
    // 親のオリジンは referrer からは確定できないので、許可リスト全てに ready を送る
    parent.postMessage({ type: 'wpp:ready' }, origin);
  }
}
