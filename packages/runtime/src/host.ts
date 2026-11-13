import { isSandboxMessage, type RunPayload, type SandboxToParent } from './protocol.ts';

export interface SandboxHostOptions {
  iframe: HTMLIFrameElement;
  /** sandbox のオリジン（例: https://run.example.dev）。これ以外からのメッセージは捨てる */
  sandboxOrigin: string;
  /** iframe に読み込む sandbox 上のパス（例: /run/css/properties/anchor-name/） */
  runnerPath: string;
  onMessage: (message: SandboxToParent) => void;
}

/**
 * 親ページ側。実行のたびに iframe を読み込み直し、ready を待ってからコードを送る。
 * 毎回まっさらな文書で実行されるので、前回の実行の状態が残らない。
 */
export function createSandboxHost({
  iframe,
  sandboxOrigin,
  runnerPath,
  onMessage,
}: SandboxHostOptions) {
  let pending: RunPayload | null = null;

  const listener = (event: MessageEvent) => {
    if (event.origin !== sandboxOrigin || event.source !== iframe.contentWindow) return;
    if (!isSandboxMessage(event.data)) return;
    if (event.data.type === 'wpp:ready' && pending) {
      iframe.contentWindow?.postMessage({ type: 'wpp:run', payload: pending }, sandboxOrigin);
      pending = null;
      return;
    }
    onMessage(event.data);
  };
  addEventListener('message', listener);

  return {
    run(payload: RunPayload) {
      pending = payload;
      const url = new URL(runnerPath, sandboxOrigin);
      url.searchParams.set('t', Date.now().toString(36));
      iframe.src = url.href;
    },
    dispose() {
      removeEventListener('message', listener);
    },
  };
}
