/* Controladores MVC: traducen eventos de la interfaz a cambios del modelo. */
(function () {
  'use strict';
  const { byId, renderNavigation, renderIntro, renderSql, renderCalculator } = Vista;
  function initNavigation() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const activate = (tab, focus) => renderNavigation(tabs, tab, focus);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab, false));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target !== undefined) { event.preventDefault(); activate(tabs[target], true); }
      });
    });
  }
  function initIntroduction() {
    const model = new Modelo.IntroModel(); const diagram = byId('venn-container'); const buttons = [...byId('intro-panel').querySelectorAll('[data-operation]')]; const ids = { universe: 'universe', a: 'set-a', b: 'set-b' }; const refresh = () => renderIntro({ ...model.evaluate(), operation: model.operation, inputs: { ...model.inputs } }, diagram, buttons);
    buttons.forEach(button => button.addEventListener('click', () => { model.setOperation(button.dataset.operation); refresh(); }));
    Object.entries(ids).forEach(([name, id]) => byId(id).addEventListener('input', event => { model.setInput(name, event.target.value); refresh(); }));
    byId('example').addEventListener('click', () => { model.loadExample(); refresh(); }); byId('clear').addEventListener('click', () => { model.clear(); refresh(); byId('universe').focus(); }); Venn.render(diagram); refresh();
  }
  function initCalculator() {
    const model = new Modelo.CalculatorModel(); const quantity = byId('quantity'); const universe = byId('advanced-universe'); const expression = byId('advanced-expression');
    const bindSetInputs = () => [...byId('sets').querySelectorAll('input')].forEach(input => input.addEventListener('input', event => { model.setSet(input.id.charCodeAt(4) - 65, event.target.value); refresh(); }));
    const refresh = () => {
      const count = Number(quantity.value);
      if (!Number.isInteger(count) || count < 1 || count > 8) { quantity.setCustomValidity('Elige una cantidad entre 1 y 8.'); quantity.setAttribute('aria-invalid', 'true'); return; }
      quantity.setCustomValidity(''); quantity.removeAttribute('aria-invalid'); model.setQuantity(count); model.setUniverse(universe.value); model.setExpression(expression.value); renderCalculator({ ...model.evaluate(), quantity: model.quantity, saved: [...model.saved] }); bindSetInputs();
    };
    quantity.addEventListener('change', refresh); universe.addEventListener('input', refresh); expression.addEventListener('input', refresh); byId('calculate').addEventListener('click', refresh); expression.addEventListener('keydown', event => { if (event.key === 'Enter') refresh(); });
    byId('keys').addEventListener('click', event => { if (event.target.tagName !== 'BUTTON') return; expression.setRangeText(event.target.textContent, expression.selectionStart, expression.selectionEnd, 'end'); expression.focus(); refresh(); });
    byId('advanced-example').addEventListener('click', () => { model.loadExample(); quantity.value = model.quantity; universe.value = model.universe; expression.value = model.expression; refresh(); }); byId('advanced-clear').addEventListener('click', () => { model.clear(); quantity.value = model.quantity; universe.value = model.universe; expression.value = model.expression; refresh(); universe.focus(); }); refresh();
  }
  function initSql() { const model = new Modelo.SqlModel(); const selector = byId('sql-operation-select'); const diagram = byId('sql-venn'); Venn.render(diagram); const refresh = () => renderSql(model.evaluate(), diagram); selector.addEventListener('change', () => { model.setOperation(selector.value); refresh(); }); refresh(); }
  initNavigation(); initIntroduction(); initCalculator(); initSql();
})();
