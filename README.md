# BOHEME

Marketplace de prendas de vestir de diseñadores independientes, desarrollado para Programación Avanzada de la Universidad del Quindío. La Entrega 2 construyó el backend; la Entrega 3 permite utilizarlo desde Angular para explorar ropa de autor, publicar prendas y gestionar compras y favoritos.

## Equipo

| Integrante | Participación confirmada |
| --- | --- |
| [Completar nombre completo] | [Completar con el equipo] |
| [Completar nombre completo] | [Completar con el equipo] |
| [Agregar integrantes necesarios] | [Completar con el equipo] |

El historial backend registra autores `sofia` y `Sofia Soto Mejia`; no permite establecer por sí solo la lista completa ni atribuir responsabilidades.

## Tecnologías y organización

Angular 20.3, TypeScript 5.9, Router, HttpClient, formularios reactivos, Signals, RxJS y Bootstrap 5.3. Backend: Java 21, Spring Boot 4.1.1, Spring Security, JWT HS256, JPA/Hibernate y H2. Pruebas: Vitest con jsdom/TestBed y JUnit con herramientas de Spring y Mockito.

```text
boheme-frontend/
  src/app/core/       Modelos, servicios HTTP, guards e interceptor
  src/app/pages/      Pantallas y formularios
  src/app/shared/     Tarjetas, estados y formato de dinero
  src/app/app.routes.ts
  src/main.ts        Router, HttpClient, interceptor y detección zoneless
  proxy.conf.json
  docs/GUIA_SUSTENTACION_ENTREGABLE_3.docx
```

Frontend y backend son carpetas y repositorios independientes. Los componentes llaman a servicios de `core`; estos consultan `/api` mediante HttpClient. En desarrollo, el proxy reenvía esas solicitudes a Spring Boot en el puerto 8080. El backend valida, ejecuta los casos de uso y persiste con JPA en H2. No hay carpeta `environments` ni URL de API definida en un environment: el destino está en `proxy.conf.json`.

## Instalación y ejecución en Windows PowerShell

Requisitos: JDK 21; Node >=22.12 y <23; npm >=10; acceso inicial a las dependencias de npm y Gradle. Abrir dos terminales.

```powershell
# Terminal del backend
Set-Location 'C:\Users\Juan Restrepo\OneDrive - uniminuto.edu\Documentos\ecommerce-PA'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
# Si el JDK 21 está en otra ubicación, agregar -JavaHome 'C:\ruta\jdk-21'
```

El script configura Java, activa `dev` y genera un secreto JWT temporal aleatorio si `BOHEME_JWT_SECRET` no existe. No publicar ese secreto. `application-dev.properties` habilita usuarios demo, catálogo y H2 local.

```powershell
# Terminal del frontend
Set-Location 'C:\Users\Juan Restrepo\OneDrive - uniminuto.edu\Documentos\boheme-frontend'
npm ci
npm start
```

`angular.json` configura puerto 4200 y carga Bootstrap desde npm. `npm start` usa `proxy.conf.json`. Para cambiar el destino local de `/api`, editar ese proxy y reiniciar Angular. Spring Security permite CORS para `localhost:4200`; `dev` añade `127.0.0.1:4200`. En producción se necesitaría configurar el servidor para reenviar `/api` y devolver `index.html` en las rutas Angular.

| Acceso | Dirección o configuración |
| --- | --- |
| Angular | http://localhost:4200 |
| Swagger | http://localhost:8080/swagger-ui/index.html (también `/swagger-ui.html`) |
| H2, únicamente con `dev` | http://localhost:8080/h2-console |
| Conexión H2 | `jdbc:h2:mem:ecommercedb`; usuario `sa`; contraseña vacía |

H2 funciona en memoria con `create-drop`: favoritos y pedidos sobreviven a recargar Angular durante la ejecución, pero se pierden al detener el backend. Reiniciar también invalida los JWT anteriores si se genera otro secreto.

## Usuarios de prueba

Confirmados en `UsuariosDemo.java` y `application-dev.properties`; contraseña predeterminada de desarrollo **`BohemeDemo2026!`**. Si existe `BOHEME_DEMO_PASSWORD`, usar su valor local.

| Correo | Contraseña de desarrollo | Rol |
| --- | --- | --- |
| vendedor1@boheme.test | BohemeDemo2026! | VENDEDOR |
| vendedor2@boheme.test | BohemeDemo2026! | VENDEDOR |
| comprador1@boheme.test | BohemeDemo2026! | COMPRADOR |
| comprador2@boheme.test | BohemeDemo2026! | COMPRADOR |

## Pantallas y funcionalidades

| Pantalla | Ruta |
| --- | --- |
| Inicio | `/` |
| Login y registro | `/login`, `/registro` |
| Catálogo y detalle | `/catalogo`, `/catalogo/:id` |
| Taller y publicación | `/vendedor`, `/vendedor/publicar` |
| Bolsa y pedidos | `/bolsa`, `/pedidos` |
| Favoritos | `/favoritos` |
| Acceso denegado y 404 | `/acceso-denegado`, cualquier ruta desconocida |

El catálogo consulta datos reales, busca por nombre o descripción con debounce de 300 ms y pagina en el backend. El perfil `dev` siembra 15 prendas y la vista empieza con 12 por página. AuthGuard, GuestGuard y RoleGuard organizan la navegación; Spring Security valida JWT, roles y propiedad en el servidor.

El vendedor publica prendas con variantes y mantiene stock o suspende ventas propias. El comprador selecciona talla y cantidad, agrega a la bolsa y confirma un pedido **PENDIENTE**, sin cobro. La confirmación descuenta `stockDisponible` por variante; `stockTotal` permanece como dato independiente del modelo.

**Favoritos es la funcionalidad propia:** permite guardar y quitar prendas sin comprarlas. Usa `GET/POST/DELETE /api/favoritos`, persiste en H2, toma la identidad del JWT, evita duplicados y excluye prendas eliminadas. Las suspendidas pueden seguir apareciendo. Incluye avisos de éxito/error y lista vacía.

## Pruebas y documentación

```powershell
# Desde frontend
npm test
npm run build
npx tsc --noEmit -p tsconfig.app.json
# Desde backend, con JAVA_HOME apuntando al JDK 21
.\gradlew.bat test
# Con backend dev iniciado; crea datos de prueba
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\entrega3-smoke.ps1
```

Revisión del 15 de noviembre de 2026: **43 pruebas frontend correctas en 5 archivos** y compilación correcta. Los resultados backend, la evidencia HTTP histórica y las limitaciones se detallan en [Documentación de Entrega 3](DOCUMENTACION_ENTREGABLE_3.md). El recorrido visual completo y móvil requiere comprobación manual; una prueba de servicio no demuestra la interfaz.

La [guía de sustentación](docs/GUIA_SUSTENTACION_ENTREGABLE_3.docx) organiza el video de 15 minutos, los archivos a mostrar y las respuestas para estudiar.

## Repositorios y entrega

Backend: [sofism01/ecommerce-PA](https://github.com/sofism01/ecommerce-PA), URL comprobada en el remoto local `origin`; disponibilidad pública no comprobada en esta revisión. Frontend: **PENDIENTE publicar y agregar enlace**. Rama local frontend: `feature/angular-base`, sin commits ni remoto. Backend: `main` y referencia `origin/main`. Faltan confirmar aportes de todos y enlaces de Pull Requests. Los nombres de ramas sugeridos anteriormente (`feature/login-jwt`, `feature/catalogo`, `feature/compras`, `feature/favoritos`, `feature/ui-bootstrap`) son propuestas, no ramas existentes verificadas.
