(function (root) {
  'use strict';
  const selectedRegions = {
    left: ['a', 'intersection'], right: ['b', 'intersection'],
    union: ['a', 'intersection', 'b'], intersection: ['intersection'],
    differenceA: ['a'], differenceB: ['b'],
    complementA: ['outside', 'b'], complementB: ['outside', 'a']
  };
  let nextId = 0;
  const prefixes = new WeakMap();
  function render(container) {
    const prefix = `venn-${++nextId}-`;
    prefixes.set(container, prefix);
    container.innerHTML = `<svg viewBox="0 0 560 310" role="img" aria-labelledby="venn-title venn-description">
      <title id="venn-title">Diagrama de Venn de A y B en U</title>
      <desc id="venn-description">Las regiones sombreadas representan la operación seleccionada.</desc>
      <defs>
        <pattern id="region-pattern" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#a8d4b9"/><path d="M0 7L7 0" stroke="#74af90" stroke-width=".6" opacity=".45"/></pattern>
        <mask id="outside-mask"><rect x="20" y="15" width="520" height="280" fill="white"/><circle cx="220" cy="155" r="102" fill="black"/><circle cx="340" cy="155" r="102" fill="black"/></mask>
        <mask id="a-only-mask"><rect width="560" height="310" fill="white"/><circle cx="340" cy="155" r="102" fill="black"/></mask>
        <mask id="b-only-mask"><rect width="560" height="310" fill="white"/><circle cx="220" cy="155" r="102" fill="black"/></mask>
        <clipPath id="clip-b"><circle cx="340" cy="155" r="102"/></clipPath>
      </defs>
      <rect x="20" y="15" width="520" height="280" rx="12" fill="#f8faf6"/>
      <rect data-region="outside" x="20" y="15" width="520" height="280" rx="12" mask="url(#outside-mask)" fill="transparent"/>
      <circle data-region="a" cx="220" cy="155" r="102" mask="url(#a-only-mask)" fill="transparent"/>
      <circle data-region="b" cx="340" cy="155" r="102" mask="url(#b-only-mask)" fill="transparent"/>
      <circle data-region="intersection" cx="220" cy="155" r="102" clip-path="url(#clip-b)" fill="transparent"/>
      <rect x="20" y="15" width="520" height="280" rx="12" fill="none" stroke="#c7d4c8" stroke-width="1.5"/>
      <circle cx="220" cy="155" r="102" fill="none" stroke="#47866c" stroke-width="2"/>
      <circle cx="340" cy="155" r="102" fill="none" stroke="#7e83a4" stroke-width="2"/>
      <g font-family="Georgia, serif" font-style="italic" font-size="24"><text x="40" y="47" fill="#72826b">U</text><text x="174" y="164" fill="#245e46">A</text><text x="369" y="164" fill="#585d81">B</text></g>
    </svg>`.replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
      .replace('aria-labelledby="venn-title venn-description"', `aria-labelledby="${prefix}venn-title ${prefix}venn-description"`);
  }
  function update(container, operation, description) {
    const selected = selectedRegions[operation] || [];
    container.querySelectorAll('[data-region]').forEach(region => {
      region.setAttribute('fill', selected.includes(region.dataset.region) ? `url(#${prefixes.get(container)}region-pattern)` : 'transparent');
    });
    container.querySelector('desc').textContent = description;
  }
  root.Venn = Object.freeze({ render, update });
})(globalThis);
