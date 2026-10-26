# Revisión del rediseño · 26 de octubre de 2026

final result: passed

## Alcance y selección

Implementación local de la combinación elegida por el usuario: móvil de la propuesta 1, escritorio semanal de la 2 y lista/editor de la 3. Se mantienen los datos de las tres carreras y el almacenamiento previo. Rama: `codex/apple-responsive-design`.

Referencia combinada: `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/horarios-apple-redesign/seleccion-combinada.png` (1448 × 1086). La investigación y las decisiones de Apple HIG están en `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/design-research-2026-10-26/`.

## Evidencia y método de comparación

Vista previa comprobada: `http://127.0.0.1:58158/`.

Capturas reales en `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/horarios-apple-redesign/qa/`:

| Evidencia | Viewport CSS solicitado | Imagen devuelta por el navegador |
| --- | --- | --- |
| `desktop-week.jpg` | 1440 × 1024 | 1440 × 1024 |
| `desktop-list-editor.jpg` | 1440 × 1024 | 1425 × 1013 |
| `mobile-day.jpg` | 390 × 844 | 375 × 811 |
| `mobile-editor.jpg` | 390 × 844 | 390 × 843 |

Se presentaron la referencia y cada captura de implementación juntas en una misma entrada de inspección visual, en tres comparaciones: calendario, móvil diario y lista/editor. Se revisaron tanto la composición completa como títulos, tarjetas y formulario. La captura del diálogo móvil se revisó durante las pruebas interactivas.

La referencia es un tablero generado con tres composiciones a escalas distintas, no una especificación de píxeles ni un archivo de fuentes. Las capturas se guardaron directamente, sin reescalado del agente. El navegador produjo algunos tamaños de imagen menores que el viewport solicitado; por ello las medidas de layout y desbordamiento se verificaron también en el DOM. Con scrollbar vertical de Windows, el contenido mide 375 px dentro del viewport de 390 px. No se atribuye ese scrollbar al diseño ni se declara equivalencia píxel a píxel. La comparación evalúa la estructura elegida, proporciones, jerarquía, contenido y uso real.

## Fidelidad de las cinco superficies

| Superficie | Resultado observado |
| --- | --- |
| Tipografía | Fuentes del sistema, título destacado, pesos moderados y texto secundario legible. Los nombres largos se ajustan al ancho. No hay archivos tipográficos pendientes. |
| Espacio y geometría | Calendario de cinco días a todo el ancho; cabecera compacta sin barra lateral; tarjetas por módulo y recreos separados. En móvil: controles, selección, vistas, círculos de días y agenda. Lista por días con inspector de 340 px en escritorio. |
| Color y superficies | Fondos opacos claros, bordes sutiles, acciones azules y tarjetas suaves. El color de cada año se mantiene entre vistas. Tema oscuro con tokens semánticos propios. |
| Recursos | Icono original del proyecto y SVG oficiales de Phosphor servidos localmente. Sin imágenes de marcador ni recursos remotos necesarios para renderizar. |
| Texto y datos | Materias y horas reales, 14 clases en la selección inicial de Historia 1.º/1.ª. Se conservan las 402 franjas y 242 grupos al seleccionar las 16 divisiones. Etiquetas y estados vacíos en español. |

Decisiones deliberadas respecto del tablero: conservar el icono original en lugar de la marca inventada por el generador; conservar el azul de primer año también en las filas del martes, donde la imagen generada usó turquesa; usar filas de calendario más amplias para alojar varias divisiones y nombres reales. La búsqueda móvil tiene su propio botón y el menú de acciones queda en la cabecera. No son defectos de implementación.

## Correcciones verificadas

| Prioridad | Hallazgo | Reparación y comprobación |
| --- | --- | --- |
| P1 | El botón móvil de agregar perdía su nombre al ocultar el texto. | `aria-label="Nueva materia"`; nombre accesible comprobado en todos los anchos ensayados. |
| P1 | Abrir el inspector desplazaba el escritorio hasta el formulario. | Aplicar primero el layout de dos columnas y enfocar sin desplazar. Cabecera e inspector conservan su contexto al abrir desde la lista. |
| P2 | Cambiar de día destruía el botón enfocado al renderizar. | Devolver el foco al día seleccionado, sin salto de scroll. |
| P2 | Exceso de espacio vertical en la agenda móvil. | Ajustar separaciones y altura mínima de tarjetas; se preservan controles principales de 44 px y texto legible. |
| P2 | El aviso de desplazamiento aparecía aun cuando cabía toda la semana. | Mostrarlo únicamente cuando la grilla desborda su contenedor. |
| P2 | Cabecera intermedia demasiado ancha. | Reorganizar búsqueda y acciones entre 701 y 950 px; comprobar 768 px sin desbordamiento del documento. |

Sin hallazgos P0, P1 o P2 pendientes dentro del alcance comprobado. La agenda permite scroll natural: en 390 × 844 el borde inferior de la cuarta tarjeta del lunes queda aproximadamente 5 px por debajo del viewport. Es una diferencia P3 de densidad, sin contenido inaccesible.

## Comprobación funcional

- Ocho pruebas de Node aprobadas: recuentos de fuente, agrupación dentro del módulo, separación por materia/carrera/división, asignación de columnas sin colisiones, concurrencia de los quince módulos, migración de cambios, descarte de registros inválidos y búsqueda sin tildes.
- Viewports de 320, 375, 390, 768 y 1440 px: sin desbordamiento horizontal del documento; la semana conserva desplazamiento dentro de su propio contenedor cuando es necesario.
- Seleccionar todas las carreras y divisiones: 16 divisiones, 242 clases. Ocultarlas: estado vacío con acción para elegir divisiones. Restablecer: Historia 1.º/1.ª, 14 clases.
- Buscar `antiguedad` en la lista: dos resultados de Antigüedad.
- Crear una materia temporal de módulo completo: 15 clases; recargar: continúa guardada. Eliminar: 14; deshacer: 15; eliminar nuevamente: 14. No queda la materia de prueba.
- Editor: horas de inicio válidas, duración completa inhabilitada en la segunda mitad, división única para Geografía y Ciencia Política. Cancelar no modifica la materia.
- Diálogo inferior modal en móvil y editor lateral no modal en escritorio. Escape cierra y devuelve el foco al evento de origen. Foco visible y nombres accesibles comprobados mediante DOM y navegación de teclado puntual.
- Filtro de coincidencias con una división sin cruces: estado vacío correcto y acción para recuperar todas las clases.
- Exportación descargada y leída: JSON versión 2, 402 registros, fuente `Horarios 2026 · PSCS`.
- Consola del navegador: sin errores ni advertencias en los recorridos comprobados. Sintaxis, referencias locales, manifiesto y diferencias Git comprobados.

## Límites de la verificación

Pruebas realizadas en el navegador integrado basado en Chromium sobre Windows. No se verificaron un dispositivo físico, Safari, VoiceOver, teclado virtual ni una sesión real de lector de pantalla. La revisión no constituye certificación de accesibilidad. Los datos se almacenan por origen en el navegador; esta vista previa tiene sus propias preferencias locales.


## Actualización: editor flotante sin modificar el horario

final result: passed

Esta revisión sustituye el comportamiento inicial de inspector no modal en una segunda columna. Según el ajuste solicitado, ahora el editor es un diálogo modal flotante: panel de 420 px desde la derecha en escritorio y hoja inferior en pantallas compactas. La grilla y la lista no cambian de tamaño al abrirlo.

- En escritorio 1440 × 1024 se midieron antes y después de abrir el panel los mismos rectángulos del calendario y de la lista: ancho de contenido 1368,8 px, origen (28, 218), sin cambio de scroll. El editor tiene posición fija y pertenece a la capa modal del navegador.
- Escape devuelve el foco a la clase seleccionada; Cancelar vuelve al botón Nueva materia. La cruz y el fondo exterior cierran el panel. El cierre exterior exige que tanto el inicio como el final del clic ocurran fuera, evitando cerrarlo al arrastrar desde el formulario.
- Un borrador conserva su nombre al cambiar de escritorio a móvil y regresar; el diálogo no se destruye al cruzar el breakpoint.
- En 390 × 844 y 320 × 812 no hay desbordamiento horizontal dentro del formulario, y Guardar cambios permanece visible. Cancelar el borrador deja 14 clases; no se guardaron datos de prueba.
- La animación de entrada se desactiva con movimiento reducido. Se mantiene el mismo contenido del formulario, sus campos y acciones.
- Sintaxis JavaScript y diferencias Git comprobadas. Consola sin errores ni advertencias durante estos recorridos.

Evidencia de escritorio: `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/horarios-apple-redesign/qa/editor-flotante-desktop.jpg`.


## Actualización: movimiento coordinado con la referencia de Trivia

final result: passed

Referencia analizada: `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/trivia-motion-2026-10-26/ANALISIS.md`. Se trasladaron curvas y desfases a los controles web, conservando el panel flotante y la estructura del calendario.

- Panel opaco: entrada de 480 ms y salida de 347 ms con `cubic-bezier(.645,.045,.355,1)`. El fondo es una capa independiente que interpola su opacidad; el backdrop nativo permanece transparente. El formulario entra después, con bloques de 320 ms y desfases de 45 ms. El cierre conserva su último fotograma hasta retirar el diálogo.
- Durante una muestra de entrada clara, el fondo y la superficie fueron `rgb(255,255,255)`, la opacidad del panel fue 1 y la del oscurecimiento fue 0,460847, con el formulario todavía inerte. El rectángulo del horario fue idéntico antes y durante la entrada: origen (28,218), ancho 1368,8 y altura 673,6, scroll vertical 0.
- En modo oscuro, después de recargar, el fondo fue `rgb(19,24,32)` y el panel `rgb(26,34,46)` desde el inicio de la apertura. La muestra intermedia mantuvo opacidad de panel 1 y oscurecimiento 0,460435. La apariencia guardada se aplica en el encabezado antes de cargar los estilos para evitar un primer cuadro con otra apariencia.
- Cambio de tema de 500 ms: se observó un color intermedio `rgb(137,140,144)` durante el paso de claro a oscuro y el color final correcto tras recargar. El tema del sistema utiliza la misma transición cuando cambia su preferencia.
- Selección de vistas y días: una sola pieza azul se desplaza en 347 ms. Los cambios de vista retiran primero el contenido anterior (200 ms) y muestran el nuevo (420 ms). Solicitudes rápidas se resuelven con la última selección, sin superponer textos. Lista → Día → Semana terminó en Semana, 14 clases y opacidad 1, sin estado ocupado residual.
- Escape durante la entrada completó el cierre, ocultó el oscurecimiento, liberó el scroll y devolvió el foco a Nueva materia. Se verificaron también la cruz y Cancelar en el editor. Los filtros comparten la secuencia de entrada/salida y conservan sus controles.
- En móvil se guardó una clase temporal: 15 clases después del cierre; Deshacer y recargar devolvieron 14 y eliminaron la clase de prueba. Sin datos temporales pendientes.
- En 320 × 812, documento de 305 px sin desbordamiento; formulario con ancho y scroll interno de 303 px y Guardar visible. El borrador se conservó al pasar a escritorio de 1440 × 1024, donde el panel volvió a 420 px. Cancelar dejó 14 clases.
- Ocho pruebas de reglas de horario aprobadas, sintaxis de ambos scripts y referencias locales verificadas. Consola de la app sin errores ni advertencias en los recorridos revisados.
- CSS y JavaScript se publican con el mismo parámetro de versión para impedir mezclar recursos de entregas anteriores en la caché.

Capturas: `C:/Users/alan/Documents/ChatGPT/Codex local PC/work/horarios-apple-redesign/qa/movimiento-trivia/panel-claro.jpg` y `panel-movil.jpg`. La revisión se hizo en Chromium integrado sobre Windows; movimiento reducido está implementado en CSS y JavaScript, sin una sesión emulada de esa preferencia en esta revisión.
