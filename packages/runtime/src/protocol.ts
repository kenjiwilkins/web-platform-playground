/** web（親）と sandbox（iframe）の間でやり取りするメッセージ */

export interface RunPayload {
  html: string;
  css: string;
  js: string;
  /** sandbox 内で評価する対応判定の式（meta.detect） */
  detect?: string | undefined;
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type ParentToSandbox = { type: 'wpp:run'; payload: RunPayload };

export type SandboxToParent =
  | { type: 'wpp:ready' }
  | { type: 'wpp:console'; level: ConsoleLevel; args: string[] }
  | { type: 'wpp:error'; message: string; stack?: string | undefined }
  | { type: 'wpp:detect'; expression: string; result: string; ok: boolean }
  | { type: 'wpp:done' };

export const isSandboxMessage = (data: unknown): data is SandboxToParent =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as { type?: unknown }).type === 'string' &&
  (data as { type: string }).type.startsWith('wpp:');
