# Matemáticas Discretas — Operaciones con Conjuntos

Aplicación frontend para definir U, A y B, calcular operaciones y visualizar sus regiones en un diagrama de Venn SVG. Interfaz en español, adaptable a escritorio y móvil, con actualizaciones inmediatas, navegación por teclado y mensajes de validación accesibles.

## Tecnologías

HTML5, CSS3, JavaScript puro y SVG. Sin dependencias, fuentes externas, servicios, backend, base de datos ni proceso de compilación.

## Estructura

```text
conjuntos-discretas/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── conjuntos.js
│   ├── sql-examples.js
│   └── venn.js
├── assets/
│   └── .gitkeep
└── README.md
```

`conjuntos.js` contiene funciones matemáticas puras, normalización y validación. `venn.js` dibuja y sombrea las regiones SVG usando máscaras y recortes. `app.js` conecta entradas, botones y resultados. Los scripts clásicos se cargan en orden con `defer`, por lo que también funcionan con `file://`.

## Cómo ejecutar

Abre `index.html` directamente en un navegador moderno. No requiere instalación ni conexión a internet.

También puedes ejecutar desde la carpeta del proyecto:

```sh
cd conjuntos-discretas
python3 -m http.server 8000
```

Abre http://localhost:8000. Detén el servidor con `Ctrl+C`.

## Ejemplo y operaciones

```text
U = 1,2,3,4,5,6
A = 1,2,3
B = 3,4,5
```

Escribe únicamente los valores separados por comas, sin `U =`, llaves ni etiquetas. El ejemplo se carga al inicio y puede restaurarse con «Cargar ejemplo».

| Operación | Significado | Resultado del ejemplo |
| --- | --- | --- |
| A ∪ B | Unión | {1,2,3,4,5} |
| A ∩ B | Intersección | {3} |
| A − B | Diferencia | {1,2} |
| B − A | Diferencia | {4,5} |
| Aᶜ | U − A | {4,5,6} |
| Bᶜ | U − B | {1,2,6} |

## Reglas y validaciones

### SQL ANSI equivalente

Cada operación muestra un ejemplo SQL que se actualiza al seleccionarla: `UNION` para la unión, `INTERSECT` para la intersección y `EXCEPT` para diferencias y complementos. A − B usa A EXCEPT B; B − A invierte ese orden. Los complementos usan U EXCEPT A o U EXCEPT B.

El panel supone tablas A, B y U con una columna `elemento`. Es exclusivamente ilustrativo: no ejecuta consultas ni requiere una base de datos. El ejemplo permanece visible incluso si las entradas necesitan corrección. Las consultas y explicaciones están centralizadas en `sql-examples.js`; `app.js` las presenta sin modificar los cálculos.

Cada operación incluye un patrón JOIN relacionado y una interpretación de la región: FULL OUTER JOIN para ambos círculos, INNER JOIN para las coincidencias y LEFT JOIN con un filtro IS NULL para diferencias y complementos. La guía desplegable «JOINs y conjuntos» muestra seis diagramas pequeños, explicaciones y ejemplos ANSI: INNER, LEFT, RIGHT, FULL OUTER, LEFT ONLY y RIGHT ONLY. ANTI JOIN es un nombre conceptual; se muestra el patrón SQL real.

Los operadores de conjuntos trabajan sobre resultados; los JOINs relacionan filas. La comparación supone una clave `elemento` única y sin NULL. Los operadores sin ALL eliminan duplicados, mientras que un JOIN puede multiplicar filas. Con duplicados, NULL u otras condiciones no hay equivalencia general. Los diagramas son apoyos conceptuales. `venn.js` reutiliza las regiones y genera identificadores SVG únicos para que los siete diagramas no interfieran entre sí.

### Entradas y resultados

- Se eliminan espacios en los extremos, entradas vacías entre comas y elementos duplicados.
- Los elementos son cadenas sensibles a mayúsculas: `a` y `A` son distintos, al igual que `01` y `1`. Se conserva el orden de aparición; no se interpretan intervalos o expresiones.
- A y B pueden estar vacíos; un resultado vacío se presenta como `∅`.
- Un U vacío se considera no definido. Unión, intersección y diferencias funcionan sin U. Los complementos requieren al menos un elemento en U; esta interfaz no distingue un universo vacío de uno no especificado.
- Cuando se proporciona U, se comprueba que tanto A como B sean subconjuntos de U para mantener coherencia con el diagrama. Si hay elementos fuera de U, se bloquea el cálculo y se indican los elementos a corregir.
- Los complementos siempre se calculan respecto de U, nunca respecto del otro conjunto. La función pura `complement(U, set)` obtiene `U − set`; `calculate` aplica las validaciones antes de usarla.
- El SVG muestra regiones, sin distribuir elementos individuales. Su geometría es esquemática, incluso si un conjunto está vacío o coincide con otro. En los complementos se sombrea también la región exterior al círculo correspondiente, dentro del rectángulo U.
- Los valores del usuario se muestran mediante `textContent`.

## AI / Developer Handoff

Read [SSD/SSD.md](SSD/SSD.md) before modifying the project.
