/* Agrupa elementos por pertenencia y dibuja la vista de la calculadora avanzada. */
(function (root) {
  'use strict';

  const formatSet = values => values.length ? `{${values.join(', ')}}` : '∅';
  let nextDiagramId = 0;

  function groupRegions(sets, universe) {
    const names = Object.keys(sets).slice(0, 5);
    const elements = Conjuntos.normalize([...universe, ...Object.values(sets).flat()]);
    const regions = new Map();

    // La clave binaria indica pertenencia en el mismo orden que los nombres.
    for (const element of elements) {
      const membership = names.map(name => sets[name].includes(element) ? '1' : '0').join('');
      if (!regions.has(membership)) regions.set(membership, []);
      regions.get(membership).push(element);
    }
    return regions;
  }

  function drawCircles(names, universe, regions, selected) {
    const namespace = 'http://www.w3.org/2000/svg';
    const diagramId = ++nextDiagramId;
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

    function appendTo(parent, tag, attributes) {
      const node = document.createElementNS(namespace, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      parent.append(node);
      return node;
    }

    const title = appendShape('title', { id: 'advanced-venn-title' });
    title.textContent = `Distribución de ${names.join(', ')}. Las tarjetas detallan las pertenencias exactas.`;
    const layouts = {
      1: [[280, 200, 125]],
      2: [[220, 200, 125], [340, 200, 125]],
      3: [[220, 160, 118], [340, 160, 118], [280, 260, 118]],
      4: [[215, 150, 92], [345, 150, 92], [215, 265, 92], [345, 265, 92]],
      5: [[220, 135, 92], [340, 135, 92], [185, 225, 92], [280, 285, 92], [375, 225, 92]]
    };
    const circles = layouts[names.length];
    appendShape('rect', { x: 5, y: 5, width: 550, height: 400, rx: 12, fill: '#f8faf8', stroke: '#b9ccbf' });

    const colors = ['#287d60', '#7770ab', '#b97a32', '#347f9a', '#a45172'];
    circles.forEach(([cx, cy, radius], index) => {
      appendShape('circle', { cx, cy, r: radius, fill: colors[index], 'fill-opacity': 0.2 });
    });

    if (selected) {
      const defs = appendShape('defs', {});
      const highlighted = new Set([...regions]
        .filter(([, elements]) => elements.some(element => selected.has(element)))
        .map(([membership]) => membership));

      // Cada máscara define una región real: dentro de todos los círculos marcados
      // y fuera de los demás. La misma clave binaria se usa en las tarjetas.
      for (let regionCode = 0; regionCode < 2 ** names.length; regionCode++) {
        const membership = Array.from({ length: names.length }, (_, index) =>
          String((regionCode >> (names.length - index - 1)) & 1)).join('');
        const included = [...membership].flatMap((bit, index) => bit === '1' ? [index] : []);
        const excluded = [...membership].flatMap((bit, index) => bit === '0' ? [index] : []);
        let clipId = null;

        included.forEach((setIndex, depth) => {
          clipId = `venn-${diagramId}-clip-${regionCode}-${depth}`;
          const clip = appendTo(defs, 'clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
          const [cx, cy, radius] = circles[setIndex];
          const circleAttributes = { cx, cy, r: radius };
          if (depth > 0) circleAttributes['clip-path'] = `url(#venn-${diagramId}-clip-${regionCode}-${depth - 1})`;
          appendTo(clip, 'circle', circleAttributes);
        });

        const maskId = `venn-${diagramId}-region-${regionCode}`;
        const mask = appendTo(defs, 'mask', {
          id: maskId, x: 5, y: 5, width: 550, height: 400,
          maskUnits: 'userSpaceOnUse', 'mask-type': 'luminance'
        });
        const area = appendTo(mask, 'rect', {
          x: 5, y: 5, width: 550, height: 400, fill: 'white'
        });
        if (clipId) area.setAttribute('clip-path', `url(#${clipId})`);
        excluded.forEach(setIndex => {
          const [cx, cy, radius] = circles[setIndex];
          appendTo(mask, 'circle', { cx, cy, r: radius, fill: 'black' });
        });

        appendShape('rect', {
          x: 5, y: 5, width: 550, height: 400,
          fill: highlighted.has(membership) ? '#24a36a' : '#ffffff',
          'fill-opacity': highlighted.has(membership) ? 0.76 : 0.48,
          mask: `url(#${maskId})`
        });
      }
    }

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
    const names = Object.keys(sets).slice(0, 5);
    const visibleSets = Object.fromEntries(names.map(name => [name, sets[name]]));
    const regions = groupRegions(visibleSets, universe);
    const selected = Array.isArray(result) ? new Set(result) : null;
    if (names.length >= 1) host.append(drawCircles(names, universe, regions, selected));

    const grid = document.createElement('div');
    grid.className = 'region-grid';
    for (const [membership, elements] of regions) {
      const inside = names.filter((_, index) => membership[index] === '1');
      const outside = names.filter((_, index) => membership[index] === '0');
      const matches = selected ? elements.filter(element => selected.has(element)) : [];
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
