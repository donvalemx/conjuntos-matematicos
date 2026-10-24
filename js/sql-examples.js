/* Consultas didácticas para una columna elemento sin valores NULL. */
(function (root) {
  'use strict';

  const sampleData = Object.freeze({
    U: Object.freeze(['1', '2', '3', '4', '5', '6']),
    A: Object.freeze(['1', '2', '3']),
    B: Object.freeze(['3', '4', '5'])
  });

  function setSql(left, operator, right) {
    return `SELECT elemento FROM ${left}\n${operator}\nSELECT elemento FROM ${right};`;
  }

  function antiSql(left, right) {
    return `SELECT DISTINCT ${left}.elemento\nFROM ${left}\nLEFT JOIN ${right}\n    ON ${left}.elemento = ${right}.elemento\nWHERE ${right}.elemento IS NULL;`;
  }

  const operations = {
    union: {
      setSql: setSql('A', 'UNION', 'B'),
      joinSql: 'SELECT DISTINCT COALESCE(A.elemento, B.elemento) AS elemento\nFROM A\nFULL OUTER JOIN B\n    ON A.elemento = B.elemento;',
      explanation: 'FULL OUTER JOIN incluye ambos lados. COALESCE elige el valor disponible y DISTINCT elimina duplicados.'
    },
    intersection: {
      setSql: setSql('A', 'INTERSECT', 'B'),
      joinSql: 'SELECT DISTINCT A.elemento\nFROM A\nINNER JOIN B\n    ON A.elemento = B.elemento;',
      explanation: 'INNER JOIN conserva las coincidencias. DISTINCT evita que una coincidencia repetida produzca varias filas.'
    },
    differenceA: {
      setSql: setSql('A', 'EXCEPT', 'B'),
      joinSql: antiSql('A', 'B'),
      explanation: 'LEFT JOIN parte de A. El filtro B.elemento IS NULL conserva las filas sin coincidencia en B.'
    },
    differenceB: {
      setSql: setSql('B', 'EXCEPT', 'A'),
      joinSql: antiSql('B', 'A'),
      explanation: 'LEFT JOIN parte de B. El filtro A.elemento IS NULL conserva las filas sin coincidencia en A.'
    },
    complementA: {
      setSql: setSql('U', 'EXCEPT', 'A'),
      joinSql: antiSql('U', 'A'),
      explanation: 'El universo U es la tabla de partida. Se conservan sus elementos sin coincidencia en A.'
    },
    complementB: {
      setSql: setSql('U', 'EXCEPT', 'B'),
      joinSql: antiSql('U', 'B'),
      explanation: 'El universo U es la tabla de partida. Se conservan sus elementos sin coincidencia en B.'
    }
  };

  root.SqlExamples = Object.freeze({
    sampleData,
    operations: Object.freeze(Object.fromEntries(
      Object.entries(operations).map(([key, value]) => [key, Object.freeze(value)])
    ))
  });
})(globalThis);
