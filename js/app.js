(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const inputs = { universe: byId('universe'), a: byId('set-a'), b: byId('set-b') };
  const container = byId('venn-container');
  const buttons = [...document.querySelectorAll('[data-operation]')];
  let selectedOperation = 'union';
  const countLabel = count => `${count} elemento${count === 1 ? '' : 's'}`;
  function refresh() {
    const { universe, a, b } = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, Conjuntos.parse(input.value)]));
    for (const [key, set] of Object.entries({ universe, a, b })) {
      byId(`${key}-count`).textContent = `${countLabel(set.length)} únicos`;
      inputs[key].removeAttribute('aria-invalid');
      inputs[key].setAttribute('aria-describedby', 'input-help');
    }
    const operation = Conjuntos.operations[selectedOperation];
    const { elements, errors } = Conjuntos.calculate(selectedOperation, universe, a, b);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.operation === selectedOperation)));
    byId('operation-title').textContent = operation.name;
    byId('operation-description').textContent = operation.description;
    byId('sql-operation').textContent = operation.symbol;
    const example = SqlExamples.operations[selectedOperation];
    byId('sql-code').textContent = example.setSql;
    byId('join-code').textContent = example.joinSql;
    byId('join-explanation').textContent = example.explanation;
    const message = byId('message');
    message.hidden = errors.length === 0;
    message.textContent = errors.map(error => error.message).join(' ');
    for (const error of errors) for (const field of error.fields) {
      byId(field).setAttribute('aria-invalid', 'true');
      byId(field).setAttribute('aria-describedby', 'input-help message');
    }
    if (errors.length) {
      byId('result-value').textContent = 'Revisa los conjuntos';
      byId('result-count').textContent = 'Pendiente';
      byId('result-note').textContent = 'Corrige los datos indicados para obtener el resultado.';
      Venn.update(container, null, 'No hay una región seleccionada: corrige los datos de entrada.');
      return;
    }
    byId('result-value').textContent = `${operation.symbol} = ${elements.length ? `{${elements.join(',')}}` : '∅'}`;
    byId('result-count').textContent = countLabel(elements.length);
    byId('result-note').textContent = selectedOperation.startsWith('complement')
      ? `Respecto de U = {${universe.join(',')}}.`
      : universe.length ? 'A y B son subconjuntos del universo U.' : 'U no está definido. No es necesario para esta operación; el marco es esquemático.';
    Venn.update(container, selectedOperation, `${operation.symbol}: ${operation.description} Las regiones sombreadas representan esta operación, independientemente del número de elementos.`);
  }
  buttons.forEach(button => button.addEventListener('click', () => { selectedOperation = button.dataset.operation; refresh(); }));
  Object.values(inputs).forEach(input => input.addEventListener('input', refresh));
  byId('example').addEventListener('click', () => {
    inputs.universe.value = '1,2,3,4,5,6'; inputs.a.value = '1,2,3'; inputs.b.value = '3,4,5'; refresh();
  });
  byId('clear').addEventListener('click', () => { Object.values(inputs).forEach(input => { input.value = ''; }); refresh(); inputs.universe.focus(); });
  for (const item of SqlExamples.guide) {
    const card = document.createElement('article');
    card.className = 'sql-panel join-reference';
    const heading = document.createElement('h3');
    heading.textContent = item.title;
    const diagram = document.createElement('div');
    diagram.className = 'venn-container';
    const explanation = document.createElement('p');
    explanation.textContent = item.explanation;
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = item.joinSql;
    pre.append(code);
    card.append(heading, diagram, explanation, pre);
    byId('join-guide').append(card);
    Venn.render(diagram);
    Venn.update(diagram, item.region, `${item.title}: ${item.explanation}`);
  }
  Venn.render(container);
  refresh();
})();
