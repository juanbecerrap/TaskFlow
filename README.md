# TaskFlow

Aplicación web para gestionar proyectos y tareas, con panel de estadísticas y tablero Kanban. Cada usuario ve únicamente sus propios datos.

> Proyecto de portafolio. Demo: **https://taskflow-juan.web.app** · Repositorio: **[pendiente de enlazar]**

## Capturas

**[Pendiente: agregar capturas del panel, la lista de tareas y el tablero]**

## Funcionalidades

- Registro, inicio de sesión y recuperación de contraseña con correo y contraseña.
- Proyectos: crear, editar, archivar, buscar y eliminar con confirmación.
- Tareas: título, descripción, estado, prioridad y fecha límite; filtros, búsqueda y orden.
- Panel con datos reales: proyectos activos, tareas pendientes, completadas y vencidas, progreso general, próximas tareas y proyectos recientes.
- Tablero Kanban de tres columnas: se puede arrastrar o cambiar el estado con un selector accesible (con anuncio para lectores de pantalla).
- Carga de páginas bajo demanda y separación de librerías grandes.

## Tecnologías

React 19 · TypeScript (modo estricto) · Vite · React Router · Bootstrap 5 · React Hook Form + Zod · Firebase (Authentication, Firestore, Hosting) · Vitest + Testing Library.

## Requisitos

- Node.js 24 o superior y npm.
- Para las pruebas de reglas: Java 21 y Firebase CLI.

## Puesta en marcha

```
npm install
copy .env.example .env
```

Completa en `.env` los valores de tu proyecto de Firebase (consola de Firebase → Configuración del proyecto → Tus apps). **`.env` nunca se sube al repositorio.**

```
npm run dev
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprueba tipos y genera `dist` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Pruebas de componentes, hooks y lógica (172) |
| `npm run test:reglas` | Pruebas de reglas de Firestore en el emulador (49) |

## Emuladores de Firebase

Para desarrollar sin tocar datos reales:

```
firebase emulators:start --only auth,firestore --project taskflow-juan
```

y en `.env` pon `VITE_USE_FIREBASE_EMULATORS=true` (reinicia `npm run dev` para que lo lea). Vuelve a `false` al terminar. Cierra el emulador con Ctrl+C antes de `npm run test:reglas`, porque ambos usan el puerto 8080.

## Estructura

```
src/
  components/   Componentes reutilizables y de layout
  features/     Lógica por dominio: auth, proyectos, tareas, panel
  hooks/        Hooks compartidos
  lib/          Firebase, formato de fechas y texto
  pages/        Páginas de la aplicación
  routes/       Rutas, protección y carga diferida
  types/        Modelos de datos
tests/reglas/   Pruebas de reglas de seguridad de Firestore
firestore.rules, firestore.indexes.json, firebase.json
```

## Seguridad

- Las reglas de Firestore exigen sesión, limitan cada documento a su dueño (`ownerId`, inmutable), validan campos, tipos y longitudes, y fijan las marcas de tiempo en el servidor. Una tarea solo se crea dentro de un proyecto propio. Todo lo demás está denegado.
- Las 49 pruebas de reglas se ejecutan contra el emulador.
- No hay claves ni credenciales en el código ni en el historial de Git.

## Limitaciones conocidas

- **`npm audit` informa 5 vulnerabilidades altas, todas de una sola cadena** (`@grpc/grpc-js` 1.9.16, traído por `firebase`). Afectan al código de *servidor* gRPC; la app web no lo usa y no está en el paquete del navegador (comprobado buscando `@grpc` en `dist`). Solo se ejecuta en Node durante las pruebas de reglas. La corrección automática propone `firebase@9.14.0`, que rompe la aplicación, así que no se aplica. Se resolverá al actualizar Firebase.
- Las cabeceras de seguridad de Hosting (nosniff, X-Frame-Options, Referrer-Policy y Permissions-Policy) y la política de caché (sin caché para las páginas, un año para los archivos con hash de `assets/`) están verificadas en la URL publicada.
- No hay Content-Security-Policy; es una mejora pendiente.
- Si al registrarse falla la escritura del perfil en Firestore, la cuenta ya existe en Authentication.
- Se carga Bootstrap completo; podría reducirse el CSS con una compilación a medida.
- La revisión de accesibilidad con Lighthouse y de responsive se hace manualmente; aún no hay informe registrado.

## Despliegue

Publicado en Firebase Hosting (plan Spark, sin facturación): https://taskflow-juan.web.app

Para volver a publicar:

```
npm run build
firebase deploy --only hosting
```

Las reglas e índices se despliegan aparte con `firebase deploy --only firestore`.