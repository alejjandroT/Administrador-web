# 🧯 Portal de Emergencias — Frontend (Angular)

Aplicación **Angular (standalone)** para la gestión de brigadistas, ubicaciones y exportación de códigos QR.  
Incluye autenticación JWT, guards, interceptores HTTP y arquitectura escalable siguiendo principios **SOLID**.

---

## 🚀 Tecnologías principales

- **Angular 19+** (Standalone Components)
- **RxJS** y Signals API
- **TypeScript**
- **JWT Authentication**
- **Modales y formularios reactivos**
- **Generación y descarga de QR** con `qrcode`, `jszip` y `file-saver`

---

## ⚙️ Requisitos previos

- Node.js **20+**
- **pnpm** (instálalo si no lo tienes: `npm install -g pnpm`)
- Angular CLI **19+**
- Backend del proyecto (`.NET API`) en ejecución local (por defecto `http://localhost:5217/api`)

---

## 🧩 Instalación

Clona el repositorio y ejecuta:

```bash
pnpm install
Si ocurre algún error de dependencias:

bash
Copy code
pnpm install --legacy-peer-deps
🌐 Configuración del entorno
Edita el archivo:

ts
Copy code
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:5217/api' // URL de tu backend local
};
🔒 Autenticación JWT
Login: POST /api/admin/auth/login
Retorna un token JWT que se guarda en localStorage.

AuthInterceptor: agrega Authorization: Bearer <token> a todas las peticiones.

AuthGuard: protege rutas del dashboard y redirige a /login si no hay sesión activa.

🛠️ Scripts
Comando	Descripción
pnpm start	Inicia el servidor local en http://localhost:4200
pnpm run build	Genera el build de producción (dist/)
pnpm run lint	Ejecuta análisis de código (opcional)

🧱 Estructura del Proyecto
bash
Copy code
portal-emergencias/
├── src/
│   ├── app/
│   │   ├── app.component.*         # Shell principal
│   │   ├── app.routes.ts           # Definición de rutas
│   │   ├── app.config.ts           # Providers globales (router, http, animations)
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   ├── auth.tokens.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   └── services/
│   │   │       ├── brigadistas.service.ts
│   │   │       └── ubicaciones.service.ts
│   │   ├── features/
│   │   │   ├── auth/login/
│   │   │   │   ├── login.component.ts / html / css
│   │   │   ├── layout/admin-shell/
│   │   │   │   ├── admin-shell.component.ts / html / css
│   │   │   ├── dashboard/dashboard/
│   │   │   │   ├── dashboard.component.ts / html / css
│   │   │   ├── brigadistas/brigadistas/
│   │   │   │   ├── brigadistas.component.ts / html / css
│   │   │   ├── ubicaciones/ubicaciones/
│   │   │   │   ├── ubicaciones.component.ts / html / css
│   │   │   ├── qr/exportar-qr/
│   │   │   │   ├── exportar-qr.component.ts / html / css
│   │   └── shared/components/toast-container/
│   │       ├── toast-container.component.ts / html / css
│   │       └── toast.service.ts
├── angular.json
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
🔍 Funcionalidades principales
👨‍🚒 Brigadistas
Listado general con búsqueda dinámica.

Crear / editar brigadista mediante modales flotantes.

Validaciones de formulario en tiempo real.

Eliminar con confirmación.

📍 Ubicaciones
CRUD completo (crear, editar, eliminar).

Búsqueda por nombre o código.

Interfaz unificada con señales (signals).

🧾 Exportar QR
Generación de QR individuales o masivos.

Descarga en formato .zip.

Integración con qrcode, jszip, file-saver.

🎨 UI y Animaciones
Diseño minimalista y responsivo con CSS puro.

Animaciones suaves con Angular @angular/animations.

Modales centrados con backdrop translúcido.

Colores institucionales (azul Unimayor).

🧰 Interceptores
Interceptor	Función
AuthInterceptor	Añade el header Authorization con el token JWT
ErrorInterceptor	Maneja errores globales (401 → logout y redirección a login)

🧑‍💻 Desarrollo y contribución
Crea una nueva rama:

bash
Copy code
git checkout -b feat/nueva-funcionalidad
Haz tus cambios y commitea con convención clara:

bash
Copy code
git commit -m "feat(brigadistas): agrega modales y validaciones"
Sube los cambios:

bash
Copy code
git push origin feat/nueva-funcionalidad
Abre un Pull Request hacia main.

🧠 Buenas prácticas implementadas
Arquitectura modular y escalable.

Principios SOLID.

Separación de responsabilidades (Core / Features / Shared).

Tipado fuerte con TypeScript.

Reactive Forms + Signals.

*Uso de trackById en ngFor para optimizar renders.

🧪 Troubleshooting
Problema	Solución
Pantalla en blanco	Revisa app.routes.ts y que provideRouter(routes) esté configurado
Error API_URL	Asegúrate que API_URL se provee en app.config.ts
Error @angular/animations	Instala: pnpm add @angular/animations
Error CORS	Configura proxy o habilita CORS en backend

📄 Licencia
MIT © 2025 — Desarrollado por Luis Alejandro
Proyecto académico para el colegio mayor del cauca.

💬 Contacto
📧 luis.alejandro.dev@gmail.com
🐙 GitHub: @alejjandro