interface ImportMetaEnv {
  /** sandbox（実行専用オリジン）。例: https://wpp-sandbox.vercel.app */
  readonly PUBLIC_SANDBOX_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
