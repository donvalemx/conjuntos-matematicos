/* Modelo de la aplicación: estado y reglas de cada recorrido. No conoce el DOM. */
(function (root) {
  'use strict';

  class IntroModel {
    constructor() {
      this.operation = 'union';
      this.inputs = { universe: '1,2,3,4,5,6', a: '1,2,3', b: '3,4,5' };
    }
    setInput(name, value) { this.inputs[name] = value; }
    setOperation(operation) { this.operation = operation; }
    evaluate() {
      const sets = Object.fromEntries(Object.entries(this.inputs).map(([name, value]) => [name, Conjuntos.parse(value)]));
      return { ...sets, ...Conjuntos.calculate(this.operation, sets.universe, sets.a, sets.b) };
    }
    loadExample() { this.inputs = { universe: '1,2,3,4,5,6', a: '1,2,3', b: '3,4,5' }; }
    clear() { this.inputs = { universe: '', a: '', b: '' }; }
  }

  class CalculatorModel {
    constructor() {
      this.quantity = 2;
      this.saved = ['1,2,3', '3,4,5'];
      this.universe = '1,2,3,4,5,6';
      this.expression = 'A ∪ B';
    }
    setQuantity(value) { this.quantity = Number(value); }
    setSet(index, value) { this.saved[index] = value; }
    setUniverse(value) { this.universe = value; }
    setExpression(value) { this.expression = value; }
    getSets() {
      return Object.fromEntries(this.saved.slice(0, this.quantity).map((value, index) => [String.fromCharCode(65 + index), Motor.parse(value)]));
    }
    evaluate() {
      const sets = this.getSets();
      const universe = Motor.parse(this.universe);
      const errors = [];
      for (const [name, values] of Object.entries(sets)) {
        const outside = Conjuntos.difference(values, universe);
        if (universe.length && outside.length) errors.push({ name, outside });
      }
      let result = null;
      let expressionError = null;
      if (!errors.length) {
        try { result = Motor.evaluate(this.expression, sets, universe); }
        catch (error) { expressionError = error; }
      }
      const expressions = Object.keys(sets).map(name => `|${name}|`);
      if (Object.hasOwn(sets, 'B')) expressions.push('A ∪ B', 'A ∩ B', 'A − B', 'B − A', 'A △ B');
      if (universe.length) expressions.push(...Object.keys(sets).map(name => `${name}ᶜ`));
      const summary = expressions.map(source => ({ source, value: errors.length ? null : Motor.evaluate(source, sets, universe) }));
      return { sets, universe, errors, result, expressionError, summary };
    }
    loadExample() { this.quantity = 3; this.saved = ['1,2,3', '3,4,5', '2,5,6']; this.universe = '1,2,3,4,5,6'; this.expression = '(A ∪ B) − C'; }
    clear() { this.saved = []; this.universe = ''; this.expression = 'A'; }
  }

  class SqlModel {
    constructor() { this.operation = 'union'; }
    setOperation(operation) { this.operation = operation; }
    evaluate() {
      const { U, A, B } = SqlExamples.sampleData;
      const operation = Conjuntos.operations[this.operation];
      const example = SqlExamples.operations[this.operation];
      const { elements } = Conjuntos.calculate(this.operation, U, A, B);
      return { key: this.operation, U, A, B, operation, example, elements };
    }
  }

  root.Modelo = Object.freeze({ IntroModel, CalculatorModel, SqlModel });
})(globalThis);
