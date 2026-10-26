# Horarios · PSCS 2026

Aplicación web estática para consultar y comparar las 16 divisiones de Historia, Geografía y Ciencia Política del Profesorado Superior de Ciencias Sociales, Concordia (Entre Ríos).

## Funciones

- Grilla de lunes a viernes, 18:30–22:20, con franjas y recreos.
- Selector de carrera (Historia, Geografía, Ciencia Política o Todas) con filtros individuales de las 16 divisiones; permite combinar años y carreras para detectar coincidencias. Se recuerda la selección en el navegador.
- Búsqueda de materias, filtros de superposición y acciones para mostrar u ocultar todas las divisiones.
- Resaltado de franjas donde coinciden varias materias seleccionadas.
- Vistas Día, Semana y Lista; Semana es la vista inicial de escritorio y Día la de móvil. Cada tamaño recuerda la última vista elegida.
- Agenda diaria con selector de lunes a viernes para móvil vertical, y lista agrupada por día.
- Edición, adición y eliminación de materias con almacenamiento en el navegador. Panel flotante desde la derecha en escritorio y diálogo inferior en pantallas compactas, sin cambiar el ancho ni la posición del horario.
- Deshacer el último cambio de la sesión, desde el aviso o el menú de opciones.
- Exportación de horarios en JSON.
- Apariencia del sistema, clara u oscura, diseño responsive, sin dependencias de ejecución externas.
- Navegación por teclado, foco visible, etiquetas accesibles, mensajes de estado y respeto por movimiento reducido.

## Uso local

Abrir `index.html` en un navegador moderno, o servir esta carpeta con un servidor estático. No requiere instalación de paquetes ni compilación. Para compartirla, publicar los archivos en un alojamiento HTTPS.

El manifiesto aporta nombre, icono y modo de apertura. No hay un service worker ni una garantía de uso sin conexión.

## Comprobación

Con Node.js instalado:

```sh
node --check app.js
node --check schedule-core.js
node --test tests/schedule-core.test.cjs
```

Las pruebas verifican los 402 registros, las 16 divisiones y las 242 clases agrupadas, continuidad dentro del módulo, separación de clases simultáneas, compatibilidad de cambios anteriores y búsqueda sin tildes. La revisión visual e interactiva se documenta en [design-qa.md](design-qa.md).

`schedule-core.js` contiene las reglas de horarios; `app.js` administra filtros, vistas, edición y persistencia; `styles.css` define la presentación adaptable.

## Datos y limitaciones

Se transcribieron los horarios de la planilla **HISTORIA 2026 Horarios.xlsx** (modificada 19/10/2026). Los nombres de docentes fueron omitidos a propósito. Se conservaron las denominaciones de las materias y las asignaciones horarias que aparecen en la planilla, incluyendo posibles inconsistencias de origen (por ejemplo, Práctica Docente II en primer año y el número de Contemporáneos en cuarto). La planilla contiene celdas vacías y rótulos sueltos que no se interpretaron como nuevas clases. Verificar cualquier decisión institucional con Secretaría Académica.

Los cambios son locales al navegador y no se sincronizan entre dispositivos; la exportación permite respaldarlos. Se conserva la clave de cambios `historia-horarios-v1` y se validan los registros anteriores al cargarlos. La exportación JSON contiene todas las carreras y personalizaciones, no solamente las clases visibles. No se incluye una función de importación.

## Diseño

El rediseño combina las propuestas elegidas: móvil diario de la opción 1, calendario de escritorio de la opción 2 y lista agrupada de la opción 3. El editor se abre como panel flotante sobre el horario, según el ajuste posterior solicitado. Aplica criterios de las [Human Interface Guidelines de Apple](https://developer.apple.com/design/human-interface-guidelines/): jerarquía clara, controles consistentes, adaptación al espacio, acciones reversibles y accesibilidad. Es una interfaz web; no utiliza componentes nativos de Apple.

La tipografía usa las fuentes del sistema. Se conserva el icono original del proyecto. Los iconos adicionales son de [Phosphor Icons](https://github.com/phosphor-icons/core), con licencia MIT incluida en `assets/icons/LICENSE.txt`.

El paquete UI/UX Pro Max Skill 2.15.0 aportado se analizó como material de referencia. No se distribuye ni ejecuta dentro de la app.

## Visualización por módulos (actualización)

Cada módulo se muestra como una única franja de calendario. Cuando una comisión cursa la misma materia en las dos mitades del módulo, aparece **un único bloque**, por ejemplo 18:30–19:40. Si cambia la materia a mitad del módulo, aparecen dos bloques diferenciados con sus horas exactas. Los recreos mantienen la separación entre módulos. La vista de lista y el editor respetan estos bloques agrupados; la edición o eliminación de una clase completa afecta sus dos mitades.
- Las clases de dos comisiones en el mismo horario se muestran una al lado de la otra, con el ancho repartido entre ellas y toda la altura del módulo cuando corresponde.
- Los medios módulos siguen respetando su mitad temporal; cuando hay más clases simultáneas se agregan columnas y el calendario permite desplazamiento horizontal.

## Geografía y Ciencia Política · actualización octubre 2026

Se incorporaron los cuatro años de **Geografía** (103 franjas) y los cuatro años de **Ciencia Política** (106 franjas) a partir de sus planillas de horarios actualizadas de octubre de 2026. Historia conserva sus ocho divisiones y 193 franjas. En total: **16 divisiones, 402 franjas y 242 clases agrupadas** según la regla de continuidad dentro de cada módulo.

Los registros se mantienen en `data.js` (Historia) y `career-data.js` (Geografía y Ciencia Política). Los nombres del personal docente se excluyen de la vista. Una celda de 4.º de Ciencia Política contenía únicamente «Ignacio Díaz» y se descartó por no identificar una materia. La fuente sigue siendo la planilla original, que puede requerir confirmación institucional en casos de datos incompletos o discrepancias.

La opción **Todas** permite comparar entre carreras; las tarjetas conservan el año mediante colores. El editor ahora incluye el campo Carrera. Los datos iniciales de Historia y las personalizaciones locales anteriores se conservan.

Fuentes: [Historia 2026](https://docs.google.com/spreadsheets/d/1UEIhqxZstwIM2pKali8YwkaY3zRbso1X/edit), [Geografía 2026](https://docs.google.com/spreadsheets/d/1n6jXd48oKlDClb5Rs788ctV4YAWJF1XI/edit), [Ciencia Política 2026](https://docs.google.com/spreadsheets/d/1fIeAO6PqOSqQ89vsCuXH7aCPZ0EkKAes/edit).
