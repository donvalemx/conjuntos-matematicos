/* Shared namespace and classic scripts also work through file://. */
(function (root) {
  'use strict';
  const normalize = values => [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
  const parse = text => normalize(String(text ?? '').split(','));
  const union = (a, b) => normalize([...a, ...b]);
  const intersection = (a, b) => { const other = new Set(b); return normalize(a).filter(value => other.has(value)); };
  const difference = (a, b) => { const other = new Set(b); return normalize(a).filter(value => !other.has(value)); };
  const complement = (universe, set) => difference(universe, set);
  const operations = Object.freeze({
    union: { symbol: 'A ∪ B', name: 'Unión', description: 'Todos los elementos que pertenecen a A, a B o a ambos.' },
    intersection: { symbol: 'A ∩ B', name: 'Intersección', description: 'Los elementos que A y B tienen en común.' },
    differenceA: { symbol: 'A − B', name: 'Diferencia de A respecto de B', description: 'Los elementos de A que no pertenecen a B.' },
    differenceB: { symbol: 'B − A', name: 'Diferencia de B respecto de A', description: 'Los elementos de B que no pertenecen a A.' },
    complementA: { symbol: 'Aᶜ', name: 'Complemento de A', description: 'Los elementos del universo U que no pertenecen a A.' },
    complementB: { symbol: 'Bᶜ', name: 'Complemento de B', description: 'Los elementos del universo U que no pertenecen a B.' }
  });
  function validate(operation, universe, a, b) {
    const errors = [];
    if (!Object.hasOwn(operations, operation)) return [{ fields: [], message: 'Selecciona una operación válida.' }];
    if (operation.startsWith('complement') && universe.length === 0) {
      errors.push({ fields: ['universe'], message: 'Para calcular un complemento, escribe al menos un elemento en el universo U.' });
    }
    if (universe.length > 0) {
      for (const [name, field, set] of [['A', 'set-a', a], ['B', 'set-b', b]]) {
        const outside = difference(set, universe);
        if (outside.length) errors.push({ fields: [field], message: `El conjunto ${name} contiene elementos fuera de U: {${outside.join(',')}}. Agrégalos a U o retíralos de ${name}; A y B deben ser subconjuntos de U.` });
      }
    }
    return errors;
  }
  function calculate(operation, universe, a, b) {
    const errors = validate(operation, universe, a, b);
    if (errors.length) return { elements: null, errors };
    const calculations = {
      union: () => union(a, b), intersection: () => intersection(a, b),
      differenceA: () => difference(a, b), differenceB: () => difference(b, a),
      complementA: () => complement(universe, a), complementB: () => complement(universe, b)
    };
    return { elements: calculations[operation](), errors: [] };
  }
  root.Conjuntos = Object.freeze({ normalize, parse, union, intersection, difference, complement, validate, calculate, operations });
})(globalThis);
