/* Vista MVC: actualiza el DOM y crea elementos visuales. No decide operaciones. */
(function (root) {
  'use strict';
  const byId = id => document.getElementById(id);
  const countLabel = count => `${count} elemento${count === 1 ? '' : 's'}`;
  const formatSet = values => values.length ? `{${values.join(', ')}}` : '∅';
  const formatResult = value => Array.isArray(value) ? formatSet(value) : typeof value === 'boolean' ? (value ? 'Verdadero' : 'Falso') : String(value);

  function setText(id, value) { byId(id).textContent = value; }
  function setInput(id, value) { byId(id).value = value; }
  function renderNavigation(tabs, active, moveFocus) {
    tabs.forEach(tab => { const selected = tab === active; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; byId(tab.getAttribute('aria-controls')).hidden = !selected; });
    if (moveFocus) active.focus();
  }
  function renderIntro(state, diagram, buttons) {
    Object.entries(state.inputs).forEach(([name, value]) => { setInput(name === 'a' ? 'set-a' : name === 'b' ? 'set-b' : name, value); setText(`${name}-count`, `${countLabel(state[name].length)} únicos`); });
    const operation = Conjuntos.operations[state.operation];
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.operation === state.operation)));
    setText('operation-title', operation.name); setText('operation-description', operation.description);
    const message = byId('message'); message.hidden = !state.errors.length; message.textContent = state.errors.map(error => error.message).join(' ');
    ['universe', 'set-a', 'set-b'].forEach(id => { const input = byId(id); input.removeAttribute('aria-invalid'); input.setAttribute('aria-describedby', 'input-help'); });
    state.errors.forEach(error => error.fields.forEach(field => { const input = byId(field); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'input-help message'); }));
    if (state.errors.length) { setText('result-value', 'Revisa los conjuntos'); setText('result-count', 'Pendiente'); setText('result-note', 'Corrige los datos indicados para obtener el resultado.'); Venn.update(diagram, null, 'Corrige los datos de entrada.'); return; }
    setText('result-value', `${operation.symbol} = ${formatSet(state.elements)}`); setText('result-count', countLabel(state.elements.length)); setText('result-note', state.operation.startsWith('complement') ? `Respecto de U = ${formatSet(state.universe)}.` : state.universe.length ? 'A y B son subconjuntos del universo U.' : 'U no está definido. No es necesario para esta operación; el marco es esquemático.');
    Venn.update(diagram, state.operation, `${operation.symbol}: ${operation.description}`);
  }
  function renderSql(state, diagram) {
    const { operation, example, elements } = state;
    setText('sql-operation', operation.symbol); setText('sql-operation-description', operation.description); setText('sql-code', example.setSql); setText('join-code', example.joinSql); setText('join-explanation', example.explanation); setText('sql-result-label', `${operation.symbol} · ${countLabel(elements.length)}`); Venn.update(diagram, state.key, `${operation.symbol}: ${operation.description}`);
    const dataset = byId('sql-dataset'); dataset.replaceChildren(); Object.entries({ U: state.U, A: state.A, B: state.B }).forEach(([name, values]) => { const block = document.createElement('div'); block.className = 'sql-data-set'; const title = document.createElement('strong'); title.textContent = name; const contents = document.createElement('span'); contents.textContent = formatSet(values); block.append(title, contents); dataset.append(block); });
    const table = document.createElement('table'); table.innerHTML = '<thead><tr><th scope="col">elemento</th></tr></thead>'; const body = document.createElement('tbody'); elements.forEach(element => { const row = document.createElement('tr'); const cell = document.createElement('td'); cell.textContent = element; row.append(cell); body.append(row); }); table.append(body); byId('sql-output').replaceChildren(table);
  }
  function renderCalculator(state) {
    const quantity = state.quantity; const setsHost = byId('sets'); setsHost.replaceChildren();
    for (let index = 0; index < quantity; index++) { const name = String.fromCharCode(65 + index); const label = document.createElement('label'); const input = document.createElement('input'); label.htmlFor = `set-${name}`; label.textContent = `Conjunto ${name}`; input.id = label.htmlFor; input.value = state.saved[index] || ''; input.setAttribute('aria-describedby', 'advanced-help'); setsHost.append(label, input); }
    byId('keys').replaceChildren(); const names = Array.from({ length: quantity }, (_, index) => String.fromCharCode(65 + index)); [...names, 'U', '∪', '∩', '−', '△', 'ᶜ', '(', ')', '|', '∅', '⊆', '⊂', '⊇', '⊃', '=', '≠', '∈', '∉', '∧', '∨', '¬', '→'].forEach(symbol => { const button = document.createElement('button'); button.type = 'button'; button.textContent = symbol; button.setAttribute('aria-label', `Insertar ${symbol}`); byId('keys').append(button); });
    const error = byId('error'); const messages = state.errors.map(item => `${item.name} contiene elementos fuera de U: ${formatSet(item.outside)}.`); error.hidden = !(messages.length || state.expressionError); error.textContent = messages.join(' ') || (state.expressionError ? state.expressionError.message : ''); setText('advanced-result', state.errors.length || state.expressionError ? 'Revisa los datos y la expresión.' : formatResult(state.result) + (Array.isArray(state.result) ? ` · ${countLabel(state.result.length)}` : '')); Distribucion.render(byId('advanced-diagram'), state.sets, state.universe, state.result); renderSummary(state);
  }
  function renderSummary(state) { const table = document.createElement('table'); table.innerHTML = '<thead><tr><th>Expresión</th><th>Resultado</th></tr></thead>'; const body = document.createElement('tbody'); state.summary.forEach(({ source, value }) => { const row = document.createElement('tr'); const label = document.createElement('td'); const cell = document.createElement('td'); label.textContent = source; cell.textContent = value === null ? 'Revisa U' : formatResult(value); row.append(label, cell); body.append(row); }); table.append(body); byId('summary').replaceChildren(table); }
  root.Vista = Object.freeze({ byId, formatSet, renderNavigation, renderIntro, renderSql, renderCalculator, setText, setInput });
})(globalThis);
