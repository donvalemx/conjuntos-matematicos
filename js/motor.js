/* Analizador de expresiones por descenso recursivo. No ejecuta código JavaScript. */
(function (root) {
  'use strict';

  const parse = text => Conjuntos.parse(text);
  const setOperators = ['∪', '−', '-', '\\', '△', 'Δ', '^'];
  const relationOperators = ['⊆', '⊂', '⊇', '⊃', '=', '≠', '∈', '∉'];
  const logicalOperators = ['∧', '∨', '→'];
  const unsupportedSymbols = ['ℕ', 'ℤ', 'ℝ', '∀', '∃'];

  function tokenize(source) {
    // Cada símbolo es un token; los elementos de texto deben escribirse sin espacios.
    const pattern = /\s+|[∪∩△Δ⊆⊂⊇⊃∈∉≠=∅∧∨¬→∀∃ℕℤℝ()'ᶜ^|−\\-]|[^\s∪∩△Δ⊆⊂⊇⊃∈∉≠=∅∧∨¬→∀∃ℕℤℝ()'ᶜ^|−\\-]+/gu;
    return (String(source).match(pattern) || []).filter(token => !/^\s+$/.test(token));
  }

  function requireSet(value) {
    if (!Array.isArray(value)) throw Error('Esta operación requiere conjuntos.');
    return value;
  }

  function evaluate(source, sets, universe) {
    const tokens = tokenize(source);
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];

    function requireUniverse() {
      if (!universe.length) throw Error('Define U para utilizar el universo o calcular complementos.');
    }

    // Unidad mínima: conjunto, elemento, cardinalidad, negación o expresión agrupada.
    function readAtom() {
      const token = take();
      let value;

      if (token === '(') {
        value = readLogic();
        if (take() !== ')') throw Error('Falta cerrar un paréntesis.');
      } else if (token === '|') {
        value = requireSet(readRelation()).length;
        if (take() !== '|') throw Error('Falta cerrar | para la cardinalidad.');
      } else if (token === '¬') {
        value = readAtom();
        if (typeof value !== 'boolean') throw Error('¬ requiere una afirmación verdadera o falsa.');
        value = !value;
      } else if (token === '∅') {
        value = [];
      } else if (token === 'U') {
        requireUniverse();
        value = universe;
      } else if (Object.hasOwn(sets, token)) {
        value = sets[token];
      } else if (unsupportedSymbols.includes(token)) {
        throw Error('Los conjuntos infinitos y cuantificadores no se evalúan en esta calculadora de conjuntos finitos.');
      } else if (token && !/[∪∩△Δ⊆⊂⊇⊃∈∉≠=∧∨→()'ᶜ^|−\\-]/u.test(token)) {
        // Un elemento se conserva como texto para expresiones como 3 ∈ A.
        value = { scalar: token };
      } else {
        throw Error('Escribe un conjunto o una expresión válida.');
      }

      while (peek() === "'" || peek() === 'ᶜ') {
        take();
        requireUniverse();
        value = Conjuntos.complement(universe, requireSet(value));
      }
      return value;
    }

    function readIntersection() {
      let left = readAtom();
      while (peek() === '∩') {
        take();
        const right = requireSet(readAtom());
        left = Conjuntos.intersection(requireSet(left), right);
      }
      return left;
    }

    function readSetExpression() {
      let left = readIntersection();
      while (setOperators.includes(peek())) {
        const operator = take();
        const right = requireSet(readIntersection());
        left = requireSet(left);
        if (operator === '∪') {
          left = Conjuntos.union(left, right);
        } else if (['△', 'Δ', '^'].includes(operator)) {
          left = Conjuntos.union(Conjuntos.difference(left, right), Conjuntos.difference(right, left));
        } else {
          left = Conjuntos.difference(left, right);
        }
      }
      return left;
    }

    function readRelation() {
      const left = readSetExpression();
      if (!relationOperators.includes(peek())) return left;
      const operator = take();
      const right = readSetExpression();

      if (operator === '∈' || operator === '∉') {
        if (!left || typeof left.scalar !== 'string') {
          throw Error('A la izquierda de ∈ escribe un elemento, por ejemplo 3 ∈ A.');
        }
        const belongs = requireSet(right).includes(left.scalar);
        return operator === '∈' ? belongs : !belongs;
      }

      const a = requireSet(left);
      const b = requireSet(right);
      const isSubset = a.every(element => b.includes(element));
      const isSuperset = b.every(element => a.includes(element));
      switch (operator) {
        case '⊆': return isSubset;
        case '⊂': return isSubset && a.length < b.length;
        case '⊇': return isSuperset;
        case '⊃': return isSuperset && b.length < a.length;
        case '=': return isSubset && isSuperset;
        case '≠': return !(isSubset && isSuperset);
      }
    }

    function readLogic() {
      let left = readRelation();
      while (logicalOperators.includes(peek())) {
        const operator = take();
        const right = readRelation();
        if (typeof left !== 'boolean' || typeof right !== 'boolean') {
          throw Error('Los conectores lógicos requieren afirmaciones verdaderas o falsas.');
        }
        if (operator === '∧') left = left && right;
        if (operator === '∨') left = left || right;
        if (operator === '→') left = !left || right;
      }
      return left;
    }

    if (!tokens.length) throw Error('Escribe una expresión.');
    const result = readLogic();
    if (position !== tokens.length) throw Error(`Revisa la expresión cerca de «${peek()}».`);
    if (result && typeof result.scalar === 'string') {
      throw Error(`Conjunto desconocido o elemento sin relación: ${result.scalar}`);
    }
    return result;
  }

  root.Motor = Object.freeze({ parse, evaluate });
})(globalThis);
