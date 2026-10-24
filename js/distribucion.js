/* Agrupa elementos por pertenencia y dibuja la vista de la calculadora avanzada. */
(function (root) {
  'use strict';

  const formatSet = values => values.length ? `{${values.join(', ')}}` : '∅';

  function groupRegions(sets, universe) {
    const names = Object.keys(sets);
    const elements = Conjuntos.normalize([...universe, ...Object.values(sets).flat()]);
    const regions = new Map();
    for (const element of elements) {
      // Ejemplo con A, B y C: 101 significa pertenecer a A y C, pero no a B.
      const membership = names.map(name => sets[name].includes(element) ? '1' : '0').join('');
      if (!regions.has(membership)) regions.set(membership, []);
      regions.get(membership).push(element);
    }
    return regions;
  }

  function drawCircles(names, universe, regions, selected) {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', '0 0 560 410');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', 'advanced-venn-title');

    function appendShape(tag, attributes) {
      const node = document.createElementNS(namespace, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      svg.append(node);
      return node;
    }

    const title = appendShape('title', { id: 'advanced-venn-title' });
    title.textContent = `Distribución de ${names.join(', ')}. Las tarjetas detallan las pertenencias exactas.`;
    const layouts = {
      1: [[280, 200, 125]],
      2: [[220, 200, 125], [340, 200, 125]],
      3: [[220, 160, 118], [340, 160, 118], [280, 260, 118]]
    };
    const circles = layouts[names.length];
    appendShape('rect', { x: 5, y: 5, width: 550, height: 400, rx: 12, fill: '#f8faf8', stroke: '#b9ccbf' });

    // Se muestrea la geometría en pasos de cuatro unidades y se agrupan tramos verdes.
    const highlighted = new Set([...regions]
      .filter(([, elements]) => elements.some(element => selected.has(element)))
      .map(([membership]) => membership));
    for (let y = 10; y < 400; y += 4) {
      let start = 10;
      let previous = false;
      for (let x = 10; x <= 550; x += 4) {
        const membership = circles.map(([cx, cy, radius]) =>
          (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2 ? '1' : '0').join('');
        const active = x < 550 && highlighted.has(membership);
        if (active !== previous) {
          if (previous) appendShape('rect', { x: start, y, width: x - start, height: 4, fill: '#a8d8ba' });
          start = x;
        }
        previous = active;
      }
    }

    const colors = ['#287d60', '#7770ab', '#b97a32'];
    circles.forEach(([cx, cy, radius], index) => {
      appendShape('circle', { cx, cy, r: radius, fill: 'none', stroke: colors[index], 'stroke-width': 2 });
      const label = appendShape('text', {
        x: cx + (index === 0 ? -70 : index === 1 ? 70 : 0),
        y: cy + (index === 2 ? 75 : -60),
        'text-anchor': 'middle', fill: '#234f3f', 'font-size': 24
      });
      label.textContent = names[index];
    });
    const label = appendShape('text', { x: 22, y: 32, fill: '#526d5f', 'font-size': 18 });
    label.textContent = universe.length ? 'U' : 'Marco esquemático · U no definido';
    return svg;
  }

  function render(host, sets, universe, result) {
    host.replaceChildren();
    const names = Object.keys(sets);
    const regions = groupRegions(sets, universe);
    const selected = new Set(Array.isArray(result) ? result : []);
    if (names.length <= 3) host.append(drawCircles(names, universe, regions, selected));

    const grid = document.createElement('div');
    grid.className = 'region-grid';
    for (const [membership, elements] of regions) {
      const inside = names.filter((_, index) => membership[index] === '1');
      const outside = names.filter((_, index) => membership[index] === '0');
      const matches = elements.filter(element => selected.has(element));
      const card = document.createElement('div');
      card.className = 'region' + (matches.length ? ' selected' : '');
      const heading = document.createElement('b');
      heading.textContent = inside.length
        ? 'En ' + inside.join(' ∩ ') + (outside.length ? ' · fuera de ' + outside.join(', ') : '')
        : 'Fuera de todos';
      const text = document.createElement('p');
      text.textContent = formatSet(elements);
      card.append(heading, text);
      if (Array.isArray(result)) {
        const note = document.createElement('small');
        note.textContent = 'Resultado en esta región: ' + formatSet(matches);
        card.append(note);
      }
      grid.append(card);
    }
    if (!regions.size) {
      const message = document.createElement('p');
      message.textContent = 'No hay elementos definidos.';
      grid.append(message);
    }
    host.append(grid);
  }

  root.Distribucion = Object.freeze({ groupRegions, render });
})(globalThis);
