/* Operaciones puras: reciben arreglos y no modifican la interfaz ni los operandos. */
(function (root) {
  'use strict';

  function normalize(values) {
    const elements = values.map(value => String(value).trim()).filter(Boolean);
    return [...new Set(elements)];
  }

  function parse(text) {
    return normalize(String(text ?? '').split(','));
  }

  function union(a, b) {
    return normalize([...a, ...b]);
  }

  function intersection(a, b) {
    const other = new Set(normalize(b));
    return normalize(a).filter(element => other.has(element));
  }

  function difference(a, b) {
    const other = new Set(normalize(b));
    return normalize(a).filter(element => !other.has(element));
  }

  function complement(universe, set) {
    return difference(universe, set);
  }

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
    if (!Object.hasOwn(operations, operation)) {
      return [{ fields: [], message: 'Selecciona una operación válida.' }];
    }
    if (operation.startsWith('complement') && !universe.length) {
      errors.push({
        fields: ['universe'],
        message: 'Para calcular un complemento, escribe al menos un elemento en el universo U.'
      });
    }
    if (universe.length) {
      const sets = [['A', 'set-a', a], ['B', 'set-b', b]];
      for (const [name, field, elements] of sets) {
        const outside = difference(elements, universe);
        if (outside.length) {
          errors.push({
            fields: [field],
            message: `El conjunto ${name} contiene elementos fuera de U: {${outside.join(',')}}. Agrégalos a U o retíralos de ${name}; A y B deben ser subconjuntos de U.`
          });
        }
      }
    }
    return errors;
  }

  // Contrato: los tres arreglos de entrada ya fueron leídos con parse o normalize.
  function calculate(operation, universe, a, b) {
    const errors = validate(operation, universe, a, b);
    if (errors.length) return { elements: null, errors };
    const calculations = {
      union: () => union(a, b),
      intersection: () => intersection(a, b),
      differenceA: () => difference(a, b),
      differenceB: () => difference(b, a),
      complementA: () => complement(universe, a),
      complementB: () => complement(universe, b)
    };
    return { elements: calculations[operation](), errors: [] };
  }

  root.Conjuntos = Object.freeze({ normalize, parse, union, intersection, difference, complement, validate, calculate, operations });
})(globalThis);
