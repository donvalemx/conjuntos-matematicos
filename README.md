# Conjuntos · Matemáticas Discretas

Aplicación web para estudiar conjuntos en tres pasos: aprender las operaciones básicas, crear expresiones propias y ver su aplicación en SQL. Está escrita en español y funciona en escritorio y móvil.

## Abrir la aplicación

Abre `index.html` en un navegador moderno. No requiere instalación ni conexión a internet.

También puedes usar un servidor estático desde la carpeta del proyecto:

```sh
python3 -m http.server 8000
```

Después abre `http://localhost:8000`. Python solo es necesario para esta opción.

## Las tres pestañas

| Pestaña | Qué permite hacer |
| --- | --- |
| Introducción | Editar U, A y B; elegir unión, intersección, diferencia o complemento; ver resultado y Venn |
| Calculadora de conjuntos | Definir de uno a ocho conjuntos y evaluar expresiones, cardinalidades, relaciones y lógica |
| Aplicación en SQL | Seleccionar una operación y comparar su consulta con operador de conjuntos y su alternativa JOIN, junto al diagrama y la salida |

Cada pestaña conserva sus propios datos y selección. Cambiar de pestaña no los borra; recargar la página restaura los ejemplos iniciales.

El ejemplo inicial de Introducción y SQL es U=`1,2,3,4,5,6`, A=`1,2,3` y B=`3,4,5`. SQL usa un dataset fijo e independiente; las consultas son ilustrativas y no se ejecutan en la aplicación.

## Escribir conjuntos y expresiones

En los campos de conjuntos, escribe valores separados por comas, sin llaves ni etiquetas. Se eliminan duplicados, entradas vacías y espacios exteriores. `a` y `A` son elementos distintos.

U vacío significa que no se ha definido el universo. Los complementos necesitan U. Cuando U tiene contenido, todos los conjuntos deben ser subconjuntos suyos.

Ejemplos para la calculadora:

```text
(A ∪ B) − C
A △ B
Aᶜ
|A ∪ B|
A ⊆ B
3 ∈ A
(A ⊆ U) ∧ (B ⊆ U)
```

**Cargar ejemplo** en la calculadora define tres conjuntos y evalúa `(A ∪ B) − C`, cuyo resultado es `{1,3,4}`. Los paréntesis cambian la agrupación. La intersección tiene prioridad sobre unión y diferencias; los conectores lógicos se resuelven de izquierda a derecha.

La herramienta admite conjuntos finitos de texto. No evalúa aritmética, intervalos ni conjuntos infinitos. La igualdad compara conjuntos; una expresión como `|A| = 3` no está admitida. Para buscar un elemento con `∈`, este debe ser un token sin espacios ni símbolos de operación, por ejemplo `Ana ∈ A`.

Los círculos son esquemáticos. Las tarjetas de la calculadora muestran las pertenencias exactas; a partir de cuatro conjuntos se muestran solo tarjetas. En SQL, ambas consultas se comparan con valores sin NULL y la columna común `elemento`; el orden de filas puede variar.

## Estudiar y reconstruir el proyecto

- [SSD/SSD.md](SSD/SSD.md): especificación completa para construir la aplicación desde cero, con pantallas, datos, reglas, consultas, eventos y resultados esperados.

La guía técnica y el informe de auditoría son documentos locales de apoyo; sus Markdown y el PDF de la guía están excluidos de Git.

Git solo admite los archivos de la aplicación, la SSD, el README y `.gitignore`. Si añades un recurso que la aplicación necesita para ejecutarse, incluye su ruta en la lista de excepciones de `.gitignore`.

Después de cada cambio, revisar que código, SSD y README describan el mismo comportamiento. Actualizar ejemplos, reglas y resultados esperados cuando corresponda. La SSD debe seguir siendo suficiente para reconstruir la aplicación desde una carpeta vacía y obtener las mismas funciones y resultados.

## Archivos de código

| Archivo | Función |
| --- | --- |
| `index.html` | Estructura de las tres pestañas |
| `css/styles.css` | Estilos y adaptación a pantallas estrechas |
| `js/conjuntos.js` | Operaciones básicas y validaciones |
| `js/venn.js` | Venn de dos conjuntos, compartido por Introducción y SQL |
| `js/motor.js` | Analizador de expresiones avanzadas |
| `js/distribucion.js` | Regiones, círculos y tarjetas de la calculadora |
| `js/sql-examples.js` | Dataset fijo y consultas de ambos tipos |
| `js/app.js` | Eventos y actualización de las tres pestañas |

## Comprobar cambios

La carpeta `tests/` contiene pruebas locales y está excluida de Git. Si tienes esos archivos, puedes ejecutarlos con herramientas de desarrollo; no son necesarios para abrir la aplicación:

```sh
node tests/auditoria.cjs
python3 tests/sql.py
```

La primera revisa cálculos, expresiones, regiones y referencias entre HTML y JavaScript. La segunda ejecuta las consultas en SQLite temporal y compara las dos alternativas, también con duplicados. Requiere Node, Python y SQLite 3.39 o posterior dentro de Python.

Revisa además la navegación con clic y teclado, los campos dinámicos, los errores y el diseño móvil. Las pruebas de cálculo no comprueban por sí solas la presentación en el navegador.
