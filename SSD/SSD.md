# SSD — Desarrollo guiado por especificaciones

## 1. Qué vamos a construir

Una aplicación web para practicar operaciones con conjuntos en la materia de Matemáticas Discretas. El estudiante escribe dos conjuntos, elige una operación y ve el resultado junto con un diagrama de Venn. También puede consultar ejemplos de SQL que ayudan a relacionar los conjuntos con consultas y JOINs.

Esta especificación describe el producto actual y sirve como guía para reproducirlo. La interfaz y las explicaciones deben estar en español. La aplicación funciona en el navegador, sin cuentas, base de datos ni conexión a servicios externos.

La experiencia sigue este recorrido: **definir conjuntos → elegir una operación → ver el resultado y su región → consultar el ejemplo SQL**.

## 2. Qué debe poder hacer el usuario

La pantalla debe incluir tres campos: **Universo U**, **Conjunto A** y **Conjunto B**. En cada uno se escriben elementos separados por comas y se muestra cuántos elementos únicos contiene.

Al abrir la aplicación, cargar estos valores y seleccionar la unión:

| Campo | Valor inicial |
| --- | --- |
| U | `1,2,3,4,5,6` |
| A | `1,2,3` |
| B | `3,4,5` |

El usuario debe poder elegir entre seis operaciones:

| Operación | Qué devuelve | Clave en el código |
| --- | --- | --- |
| Unión, A ∪ B | Elementos de A, de B o de ambos | `union` |
| Intersección, A ∩ B | Elementos comunes a A y B | `intersection` |
| Diferencia, A − B | Elementos de A que no están en B | `differenceA` |
| Diferencia, B − A | Elementos de B que no están en A | `differenceB` |
| Complemento de A, Aᶜ | Elementos de U que no están en A | `complementA` |
| Complemento de B, Bᶜ | Elementos de U que no están en B | `complementB` |

Actualizar el resultado, el diagrama y los ejemplos SQL al escribir o cambiar de operación, sin un botón adicional para calcular. Mostrar el nombre de la operación, una explicación breve, los elementos del resultado y su cantidad. Un resultado vacío se representa con `∅`.

Incluir dos botones:

- **Cargar ejemplo:** restaura los tres valores iniciales y conserva la operación seleccionada.
- **Limpiar:** vacía los tres campos, conserva la operación y lleva el foco al campo U.

Los datos permanecen solo mientras la página está abierta. Al recargar se vuelve al ejemplo inicial.

## 3. Cómo interpretar y validar los datos

Tratar los elementos como texto. Separarlos únicamente por comas, quitar los espacios al principio y al final de cada elemento, ignorar entradas vacías y eliminar duplicados.

Por ejemplo, `1, 2,2,,3` se interpreta como `{1,2,3}`. Los espacios internos se conservan: `a b` es distinto de `ab`. También se distingue entre `a` y `A`, y entre `01` y `1`. No interpretar llaves, intervalos ni expresiones: `1-3` es un solo elemento.

No ordenar los resultados. Conservar el orden de aparición: en la unión, primero los elementos de A y después los de B que falten; en intersecciones y diferencias, el orden del conjunto de partida; en complementos, el de U.

Aplicar estas validaciones:

- A y B pueden estar vacíos.
- U puede quedar vacío en unión, intersección y diferencias. En ese caso se considera que el universo no está definido.
- Para calcular un complemento, U debe contener al menos un elemento.
- Cuando U tenga contenido, todos los elementos de A y de B deben pertenecer a U. Revisar ambos conjuntos en las seis operaciones.

Si faltan datos necesarios o hay elementos fuera de U, mostrar un mensaje en español que explique cómo corregirlos. Identificar el conjunto y los elementos que están fuera del universo. Marcar los campos afectados, mostrar «Revisa los conjuntos» en lugar del resultado y retirar el sombreado del diagrama principal. Mantener visibles los ejemplos SQL de la operación elegida.

## 4. Cómo debe verse la pantalla

Usar una página de fondo claro, tarjetas blancas, bordes suaves y tonos verdes. La cabecera identifica la herramienta como **Conjuntos / Matemáticas Discretas**. La introducción lleva el título «Explora cómo se conectan.» y una frase que invita a definir conjuntos y elegir una operación.

Organizar el contenido en tres pasos numerados:

1. **Define los conjuntos:** campos U, A y B, contadores y botón para cargar el ejemplo.
2. **Elige una operación:** seis botones y la opción de limpiar.
3. **Visualiza el resultado:** nombre y descripción de la operación, diagrama, resultado y ejemplos SQL.

En escritorio, colocar los controles a la izquierda y la visualización a la derecha. A partir de 760 px de ancho o menos, apilar las tarjetas en una columna. Debajo, incluir una sección desplegable llamada **JOINs y conjuntos**. Sus seis tarjetas se distribuyen en tres columnas, dos a 1000 px o menos y una a 600 px o menos.

Usar fuentes del sistema, símbolos matemáticos legibles y una fuente monoespaciada para SQL. Permitir que resultados y consultas largas se ajusten al ancho disponible.

Los campos deben tener etiquetas asociadas. Todos los controles deben funcionar con teclado y mostrar el foco. Indicar la operación seleccionada con `aria-pressed`, los campos incorrectos con `aria-invalid` y vincularlos con su mensaje mediante `aria-describedby`. Anunciar resultados y errores con `aria-live="polite"`. Respetar la preferencia de movimiento reducido.

## 5. Diagrama de Venn

Dibujar con SVG un rectángulo para U y dos círculos superpuestos: A a la izquierda y B a la derecha. Sombrear con una trama verde las regiones que correspondan:

| Operación | Región sombreada |
| --- | --- |
| A ∪ B | Ambos círculos completos |
| A ∩ B | Solo la zona compartida |
| A − B | La parte de A que queda fuera de B |
| B − A | La parte de B que queda fuera de A |
| Aᶜ | Todo U fuera de A, incluida la parte exclusiva de B |
| Bᶜ | Todo U fuera de B, incluida la parte exclusiva de A |

La geometría es fija: el tamaño de las regiones no representa cantidades y los elementos no se escriben dentro de los círculos. Esto también aplica cuando los conjuntos estén vacíos o sean iguales. Si U no está definido, aclarar que el marco es esquemático.

Añadir un título y una descripción accesibles a cada SVG. Usar identificadores únicos para sus patrones, máscaras y recortes, porque en la página habrá un diagrama principal y seis de referencia.

## 6. Ejemplos SQL y guía de JOINs

Debajo del resultado, mostrar una consulta de conjuntos, un JOIN relacionado y una explicación breve. Usar como ejemplo las tablas A, B y U, cada una con una columna `elemento`.

Construir las consultas de conjuntos con este formato:

```sql
SELECT elemento FROM A
UNION
SELECT elemento FROM B;
```

Cambiar las tablas y el operador según la selección:

| Operación | Primera tabla | Operador | Segunda tabla |
| --- | --- | --- | --- |
| A ∪ B | A | UNION | B |
| A ∩ B | A | INTERSECT | B |
| A − B | A | EXCEPT | B |
| B − A | B | EXCEPT | A |
| Aᶜ | U | EXCEPT | A |
| Bᶜ | U | EXCEPT | B |

Para la intersección, mostrar este JOIN:

```sql
SELECT A.elemento
FROM A
INNER JOIN B
    ON A.elemento = B.elemento;
```

Para la unión, usar esta referencia visual de ambos círculos:

```sql
SELECT COALESCE(A.elemento, B.elemento) AS elemento
FROM A
FULL OUTER JOIN B
    ON A.elemento = B.elemento;
```

Para diferencias y complementos, partir de este patrón:

```sql
SELECT A.elemento
FROM A
LEFT JOIN B
    ON A.elemento = B.elemento
WHERE B.elemento IS NULL;
```

Este ejemplo corresponde a A − B. Para B − A, intercambiar A y B; para Aᶜ, usar U como tabla de partida y A como tabla comparada; para Bᶜ, usar U y B.

La sección desplegable debe incluir estas seis referencias, cada una con su explicación, consulta y diagrama:

| Referencia | Qué muestra el diagrama | Consulta |
| --- | --- | --- |
| INNER JOIN | La intersección | El ejemplo de intersección |
| LEFT JOIN | Todo A | Seleccionar `A.elemento, B.elemento` de `A LEFT JOIN B ON A.elemento = B.elemento` |
| RIGHT JOIN | Todo B | Seleccionar `A.elemento, B.elemento` de `A RIGHT JOIN B ON A.elemento = B.elemento` |
| FULL OUTER JOIN | Ambos círculos | El ejemplo de unión |
| LEFT ONLY / ANTI JOIN | A sin B | El ejemplo de A − B |
| RIGHT ONLY / ANTI JOIN | B sin A | El ejemplo de B − A |

Estas tarjetas son referencias fijas; no dependen de lo escrito en los campos.

Explicar que las consultas son ilustrativas y no se ejecutan. Los operadores `UNION`, `INTERSECT` y `EXCEPT` sin `ALL` eliminan duplicados; los JOINs relacionan filas y pueden multiplicarlas. La comparación supone una clave común, única y sin `NULL`. Con duplicados, valores `NULL`, otras columnas o condiciones, la equivalencia con conjuntos no es general. «ANTI JOIN» es el nombre del concepto; las consultas usan `LEFT JOIN` con un filtro.

## 7. Organización del código

Usar HTML, CSS, JavaScript sin frameworks y SVG. No se necesitan paquetes, compilación, servidor de aplicación ni base de datos. Mantener esta estructura, con las rutas relativas a la carpeta del proyecto:

```text
conjuntos-discretas/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── conjuntos.js
│   ├── venn.js
│   ├── sql-examples.js
│   └── app.js
├── assets/
│   └── .gitkeep
├── SSD/
│   └── SSD.md
└── README.md
```

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura, textos de la pantalla, controles y referencias a estilos y scripts |
| `css/styles.css` | Apariencia, distribución, adaptación a móvil y estados de foco |
| `js/conjuntos.js` | Lectura de elementos, operaciones y validaciones, sin manipular la página |
| `js/venn.js` | Creación de los SVG y actualización de regiones |
| `js/sql-examples.js` | Consultas, explicaciones y contenido de las seis referencias de JOIN |
| `js/app.js` | Eventos, operación seleccionada y actualización de la interfaz |
| `assets/` | Recursos estáticos; actualmente solo contiene el archivo de reserva `.gitkeep` |
| `README.md` | Presentación breve, instrucciones de ejecución y enlace a esta especificación |

Cargar los scripts con `defer` en este orden: `conjuntos.js`, `venn.js`, `sql-examples.js` y `app.js`. Usar scripts clásicos para permitir abrir `index.html` directamente. Los tres primeros exponen `Conjuntos`, `Venn` y `SqlExamples` mediante `globalThis`.

La lógica principal sigue estos pasos: leer los campos con `Conjuntos.parse`, calcular con `Conjuntos.calculate`, actualizar textos y consultas, y mostrar los errores o el resultado con su región. Al iniciar, crear también las seis tarjetas de la guía.

Para mantener la implementación actual:

- `calculate(operation, universe, a, b)` recibe arreglos ya normalizados y devuelve `{ elements, errors }`. Si hay errores, `elements` es `null`; cada error contiene `fields` y `message`. Una clave de operación desconocida también produce un error.
- Normalizar los operandos antes de usar las funciones de conjuntos directamente. No todas normalizan ambos argumentos.
- Crear cada diagrama con `Venn.render(container)` antes de llamar a `Venn.update(container, operation, description)`. Usar `null` como operación para quitar el sombreado.
- Mantener las mismas claves de operación en botones, cálculos, consultas y diagramas.
- Mostrar el texto introducido por el usuario con `textContent`, sin insertarlo como HTML.

## 8. Orden de implementación

Para reproducir la aplicación, trabajar en este orden:

1. Crear la estructura HTML con los campos, las seis operaciones y los espacios para resultados y consultas.
2. Implementar la lectura de conjuntos, las operaciones y sus validaciones en `conjuntos.js`.
3. Construir el SVG y comprobar el sombreado de cada operación en `venn.js`.
4. Preparar las consultas y las seis referencias de JOIN en `sql-examples.js`.
5. Conectar los eventos y las actualizaciones desde `app.js`, incluidos los botones de ejemplo y limpieza.
6. Aplicar el diseño, la adaptación a móvil y las ayudas de accesibilidad.
7. Revisar los casos de entrega de la siguiente sección y documentar cómo abrir la aplicación.

Si se trabaja sobre el proyecto existente, modificar los archivos necesarios para el cambio solicitado y conservar el resto del comportamiento.

## 9. Cómo comprobar la entrega

Con el ejemplo inicial, comprobar estos resultados y su sombreado correspondiente:

| Operación | Resultado esperado |
| --- | --- |
| A ∪ B | `{1,2,3,4,5}` |
| A ∩ B | `{3}` |
| A − B | `{1,2}` |
| B − A | `{4,5}` |
| Aᶜ | `{4,5,6}` |
| Bᶜ | `{1,2,6}` |

Revisar también estos casos:

| Prueba | Comportamiento esperado |
| --- | --- |
| Escribir `1, 2,2,,3` en A | Interpretar tres elementos: `1`, `2` y `3` |
| Dejar U vacío y escribir `a,A,01,1,a b,ab` en A | Contar seis elementos distintos |
| Dejar A y B vacíos y elegir unión | Mostrar `∅` |
| Dejar U vacío y elegir intersección o diferencia | Calcular normalmente |
| Dejar U vacío y elegir un complemento | Pedir al menos un elemento en U y quitar el sombreado |
| Escribir `9` en A con el universo inicial | Indicar que `9` está fuera de U y bloquear el resultado |
| Poner un elemento de B fuera de U y elegir Aᶜ | Marcar el error de B, aunque se calcule el complemento de A |
| Cambiar de operación | Actualizar resultado, región, consulta y explicación |
| Pulsar Cargar ejemplo | Restaurar los datos sin cambiar la operación |
| Pulsar Limpiar | Vaciar los campos, conservar la operación y enfocar U |
| Abrir la guía de JOINs | Mostrar seis tarjetas con sus diagramas y consultas |

Comprobar en el navegador que la página funciona con teclado, los errores se asocian a sus campos, los textos largos caben en las tarjetas y el diseño se adapta a escritorio y móvil. Revisar que no haya errores en la consola y que funcionen las dos formas de apertura indicadas abajo.

La entrega incluye los archivos de la aplicación, el README y esta especificación. Se considera completa cuando cumple las funciones y pruebas descritas. Al entregarla, indicar qué se cambió, qué se verificó y si quedó algo pendiente. Actualmente no hay una suite de pruebas automatizadas.

## 10. Cómo ejecutar el proyecto

Abrir `index.html` directamente en un navegador moderno, compatible con `Object.hasOwn`.

También se puede iniciar un servidor estático. Desde la carpeta `conjuntos-discretas`, ejecutar:

```sh
python3 -m http.server 8000
```

Después abrir `http://localhost:8000`. Para detener el servidor, pulsar `Ctrl+C`. Python solo se necesita para esta segunda opción; no forma parte de la aplicación.

El alcance de esta entrega son las seis operaciones y las seis referencias de JOIN descritas. Funciones como producto cartesiano, diferencia simétrica, exportación o ejecución real de SQL requerirían ampliar primero esta especificación.
