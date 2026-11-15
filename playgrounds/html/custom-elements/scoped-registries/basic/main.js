if (typeof CustomElementRegistry !== 'function' || !('customElementRegistry' in ShadowRoot.prototype)) {
  console.log('scoped registries: 未対応');
} else {
  // 同じタグ名 x-badge を、グローバルとスコープ付きの2つで別実装（別の見た目）にする
  const make = (label, css) =>
    class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML =
          `<style>:host { display: inline-block; padding: .25rem .75rem; ${css} }</style>[${label}] <slot></slot>`;
      }
    };

  customElements.define('x-badge', make('global', 'background: gainsboro; border-radius: 0;'));

  const scoped = {
    'host-a': ['A', 'background: tomato; color: white; border-radius: 999px;'],
    'host-b': ['B', 'background: seagreen; color: white; border-radius: .25rem; font-weight: bold;'],
  };
  for (const [id, [label, css]] of Object.entries(scoped)) {
    const registry = new CustomElementRegistry();
    registry.define('x-badge', make(label, css)); // グローバルと同名でも衝突しない
    const shadow = document.getElementById(id).attachShadow({ mode: 'open', customElementRegistry: registry });
    shadow.innerHTML = '<x-badge>scoped</x-badge>';
    console.log(id, 'registry は自前:', shadow.customElementRegistry === registry);
  }
  console.log('x-badge（グローバル）:', customElements.get('x-badge') !== undefined);
}
