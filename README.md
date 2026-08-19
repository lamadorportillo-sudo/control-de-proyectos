# Control de Proyectos

Sistema web para **control financiero, contractual y supervisión de proyectos**, conectado a Supabase y diseñado para funcionar en PC, tablet y celular.

## Funciones principales

- Gestión de proyectos y contratos.
- Anticipos y amortización.
- Estimaciones/pagos con deducciones.
- Retención y devolución de garantía de calidad.
- Garantías y ampliaciones de vigencia.
- Visitas, observaciones y seguimiento.
- Ofertas, adjudicación y decisión final.
- Modificaciones contractuales.
- Evaluación final del contratista y del proyecto.
- Informes de adjudicación, anticipo, estimación, calidad de obra y cierre/final.
- Tablero ejecutivo responsive con indicadores y alertas.

## Estructura actual del repositorio

- `index.html` — punto de entrada de la aplicación.
- `bundle-01.js` a `bundle-12.js` — bloques comprimidos que reconstruyen la versión funcional actual de la aplicación en el navegador.
- `README.md` — documentación general del proyecto.

La aplicación continúa siendo una SPA web sin proceso de compilación y conserva la lógica de la versión standalone utilizada durante el desarrollo.

## Base de datos

El sistema utiliza el proyecto Supabase independiente **control de proyectos** para autenticación y persistencia en la nube. No está vinculado al proyecto HALU.

## Ejecución

Para ejecutarlo desde un servidor web estático, el archivo principal es `index.html`. El cargador reconstruye automáticamente la aplicación completa desde los archivos `bundle-*.js`.

## Seguridad

El frontend puede utilizar una **publishable key** de Supabase. Nunca deben agregarse a este repositorio claves `service_role`, secret keys, contraseñas ni otras credenciales privadas.

## Estado

Repositorio de trabajo de **Control de Proyectos**. La rama principal es `main`.
