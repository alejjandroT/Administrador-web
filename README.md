# Administrador Web - Portal de Emergencias

El desarrollo de este Administrador Web fue realizado en conjunto con Johan Manuel Alvarez Pinta, Juan Diego Eraso Muñoz y Luis Alejandro Tosne Idrobo, estudiantes de la Institución Universitaria Colegio Mayor del Cauca, la carrera de Ingeniería Informática los 2 primeros y la carrera de Tecnología en desarrollo de software el tercero respectivamente.

Este proyecto es una aplicación web desarrollada en **Angular 19** diseñada para la administración y gestión de reportes de emergencias. Incluye funcionalidades para la gestión de usuarios, ubicaciones (con generación de códigos QR), visualización de reportes en un dashboard interactivo y autenticación segura.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en características (`features`) y núcleo (`core`) para asegurar escalabilidad y mantenibilidad.

### Directorios Principales (`src/app/`)

-   **`core/`**: Contiene servicios singleton, interceptores HTTP, guardias de autenticación y lógica de negocio transversal.
    -   `auth/`: Servicios y guards relacionados con la autenticación.
    -   `http/`: Interceptores y configuraciones de peticiones HTTP.
    -   `services/`: Servicios globales de la aplicación.
    -   `tokens/`: Tokens de inyección de dependencias.
-   **`features/`**: Módulos funcionales de la aplicación.
    -   `auth/`: Páginas de inicio de sesión y recuperación de contraseña.
    -   `dashboard/`: Panel principal con gráficas y estadísticas (usa Chart.js).
    -   `layout/`: Componentes de estructura base (sidebar, header, etc.).
    -   `ubicaciones/`: Gestión de ubicaciones y generación de QRs.
    -   `users/`: Administración de usuarios del sistema.
-   **`shared/`**: Componentes, directivas y pipes reutilizables en toda la aplicación.
-   **`enviroments/`**: Archivos de configuración de entorno (API URLs, flags de producción).

## Tecnologías Clave

-   **Framework**: Angular 19
-   **Lenguaje**: TypeScript
-   **Estilos**: CSS estándar
-   **Gráficos**: Chart.js (`chart.js`, `chartjs-plugin-datalabels`)
-   **Utilidades**:
    -   `qrcode`: Generación de códigos QR.
    -   `file-saver`, `jszip`: Manejo y descarga de archivos.

## Guía de Instalación y Ejecución

Sigue estos pasos para replicar el entorno de desarrollo y ejecutar el proyecto localmente.

### Prerrequisitos

-   **Node.js**: Asegúrate de tener instalada una versión compatible con Angular 19 (se recomienda Node.js v18 o superior).
-   **pnpm**: Este proyecto utiliza `pnpm` como gestor de paquetes. Si no lo tienes, instálalo con:
    ```bash
    npm install -g pnpm
    ```

### Pasos para Replicar

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/alejjandroT/Administrador-web.git
    ```

2.  **Instalar dependencias**:
    Ejecuta el siguiente comando en la raíz del proyecto para descargar todas las librerías necesarias:
    ```bash
    pnpm install
    ```

3.  **Configuración de Entorno**:
    Verifica el archivo de configuración de la API.
    -   Abre `src/app/enviroments/environment.ts`.
    -   Asegúrate de que la propiedad `apiBase` apunte a tu servidor backend (por defecto suele ser `http://localhost:5217/api` o la URL de producción según necesites).

    ```typescript
    export const environment = {
      production: false,
      apiBase: 'http://localhost:5217/api' // Ajusta esto si es necesario
    };
    ```

4.  **Ejecutar el Servidor de Desarrollo**:
    Inicia la aplicación en modo local:
    ```bash
    pnpm start
    ```
    Este comando ejecuta `ng serve`. Una vez compile, abre tu navegador en:
    [http://localhost:4200/](http://localhost:4200/)

### Comandos Adicionales

-   **Construir para Producción**:
    Genera los archivos optimizados en la carpeta `dist/`:
    ```bash
    pnpm build
    ```

-   **Ejecutar Tests**:
    ```bash
    pnpm test
    ```

## Notas Adicionales

-   El proyecto tiene habilitado **HMR (Hot Module Replacement)** para una experiencia de desarrollo más fluida.
-   La carpeta de entornos se llama `enviroments` (nota la ortografía en el path `src/app/enviroments`).