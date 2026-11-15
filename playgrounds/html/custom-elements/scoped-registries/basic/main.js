if (typeof CustomElementRegistry !== 'function' || !('customElementRegistry' in ShadowRoot.prototype)) {
  console.log('scoped registries: 未対応');
} else {
  // 同じタグ名 x-badge を、グローバルとスコープ付きの2つで別実装にする
  const make = (label) =>
    class extends HTMLElement {
      connectedCallback() {
        this.textContent = `[${label}] ` + this.textContent.replace(/^\[.*?\] /, '');
      }
    };

  customElements.define('x-badge', make('global'));

  for (const [id, label] of [['host-a', 'A'], ['host-b', 'B']]) {
    const registry = new CustomElementRegistry();
    registry.define('x-badge', make(label)); // グローバルと同名でも衝突しない
    const shadow = document.getElementById(id).attachShadow({ mode: 'open', customElementRegistry: registry });
    shadow.innerHTML = '<x-badge>scoped</x-badge>';
    console.log(id, 'registry は自前:', shadow.customElementRegistry === registry);
  }
  console.log('x-badge（グローバル）:', customElements.get('x-badge') !== undefined);
}
