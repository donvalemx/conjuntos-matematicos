(function (root) {
  'use strict';
  const setSql = (left, operator, right) => `SELECT elemento FROM ${left}\n${operator}\nSELECT elemento FROM ${right};`;
  const antiSql = (left, right) => `SELECT ${left}.elemento\nFROM ${left}\nLEFT JOIN ${right}\n    ON ${left}.elemento = ${right}.elemento\nWHERE ${right}.elemento IS NULL;`;
  const operations = {
    union: {
      setSql: setSql('A', 'UNION', 'B'),
      joinSql: 'SELECT COALESCE(A.elemento, B.elemento) AS elemento\nFROM A\nFULL OUTER JOIN B\n    ON A.elemento = B.elemento;',
      explanation: 'UNION es la equivalencia SQL más clara de A ∪ B. FULL OUTER JOIN cubre visualmente ambos círculos: solo A, la intersección y solo B.',
      region: 'union'
    },
    intersection: {
      setSql: setSql('A', 'INTERSECT', 'B'),
      joinSql: 'SELECT A.elemento\nFROM A\nINNER JOIN B\n    ON A.elemento = B.elemento;',
      explanation: 'INNER JOIN devuelve las coincidencias por elemento: visualmente representa la intersección de A y B.',
      region: 'intersection'
    },
    differenceA: {
      setSql: setSql('A', 'EXCEPT', 'B'), joinSql: antiSql('A', 'B'),
      explanation: 'LEFT JOIN con WHERE B.elemento IS NULL conserva los elementos de A sin coincidencia en B: la región solo A, a la izquierda.',
      region: 'differenceA'
    },
    differenceB: {
      setSql: setSql('B', 'EXCEPT', 'A'), joinSql: antiSql('B', 'A'),
      explanation: 'Partiendo de B, LEFT JOIN con WHERE A.elemento IS NULL conserva B sin coincidencias en A: la región solo B, a la derecha del diagrama.',
      region: 'differenceB'
    },
    complementA: {
      setSql: setSql('U', 'EXCEPT', 'A'), joinSql: antiSql('U', 'A'),
      explanation: 'Partiendo de U, se conservan los elementos sin coincidencia en A: todo el rectángulo del universo fuera del círculo A, incluida la región solo B.',
      region: 'complementA'
    },
    complementB: {
      setSql: setSql('U', 'EXCEPT', 'B'), joinSql: antiSql('U', 'B'),
      explanation: 'Partiendo de U, se conservan los elementos sin coincidencia en B: todo el rectángulo del universo fuera del círculo B, incluida la región solo A.',
      region: 'complementB'
    }
  };
  const guide = [
    { title: 'INNER JOIN', region: 'intersection', explanation: 'Solo la intersección: filas con coincidencias en A y B.', joinSql: operations.intersection.joinSql },
    { title: 'LEFT JOIN', region: 'left', explanation: 'Todo A: solo A y la intersección; las columnas de B quedan en NULL cuando no hay coincidencia.', joinSql: 'SELECT A.elemento, B.elemento\nFROM A\nLEFT JOIN B\n    ON A.elemento = B.elemento;' },
    { title: 'RIGHT JOIN', region: 'right', explanation: 'Todo B: solo B y la intersección; las columnas de A quedan en NULL cuando no hay coincidencia.', joinSql: 'SELECT A.elemento, B.elemento\nFROM A\nRIGHT JOIN B\n    ON A.elemento = B.elemento;' },
    { title: 'FULL OUTER JOIN', region: 'union', explanation: 'Ambos círculos: solo A, coincidencias y solo B.', joinSql: operations.union.joinSql },
    { title: 'LEFT ONLY / ANTI JOIN', region: 'differenceA', explanation: 'Solo A sin B. Nombre conceptual; el SQL usa LEFT JOIN y filtra la ausencia de coincidencia.', joinSql: operations.differenceA.joinSql },
    { title: 'RIGHT ONLY / ANTI JOIN', region: 'differenceB', explanation: 'Solo B sin A. Nombre conceptual; el SQL parte de B y usa LEFT JOIN con un filtro.', joinSql: operations.differenceB.joinSql }
  ];
  root.SqlExamples = Object.freeze({
    operations: Object.freeze(Object.fromEntries(Object.entries(operations).map(([key, value]) => [key, Object.freeze(value)]))),
    guide: Object.freeze(guide.map(Object.freeze))
  });
})(globalThis);
