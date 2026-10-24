# Especificación de la aplicación de conjuntos

Este documento define lo necesario para construir la aplicación desde una carpeta vacía. Describe pantallas, datos, cálculos, consultas, archivos y casos de aceptación. Debe poder usarse sin documentos privados ni archivos excluidos de Git.

## 1. Propósito y alcance

Construir una aplicación de Matemáticas Discretas en español. El recorrido tendrá tres pestañas, en este orden:

1. **Introducción**: aprender operaciones básicas con dos conjuntos.
2. **Calculadora de conjuntos**: crear de uno a ocho conjuntos y evaluar expresiones.
3. **Aplicación en SQL**: comparar una operación de conjuntos con dos consultas SQL que producen los mismos elementos.

Usar HTML, CSS, JavaScript y SVG. La aplicación debe funcionar al abrir `index.html` directamente y desde un servidor estático. No requiere cuentas, servicios externos, conexión a internet, paquetes, compilación ni base de datos. Las consultas SQL se muestran como material de estudio; el navegador no las ejecuta.

Los datos permanecen en memoria mientras la página está abierta. Al cambiar de pestaña deben conservarse. Al recargar deben volver los valores iniciales. No usar almacenamiento local.

## 2. Archivos y orden de carga

Crear esta estructura:

```text
conjuntos-discretas/
├── index.html
├── css/styles.css
├── js/
│   ├── conjuntos.js
│   ├── venn.js
│   ├── sql-examples.js
│   ├── motor.js
│   ├── distribucion.js
│   ├── modelo.js
│   ├── vista.js
│   └── app.js
├── SSD/SSD.md
└── README.md
```

`assets/` puede reservarse para recursos futuros. Los diagramas actuales se generan con SVG.

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Cabecera, pestañas, paneles, campos y contenedores de resultados |
| `styles.css` | Diseño de escritorio y móvil, colores, tipografía y foco |
| `conjuntos.js` | Lectura, normalización, operaciones básicas y validación de U |
| `venn.js` | Diagrama de dos conjuntos, compartido por Introducción y SQL |
| `sql-examples.js` | Dataset fijo y consultas de las seis operaciones |
| `motor.js` | Analizador y evaluador de expresiones de la calculadora |
| `distribucion.js` | Agrupación por pertenencia, tarjetas y círculos de la calculadora |
| `modelo.js` | Estado y decisiones de los tres recorridos, sin acceder al DOM |
| `vista.js` | Actualización del DOM y construcción de tablas/campos |
| `app.js` | Controladores y listeners; conecta modelo con vista |

Cargar los ocho scripts con `defer`, en el orden de la lista anterior. Exponer `Conjuntos`, `Venn`, `SqlExamples`, `Motor`, `Distribucion`, `Modelo` y `Vista` en `globalThis`. Los scripts clásicos permiten abrir la aplicación con `file://`.

El código sigue un MVC sencillo. `modelo.js` contiene `IntroModel`, `CalculatorModel` y `SqlModel`; `vista.js` solo recibe estados y pinta HTML/SVG; `app.js` registra primero la navegación y después los tres controladores. Cada panel conserva su estado en su modelo. Los módulos de dominio y diagramas no leen controles directamente.

## 3. Estructura de la página y navegación

La cabecera dirá **Conjuntos / Matemáticas Discretas**. Debajo habrá un `tablist` con tres botones y un `main` con los tres paneles. Mostrar un pie de página común.

| Pestaña | ID del botón | ID del panel |
| --- | --- | --- |
| Introducción | `tab-intro` | `intro-panel` |
| Calculadora de conjuntos | `tab-calculator` | `calculator-panel` |
| Aplicación en SQL | `tab-sql` | `sql-panel` |

Cada botón tendrá `role="tab"`, `aria-controls` y `aria-selected`. Cada panel tendrá `role="tabpanel"` y `aria-labelledby`. Al abrir, Introducción será la única pestaña seleccionada y su panel será el único visible. Usar `hidden` en los otros paneles.

El clic activa una pestaña. Flecha derecha e izquierda activan la siguiente o anterior, con retorno circular. Home activa la primera; End, la última. La pestaña activa tendrá `tabindex="0"`; las otras, `-1`. Al navegar con flechas, mover también el foco.

## 4. Reglas comunes de los datos

Los conjuntos son arreglos de texto sin duplicados. Leer los campos así:

1. Dividir el contenido por comas.
2. Quitar espacios al principio y al final de cada elemento.
3. Descartar elementos vacíos.
4. Quitar duplicados y conservar el orden de primera aparición.

`1, 2,2,,3` produce `['1','2','3']`. Distinguir `a` de `A`, `01` de `1` y `a b` de `ab`. Los espacios internos se conservan en los campos. Las comas son separadores y no pueden formar parte de un elemento. Escribir solo los valores, sin llaves ni etiquetas como `A =`.

Un conjunto puede estar vacío. Mostrar `∅` cuando el resultado sea vacío. Un campo U vacío significa que el universo no está definido; no representa un universo vacío explícito. Las operaciones que no necesitan U pueden calcularse sin él. El complemento y la referencia a U en una expresión requieren al menos un elemento en U.

Cuando U tenga contenido, todos los conjuntos definidos deben estar contenidos en él, incluso si alguno no aparece en la operación actual. Identificar los elementos que están fuera de U. No mostrar como válido un resultado obtenido con esos datos.

No ordenar los resultados. La unión conserva primero los elementos de su operando izquierdo y agrega los nuevos del derecho. Intersección y diferencia conservan el orden del operando izquierdo. El complemento conserva el orden de U.

## 5. Pestaña Introducción

Título: **Operaciones con conjuntos.** Texto: «Explora unión, intersección, diferencia y complemento con ejemplos visuales.»

Dividir la pantalla en controles y visualización. Los controles tendrán tres campos y seis botones de operación. Mostrar el número de elementos únicos debajo de cada campo.

| Campo | ID | Valor inicial |
| --- | --- | --- |
| Universo | `universe` | `1,2,3,4,5,6` |
| Conjunto A | `set-a` | `1,2,3` |
| Conjunto B | `set-b` | `3,4,5` |

| Clave interna | Operación | Resultado del ejemplo |
| --- | --- | --- |
| `union` | A ∪ B | `{1,2,3,4,5}` |
| `intersection` | A ∩ B | `{3}` |
| `differenceA` | A − B | `{1,2}` |
| `differenceB` | B − A | `{4,5}` |
| `complementA` | Aᶜ = U − A | `{4,5,6}` |
| `complementB` | Bᶜ = U − B | `{1,2,6}` |

Seleccionar unión al iniciar. Cada botón usará `data-operation` con la clave interna y `aria-pressed` para indicar su estado. Al editar un campo o pulsar una operación, actualizar nombre, explicación, elementos, cardinalidad y región. No añadir un botón de cálculo en esta pestaña.

**Cargar ejemplo** restaura U, A y B sin cambiar la operación. **Limpiar** vacía los tres campos, conserva la operación y mueve el foco a U.

Si hay errores, mostrar el mensaje, marcar los campos afectados y sustituir el resultado por «Revisa los conjuntos». Retirar el sombreado del diagrama hasta corregir los datos.

IDs de salida: `universe-count`, `a-count`, `b-count`, `message`, `operation-title`, `operation-description`, `venn-container`, `result-value`, `result-count`, `result-note`. Asociar los campos a `input-help` y, cuando corresponda, a `message`.

## 6. Diagrama de Venn compartido

Dibujar un rectángulo U y dos círculos superpuestos, A a la izquierda y B a la derecha. Separar cuatro regiones: solo A, intersección, solo B y exterior de ambos dentro de U.

| Operación | Regiones sombreadas |
| --- | --- |
| Unión | Solo A, intersección y solo B |
| Intersección | Intersección |
| A − B | Solo A |
| B − A | Solo B |
| Aᶜ | Solo B y exterior de ambos dentro de U |
| Bᶜ | Solo A y exterior de ambos dentro de U |

Usar máscaras y recortes SVG para no pintar regiones incorrectas. Crear identificadores únicos por diagrama para sus máscaras, patrones, título y descripción. Habrá un diagrama en Introducción y otro en SQL.

La geometría es fija: no cambia con las cardinalidades, conjuntos vacíos o conjuntos iguales. No escribir los elementos dentro de los círculos. Aclarar que la representación es esquemática. `Venn.render(container)` crea el SVG; `Venn.update(container, operation, description)` cambia el sombreado y la descripción. Una operación `null` retira el sombreado.

## 7. Pestaña Calculadora de conjuntos

Título: **Calculadora de conjuntos.** Incluir «Crea tus propios conjuntos aquí».

### Estado inicial y campos

Iniciar con dos conjuntos, el mismo U, A y B del ejemplo introductorio y la expresión `A ∪ B`. El panel tendrá estado independiente de Introducción y SQL.

`quantity` permite elegir un entero entre 1 y 8. Generar campos de A a H según esa cantidad. Sus IDs serán `set-A`, `set-B`, etc.; respetar mayúsculas para distinguirlos de los campos introductorios.

Conservar los valores escritos al aumentar la cantidad. Si se reduce y luego aumenta, recuperar los valores anteriores durante la misma sesión. Los conjuntos retirados no participan en validaciones, resumen ni expresiones hasta que vuelvan a estar definidos. Si la expresión usa uno retirado, mostrar un error.

Una cantidad fuera del rango debe mostrar validación y conservar los campos de la última cantidad válida hasta que se corrija.

IDs principales: `advanced-universe`, `sets`, `advanced-expression`, `keys`, `calculate`, `error`, `advanced-result`, `advanced-diagram` y `summary`.

### Expresiones admitidas

| Tipo | Símbolos o ejemplo | Tipo de resultado |
| --- | --- | --- |
| Unión | `A ∪ B` | Conjunto |
| Intersección | `A ∩ B` | Conjunto |
| Diferencia | `A − B`, también `-` y `\` | Conjunto |
| Diferencia simétrica | `A △ B`, también `Δ` y `^` | Conjunto |
| Complemento | `Aᶜ` o `A'` | Conjunto |
| Vacío | `∅` | Conjunto |
| Cardinalidad | `|A|`, `|A ∪ B|` | Número |
| Inclusión e inclusión propia | `⊆`, `⊂`, `⊇`, `⊃` | Booleano |
| Igualdad y desigualdad entre conjuntos | `=`, `≠` | Booleano |
| Pertenencia y no pertenencia | `3 ∈ A`, `7 ∉ A` | Booleano |
| Lógica | `∧`, `∨`, `¬`, `→` | Booleano |

Los nombres de conjuntos definidos y U son referencias a conjuntos. Los otros tokens de texto pueden usarse como elementos en pertenencia. Por ejemplo, `Ana ∈ A` busca el texto `Ana`. Para pertenencia, usar elementos de un solo token: no se admiten comillas, espacios ni símbolos de operación dentro del elemento. Los campos sí pueden contener elementos con espacios, aunque no puedan referenciarse individualmente en una expresión.

La igualdad y desigualdad comparan conjuntos. No se admiten comparaciones de números como `|A| = 3`, aritmética, intervalos, conjuntos infinitos, conjuntos anidados, comprensión ni cuantificadores.

### Orden de evaluación

Implementar un analizador por descenso recursivo que consuma tokens; no usar `eval` ni `Function`.

1. Un átomo puede ser un conjunto, U, ∅, elemento, cardinalidad o expresión entre paréntesis. La negación consume otro átomo y exige un booleano; escribir `¬(A = B)`.
2. Aplicar los complementos posfijos al átomo leído.
3. Resolver intersecciones.
4. Resolver unión, diferencia y diferencia simétrica de izquierda a derecha, al mismo nivel.
5. Resolver una relación entre los operandos.
6. Resolver `∧`, `∨` y `→` de izquierda a derecha, al mismo nivel. La implicación es `!izquierda || derecha`.

Los paréntesis permiten entrar de nuevo al análisis completo y cambiar la agrupación. Por ejemplo, `A ∪ B ∩ C` significa `A ∪ (B ∩ C)`. Para cambiarlo, escribir `(A ∪ B) ∩ C`. Para lógica, recomendar paréntesis alrededor de cada relación.

Antes de devolver el resultado, comprobar que todos los tokens se consumieron y que no quedó un elemento suelto. Rechazar operadores sin operandos, paréntesis sin cerrar, barras incompletas y operaciones aplicadas al tipo incorrecto.

### Controles y actualizaciones

Generar botones para conjuntos definidos, U y los símbolos disponibles. Insertar cada símbolo en la selección actual del campo de expresión, conservar el cursor y enfocar el campo.

Actualizar al editar datos o expresión, al cambiar cantidad válida, al pulsar **Calcular** y con Enter. Mostrar conjuntos con cardinalidad, números como números y booleanos como «Verdadero» o «Falso».

**Cargar ejemplo** establece tres conjuntos: A=`1,2,3`, B=`3,4,5`, C=`2,5,6`, U=`1,2,3,4,5,6` y expresión `(A ∪ B) − C`. Resultado: `{1,3,4}`.

**Limpiar** vacía U y los conjuntos guardados, conserva la cantidad válida, pone la expresión `A` y enfoca U. Con los campos vacíos, el resultado será ∅.

Si hay errores, mostrar «Revisa los datos y la expresión», explicar el motivo y retirar el sombreado. Asociar los errores de pertenencia a U a los campos de conjuntos; los de expresión, a la expresión. El resumen seguirá calculándose con los datos válidos aunque la expresión principal sea incorrecta. Si los conjuntos están fuera de U, el resumen mostrará «Revisa U».

### Distribución y resumen

Reunir una sola vez cada elemento de U y de los conjuntos. Para cada elemento construir una cadena de pertenencia; con A, B y C, `101` significa «en A y C, fuera de B». Agrupar con un `Map` y mostrar una tarjeta por región ocupada, sus elementos y los que pertenecen al resultado. No crear tarjetas para regiones sin elementos.

Con uno a tres conjuntos, añadir círculos SVG de geometría fija. Sombrear regiones ocupadas por elementos del resultado. Con cuatro a ocho, mostrar solo tarjetas. Para resultados booleanos, numéricos o errores, no sombrear regiones. Las tarjetas son la referencia exacta de pertenencia; los círculos no representan tamaños ni relaciones geométricas exactas como inclusión o disyunción.

El resumen incluye cardinalidad de cada conjunto, unión, intersección, las dos diferencias y diferencia simétrica de A/B cuando B existe. Si U está definido, incluir el complemento de cada conjunto.

## 8. Pestaña Aplicación en SQL

Tendrá un selector propio, inicialmente en unión, con las seis claves de la sección 5. Usar el dataset fijo U=`1,2,3,4,5,6`, A=`1,2,3`, B=`3,4,5`, independiente de los datos de las otras pestañas.

Al seleccionar una operación, actualizar símbolo, explicación, Venn, ambas consultas, salida tabular y cantidad de filas. Mantener visibles las dos alternativas: **Operador de conjuntos** y **Alternativa con JOIN**. Mostrar U, A y B como datos de entrada y una tabla de salida con la columna `elemento`.

La salida se obtiene con `Conjuntos.calculate` a partir del dataset. No mantener listas manuales de resultados ni ejecutar SQL en el navegador.

### Consulta con operador de conjuntos

Usar esta plantilla:

```sql
SELECT elemento FROM izquierda
OPERADOR
SELECT elemento FROM derecha;
```

| Operación | izquierda | OPERADOR | derecha |
| --- | --- | --- | --- |
| Unión | A | UNION | B |
| Intersección | A | INTERSECT | B |
| A − B | A | EXCEPT | B |
| B − A | B | EXCEPT | A |
| Aᶜ | U | EXCEPT | A |
| Bᶜ | U | EXCEPT | B |

### Consultas con JOIN

Para unión:

```sql
SELECT DISTINCT COALESCE(A.elemento, B.elemento) AS elemento
FROM A
FULL OUTER JOIN B
    ON A.elemento = B.elemento;
```

Para intersección:

```sql
SELECT DISTINCT A.elemento
FROM A
INNER JOIN B
    ON A.elemento = B.elemento;
```

Para diferencias y complementos:

```sql
SELECT DISTINCT izquierda.elemento
FROM izquierda
LEFT JOIN derecha
    ON izquierda.elemento = derecha.elemento
WHERE derecha.elemento IS NULL;
```

Sustituir `izquierda` y `derecha` por los nombres de la tabla anterior. Explicar brevemente COALESCE para unión, las coincidencias de INNER JOIN y el filtro de ausencia de LEFT JOIN.

La equivalencia supone valores sin NULL, una columna común y comparación compatible entre las tablas. DISTINCT elimina duplicados causados por coincidencias repetidas. El orden de filas no está garantizado sin ORDER BY; comparar resultados por elementos, no por orden. La aplicación no promete compatibilidad con todos los motores SQL.

IDs: `sql-operation-select`, `sql-dataset`, `sql-venn`, `sql-operation`, `sql-operation-description`, `sql-code`, `join-code`, `join-explanation`, `sql-result-label`, `sql-output`. Los títulos referidos por `aria-labelledby` deben existir.

## 9. Diseño y accesibilidad

Usar fondo claro, tarjetas blancas, verdes, bordes suaves y fuentes del sistema. Mantener ancho máximo de contenido de 1240 px. Mostrar foco visible en botones, campos, pestañas y desplegables.

En Introducción, mostrar controles y diagrama en dos columnas; a 760 px o menos, una columna. En Calculadora, usar dos columnas hasta 800 px y una por debajo. En SQL, mostrar diagrama junto a consultas en escritorio; a 1000 px o menos, apilar ambos bloques; a 600 px o menos, apilar también las consultas. Permitir que los botones de símbolos envuelvan a nuevas líneas. Las pestañas pueden desplazarse horizontalmente dentro de su barra en teléfonos.

Resultados, consultas y elementos largos deben ajustarse al ancho. Las tablas deben caber en su contenedor. Mantener al menos 44 px de alto en pestañas y botones de símbolos. En móviles pequeños, los botones de operaciones básicas pueden pasar de tres a dos columnas.

Cada campo tendrá etiqueta. Conectar ayudas y errores mediante `aria-describedby`; indicar campos incorrectos con `aria-invalid`. Anunciar resultados y errores mediante regiones `aria-live="polite"`. Cada SVG debe tener título y descripción o un nombre accesible. Respetar `prefers-reduced-motion`.

Insertar datos del estudiante con `textContent`. Reservar las plantillas SVG estáticas para el marcado interno del diagrama. No interpolar valores del usuario como HTML.

## 10. Contratos de los módulos

- `Conjuntos.parse(text)` y `normalize(values)` devuelven arreglos normalizados.
- `union`, `intersection`, `difference` y `complement` devuelven arreglos nuevos; no modifican los operandos.
- `calculate(operation, universe, a, b)` recibe arreglos normalizados y devuelve `{ elements, errors }`. Si hay errores, `elements` será `null`; cada error tendrá `{ fields, message }`.
- `Motor.evaluate(source, sets, universe)` recibe un objeto como `{ A: [...], B: [...] }` y un universo normalizado. Devuelve arreglo, número o booleano; lanza `Error` si la expresión no es válida. La interfaz valida la pertenencia de todos los conjuntos a U antes de llamar al motor.
- `Distribucion.groupRegions(sets, universe)` devuelve un `Map` de cadenas de pertenencia a elementos. `render(host, sets, universe, result)` actualiza el diagrama y las tarjetas; admite `null` para un error.
- `SqlExamples.sampleData` contiene U, A y B; `SqlExamples.operations[clave]` contiene `setSql`, `joinSql` y `explanation`.

## 11. Orden de construcción y aceptación

Construir y revisar en este orden:

1. Crear archivos, HTML, pestañas y referencias de scripts. Comprobar que no hay IDs repetidos ni referencias a elementos inexistentes.
2. Implementar normalización y operaciones puras. Verificar la tabla de resultados de la sección 5.
3. Implementar Venn compartido y revisar el sombreado de las seis operaciones, incluidos complementos dentro de U.
4. Conectar Introducción, carga de ejemplo, limpieza y errores.
5. Implementar el motor avanzado siguiendo las prioridades y tipos descritos. Conectar campos dinámicos y sus botones.
6. Añadir regiones, resumen y manejo de errores de la calculadora.
7. Añadir SQL independiente con sus dos consultas, dataset y salida calculada.
8. Aplicar estilos, adaptación móvil y accesibilidad. Revisar las tres pestañas con clic y teclado.
9. Ejecutar las comprobaciones y registrar los resultados reales de la entrega.

Casos mínimos:

| Caso | Resultado o comportamiento esperado |
| --- | --- |
| Carga inicial | Introducción visible; unión y valores iniciales |
| Normalización `1, 2,2,,3` | Tres elementos únicos |
| A y B vacíos, U sin definir | Unión ∅ |
| Complemento sin U | Error y diagrama sin sombreado |
| B contiene 9 y U no | Error de B incluso al calcular Aᶜ |
| Calculadora: `(A ∪ B) − C` con ejemplo de tres conjuntos | `{1,3,4}` |
| Calculadora: `A ∪ B ∩ C` con ese ejemplo | `{1,2,3,5}` |
| Calculadora: `|A ∪ B|` | `5` |
| Calculadora: `(A ⊆ U) ∧ (B ⊆ U)` | Verdadero |
| Calculadora: paréntesis incompleto o `A ∪` | Error explicativo |
| Reducir de tres a dos conjuntos con C en la expresión | Error hasta corregir la expresión o restaurar C |
| Elegir ocho conjuntos | Campos A–H y tarjetas sin círculos |
| Cambiar Introducción después de elegir SQL | SQL conserva su propia selección |
| Consultas SQL con duplicados sin NULL | Ambas alternativas dan los mismos elementos sin duplicados |
| Navegación por teclado | Flechas, Home y End activan el panel correcto |
| Cambiar de pestaña y volver | Datos conservados |
| Recargar | Se restauran los estados iniciales |

Como apoyo local, si se dispone de la carpeta `tests/`, pueden ejecutarse `node tests/auditoria.cjs` y `python3 tests/sql.py`. Esa carpeta está excluida de Git y no es necesaria para reconstruir la aplicación. La segunda prueba requiere Node y SQLite 3.39 o posterior dentro de Python, por el soporte de FULL OUTER JOIN. Si los archivos no están disponibles, usar los casos de aceptación de esta sección para comprobar la implementación.

Revisar además la página en navegador: teclado, controles dinámicos, errores, diagramas y pantallas de 375 px y escritorio. Las pruebas de cálculo y referencias HTML no sustituyen esa revisión visual.

## 12. Coherencia después de cada cambio

Todo cambio debe dejar código, SSD y README consistentes. Revisar siempre los tres; actualizar las secciones afectadas antes de dar el trabajo por terminado. Si cambia una operación, una entrada, una pantalla o un valor inicial, documentar también sus reglas, ejemplos y resultados esperados.

La SSD debe permitir reconstruir la aplicación desde una carpeta vacía y obtener las mismas funciones, estados iniciales, consultas y resultados. El README debe explicar cómo abrir y usar esa misma versión. No dejar instrucciones contradictorias ni depender de la guía técnica, el informe de auditoría o el PDF: esos documentos son locales y están excluidos de Git.

El `.gitignore` permite únicamente los archivos de la aplicación, esta SSD, el README y el propio `.gitignore`. Si se incorpora un archivo necesario para ejecutar la aplicación, añadir su ruta exacta a las excepciones para que quede disponible al clonar el repositorio.
