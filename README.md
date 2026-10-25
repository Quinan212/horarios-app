# Mapa de horarios — Historia 2026

Aplicación web estática para comparar las ocho comisiones del Profesorado de Educación Secundaria en Historia del Profesorado Superior de Ciencias Sociales, Concordia (Entre Ríos).

## Funciones

- Grilla de lunes a viernes, 18:30–22:20, con franjas y recreos.
- Selector independiente de ocho divisiones (1.ª y 2.ª de cada año), con opciones para elegir una sola, combinar varias o activar/desactivar un año completo. La selección se recuerda en este navegador.
- Búsqueda de materias, filtros de superposición y acciones para mostrar u ocultar todas las divisiones.
- Resaltado de franjas donde coinciden varias materias seleccionadas.
- Vista semanal / vista de lista.
- Edición y adición de materias con almacenamiento en el navegador.
- Exportación de horarios en JSON.
- Modo claro/oscuro, diseño responsive, sin dependencias externas.

## Uso local

Abrir `index.html` en cualquier navegador moderno. Para instalar como PWA o compartirla, usar un servidor HTTPS (GitHub Pages / Vercel / Netlify).

## Datos y limitaciones

Se transcribieron los horarios de la planilla **HISTORIA 2026 Horarios.xlsx** (modificada 19/10/2026). Los nombres de docentes fueron omitidos a propósito. Se conservaron las denominaciones de las materias y las asignaciones horarias que aparecen en la planilla, incluyendo posibles inconsistencias de origen (por ejemplo, Práctica Docente II en primer año y el número de Contemporáneos en cuarto). La planilla contiene celdas vacías y rótulos sueltos que no se interpretaron como nuevas clases. Verificar cualquier decisión institucional con Secretaría Académica.

Los cambios son locales al navegador y no se sincronizan entre dispositivos; la exportación permite respaldarlos.

## Diseño

Se utilizaron recomendaciones visuales de UI/UX Pro Max Skill 2.15.0 aportada para este proyecto. No se distribuye la skill dentro de la app.

## Visualización por módulos (actualización)

Cada módulo se muestra como una única franja de calendario. Cuando una comisión cursa la misma materia en las dos mitades del módulo, aparece **un único bloque**, por ejemplo 18:30–19:40. Si cambia la materia a mitad del módulo, aparecen dos bloques diferenciados con sus horas exactas. Los recreos mantienen la separación entre módulos. La vista de lista y el editor respetan estos bloques agrupados; la edición o eliminación de una clase completa afecta sus dos mitades.
- Las clases de dos comisiones en el mismo horario se muestran una al lado de la otra, con el ancho repartido entre ellas y toda la altura del módulo cuando corresponde.
- Los medios módulos siguen respetando su mitad temporal; cuando hay más clases simultáneas se agregan columnas y el calendario permite desplazamiento horizontal.
