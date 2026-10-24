/* Coordinación de la interfaz. Los cálculos están en Conjuntos y Motor. */
(function () {
  'use strict';

  const byId = id => document.getElementById(id);
  const countLabel = count => `${count} elemento${count === 1 ? '' : 's'}`;
  const formatSet = values => values.length ? `{${values.join(', ')}}` : '∅';

  function formatResult(value) {
    if (Array.isArray(value)) return formatSet(value);
    if (typeof value === 'boolean') return value ? 'Verdadero' : 'Falso';
    return String(value);
  }

  function initNavigation() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    function activate(tab, moveFocus) {
      for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        byId(item.getAttribute('aria-controls')).hidden = !selected;
      }
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab, false));
      tab.addEventListener('keydown', event => {
        let destination;
        if (event.key === 'ArrowRight') destination = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') destination = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') destination = 0;
        if (event.key === 'End') destination = tabs.length - 1;
        if (destination !== undefined) {
          event.preventDefault();
          activate(tabs[destination], true);
        }
      });
    });
  }

  function initIntroduction() {
    const inputs = { universe: byId('universe'), a: byId('set-a'), b: byId('set-b') };
    const diagram = byId('venn-container');
    const buttons = [...byId('intro-panel').querySelectorAll('[data-operation]')];
    let selectedOperation = 'union';

    function refresh() {
      const sets = {};
      for (const [name, input] of Object.entries(inputs)) {
        sets[name] = Conjuntos.parse(input.value);
        byId(`${name}-count`).textContent = `${countLabel(sets[name].length)} únicos`;
        input.removeAttribute('aria-invalid');
        input.setAttribute('aria-describedby', 'input-help');
      }
      const { universe, a, b } = sets;
      const operation = Conjuntos.operations[selectedOperation];
      const { elements, errors } = Conjuntos.calculate(selectedOperation, universe, a, b);
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.operation === selectedOperation)));
      byId('operation-title').textContent = operation.name;
      byId('operation-description').textContent = operation.description;
      byId('message').hidden = !errors.length;
      byId('message').textContent = errors.map(error => error.message).join(' ');
      for (const error of errors) {
        for (const field of error.fields) {
          byId(field).setAttribute('aria-invalid', 'true');
          byId(field).setAttribute('aria-describedby', 'input-help message');
        }
      }
      if (errors.length) {
        byId('result-value').textContent = 'Revisa los conjuntos';
        byId('result-count').textContent = 'Pendiente';
        byId('result-note').textContent = 'Corrige los datos indicados para obtener el resultado.';
        Venn.update(diagram, null, 'Corrige los datos de entrada.');
        return;
      }
      byId('result-value').textContent = `${operation.symbol} = ${formatSet(elements)}`;
      byId('result-count').textContent = countLabel(elements.length);
      byId('result-note').textContent = selectedOperation.startsWith('complement')
        ? `Respecto de U = ${formatSet(universe)}.`
        : universe.length ? 'A y B son subconjuntos del universo U.'
          : 'U no está definido. No es necesario para esta operación; el marco es esquemático.';
      Venn.update(diagram, selectedOperation, `${operation.symbol}: ${operation.description}`);
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      selectedOperation = button.dataset.operation;
      refresh();
    }));
    Object.values(inputs).forEach(input => input.addEventListener('input', refresh));
    byId('example').addEventListener('click', () => {
      inputs.universe.value = '1,2,3,4,5,6';
      inputs.a.value = '1,2,3';
      inputs.b.value = '3,4,5';
      refresh();
    });
    byId('clear').addEventListener('click', () => {
      Object.values(inputs).forEach(input => { input.value = ''; });
      refresh();
      inputs.universe.focus();
    });
    Venn.render(diagram);
    refresh();
  }

  function initSql() {
    const selector = byId('sql-operation-select');
    const diagram = byId('sql-venn');
    const { U, A, B } = SqlExamples.sampleData;
    Venn.render(diagram);

    // Las tres tablas de ejemplo son fijas e independientes de las otras pestañas.
    for (const name of ['U', 'A', 'B']) {
      const block = document.createElement('div');
      block.className = 'sql-data-set';
      const title = document.createElement('strong');
      title.textContent = name;
      const contents = document.createElement('span');
      contents.textContent = formatSet(SqlExamples.sampleData[name]);
      block.append(title, contents);
      byId('sql-dataset').append(block);
    }

    function refresh() {
      const key = selector.value;
      const operation = Conjuntos.operations[key];
      const example = SqlExamples.operations[key];
      // La salida se calcula desde los datos; no se mantiene una segunda lista manual.
      const { elements } = Conjuntos.calculate(key, U, A, B);
      byId('sql-operation').textContent = operation.symbol;
      byId('sql-operation-description').textContent = operation.description;
      byId('sql-code').textContent = example.setSql;
      byId('join-code').textContent = example.joinSql;
      byId('join-explanation').textContent = example.explanation;
      byId('sql-result-label').textContent = `${operation.symbol} · ${countLabel(elements.length)}`;
      Venn.update(diagram, key, `${operation.symbol}: ${operation.description}`);
      renderOutputTable(elements);
    }

    function renderOutputTable(elements) {
      const table = document.createElement('table');
      const head = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const column = document.createElement('th');
      column.scope = 'col';
      column.textContent = 'elemento';
      headerRow.append(column);
      head.append(headerRow);
      const body = document.createElement('tbody');
      for (const element of elements) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = element;
        row.append(cell);
        body.append(row);
      }
      table.append(head, body);
      byId('sql-output').replaceChildren(table);
    }
    selector.addEventListener('change', refresh);
    refresh();
  }

  function initCalculator() {
    const quantity = byId('quantity');
    const universeInput = byId('advanced-universe');
    const expression = byId('advanced-expression');
    let saved = ['1,2,3', '3,4,5'];

    function renderFields() {
      const count = Number(quantity.value);
      if (!Number.isInteger(count) || count < 1 || count > 8) {
        quantity.setCustomValidity('Elige una cantidad entre 1 y 8.');
        quantity.setAttribute('aria-invalid', 'true');
        quantity.reportValidity();
        return false;
      }
      quantity.setCustomValidity('');
      quantity.removeAttribute('aria-invalid');
      byId('sets').replaceChildren();
      for (let index = 0; index < count; index++) {
        const name = String.fromCharCode(65 + index);
        const label = document.createElement('label');
        const input = document.createElement('input');
        label.htmlFor = `set-${name}`;
        label.textContent = `Conjunto ${name}`;
        input.id = label.htmlFor;
        input.value = saved[index] || '';
        input.setAttribute('aria-describedby', 'advanced-help');
        input.addEventListener('input', () => {
          saved[index] = input.value;
          refresh();
        });
        byId('sets').append(label, input);
      }
      renderKeys(count);
      return true;
    }

    function renderKeys(count) {
      byId('keys').replaceChildren();
      const names = Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
      const symbols = [...names, 'U', '∪', '∩', '−', '△', 'ᶜ', '(', ')', '|', '∅', '⊆', '⊂', '⊇', '⊃', '=', '≠', '∈', '∉', '∧', '∨', '¬', '→'];
      for (const symbol of symbols) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = symbol;
        button.setAttribute('aria-label', `Insertar ${symbol}`);
        button.addEventListener('click', () => {
          expression.setRangeText(symbol, expression.selectionStart, expression.selectionEnd, 'end');
          expression.focus();
          refresh();
        });
        byId('keys').append(button);
      }
    }

    function refresh() {
      const inputs = [...byId('sets').querySelectorAll('input')];
      const sets = Object.fromEntries(inputs.map(input => [input.id.slice(4), Motor.parse(input.value)]));
      const universe = Motor.parse(universeInput.value);
      const errors = [];
      for (const input of [expression, universeInput, ...inputs]) {
        input.removeAttribute('aria-invalid');
        input.setAttribute('aria-describedby', input === expression ? 'syntax' : 'advanced-help');
      }
      for (const input of inputs) {
        const outside = universe.length ? Conjuntos.difference(sets[input.id.slice(4)], universe) : [];
        if (outside.length) {
          errors.push(`${input.id.slice(4)} contiene elementos fuera de U: ${formatSet(outside)}.`);
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', 'advanced-help error');
        }
      }
      byId('error').hidden = !errors.length;
      let result = null;
      try {
        if (errors.length) throw Error(errors.join(' '));
        result = Motor.evaluate(expression.value, sets, universe);
        byId('advanced-result').textContent = formatResult(result)
          + (Array.isArray(result) ? ` · ${countLabel(result.length)}` : '');
      } catch (error) {
        byId('error').hidden = false;
        byId('error').textContent = error.message;
        if (!errors.length) {
          expression.setAttribute('aria-invalid', 'true');
          expression.setAttribute('aria-describedby', 'syntax error');
        }
        byId('advanced-result').textContent = 'Revisa los datos y la expresión.';
      }
      Distribucion.render(byId('advanced-diagram'), sets, universe, result);
      renderSummary(sets, universe, errors.length > 0);
    }

    function renderSummary(sets, universe, invalidUniverse) {
      const table = document.createElement('table');
      const head = document.createElement('thead');
      const header = document.createElement('tr');
      for (const title of ['Expresión', 'Resultado']) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = title;
        header.append(cell);
      }
      head.append(header);
      table.append(head);
      const body = document.createElement('tbody');
      const expressions = Object.keys(sets).map(name => `|${name}|`);
      if (Object.hasOwn(sets, 'B')) expressions.push('A ∪ B', 'A ∩ B', 'A − B', 'B − A', 'A △ B');
      if (universe.length) expressions.push(...Object.keys(sets).map(name => `${name}ᶜ`));
      for (const source of expressions) {
        const row = document.createElement('tr');
        const label = document.createElement('td');
        const value = document.createElement('td');
        label.textContent = source;
        value.textContent = invalidUniverse ? 'Revisa U' : formatResult(Motor.evaluate(source, sets, universe));
        row.append(label, value);
        body.append(row);
      }
      table.append(body);
      byId('summary').replaceChildren(table);
    }

    quantity.addEventListener('input', () => {
      quantity.setCustomValidity('');
      quantity.removeAttribute('aria-invalid');
    });
    quantity.addEventListener('change', () => { if (renderFields()) refresh(); });
    universeInput.addEventListener('input', refresh);
    expression.addEventListener('input', refresh);
    byId('calculate').addEventListener('click', refresh);
    expression.addEventListener('keydown', event => { if (event.key === 'Enter') refresh(); });
    byId('advanced-example').addEventListener('click', () => {
      quantity.value = 3;
      saved = ['1,2,3', '3,4,5', '2,5,6'];
      universeInput.value = '1,2,3,4,5,6';
      expression.value = '(A ∪ B) − C';
      renderFields();
      refresh();
    });
    byId('advanced-clear').addEventListener('click', () => {
      saved = [];
      universeInput.value = '';
      expression.value = 'A';
      if (renderFields()) refresh();
      universeInput.focus();
    });
    renderFields();
    refresh();
  }

  // Registrar la navegación primero evita que un fallo de un panel la deje sin eventos.
  initNavigation();
  initIntroduction();
  initCalculator();
  initSql();
})();
