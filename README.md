# Río Bueno Te Lo Cuenta

Este proyecto es un portal de transparencia para la comuna de Río Bueno. Permite mostrar proyectos municipales de manera interactiva, con fotografías mensuales, porcentaje de avance, hitos y desglose presupuestario, todo alimentado directamente desde una hoja de cálculo de Google Sheets. La aplicación está construida con **React 18**, **Vite** y **Tailwind CSS**, no necesita backend y puede desplegarse fácilmente en Netlify o Vercel.

## 🧱 Estructura del repositorio

```
rio-bueno-participa/
├─ index.html                # plantilla principal (modo oscuro por defecto)
├─ vite.config.ts            # configuración de Vite y plugin React
├─ tailwind.config.js        # tema oscuro con color primario (#27AE60)
├─ postcss.config.js         # Tailwind + autoprefixer
├─ tsconfig.json             # configuración TypeScript
├─ .env.example              # variables de entorno de Google Sheets
├─ .eslintrc.cjs, .prettierrc# configuración de calidad de código
├─ public/
│  ├─ offline-data/          # CSV de respaldo (Proyectos, Meses, Fotos)
│  └─ img/placeholders/      # imágenes de relleno para proyectos y meses
├─ src/
│  ├─ main.tsx               # entrada de React
│  ├─ App.tsx                # proveedor de datos y ruteo
│  ├─ router.tsx             # definición de rutas
│  ├─ config/                # claves de Google Sheets
│  ├─ lib/                   # tipos, formateo, exportación CSV y fetch de Sheets
│  ├─ routes/                # páginas (Home, ProjectDetail, NotFound)
│  ├─ components/            # tarjetas, filtros, gráficas, mapa, etc.
│  └─ styles/globals.css      # estilos globales y @media print
└─ README.md                 # este archivo
```

## 📦 Instalación y ejecución local

1. Asegúrate de tener Node .js 18+ instalado. Clona este repositorio y entra en la carpeta.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Copia el archivo `.env.example` a `.env` y reemplaza `VITE_SHEET_ID` por el ID de tu hoja de cálculo de Google. Por defecto se usarán las hojas llamadas **Proyectos**, **Meses** y **Fotos**, pero puedes personalizarlo:

   ```env
   VITE_SHEET_ID=1a2b3c4d...   # ID del spreadsheet
   VITE_SHEET_PROY=Proyectos
   VITE_SHEET_MESES=Meses
   VITE_SHEET_FOTOS=Fotos
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación se abrirá en `http://localhost:5173`. Cada cambio se recargará en caliente.

5. Para generar una versión de producción:

   ```bash
   npm run build
   ```

   El contenido listo para desplegar quedará en la carpeta `dist`.

## ☁️ Despliegue en Netlify o Vercel

Ambos servicios soportan proyectos creados con Vite sin configuración adicional. Para desplegar:

1. Crea un nuevo sitio en Netlify/Vercel y vincula tu repositorio.
2. Configura las variables de entorno `VITE_SHEET_ID`, `VITE_SHEET_PROY`, `VITE_SHEET_MESES` y `VITE_SHEET_FOTOS` en el panel del servicio.
3. Acepta los valores por defecto para el comando de build (`npm run build`) y el directorio de salida (`dist`).
4. Publica. El sitio quedará accesible en tu dominio. Puedes incrustarlo en WordPress u otras webs con un `<iframe>` como éste:

```html
<iframe src="https://tu-dominio.netlify.app" width="100%" height="1400" style="border:0;"></iframe>
```

## 📑 Estructura de la hoja de cálculo de Google

El portal lee tres hojas distintas de un mismo spreadsheet, todas publicadas como CSV (solo lectura). Para publicar tu hoja de cálculo:

1. Abre la hoja en Google Sheets.
2. Ve a **Archivo → Compartir → Publicar en la Web**.
3. Selecciona “Documento completo” y elige formato **CSV**.
4. Obtén el ID del documento de la URL (entre `/d/` y `/edit`).
5. Coloca ese ID en tu archivo `.env`.

### Hojas y columnas

- **Proyectos** (`VITE_SHEET_PROY`):

  | columna           | descripción                                                              |
  |-------------------|--------------------------------------------------------------------------|
  | id                | identificador único numérico                                             |
  | slug              | slug para la URL (único)                                                 |
  | titulo            | nombre del proyecto                                                      |
  | categoria         | categoría del proyecto (Infraestructura, Social, etc.)                  |
  | fuente            | fuente de financiamiento (Municipal, Regional, Nacional, etc.)           |
  | estado            | estado (Pendiente, Trabajando, Listo)                                     |
  | montoAsignado     | presupuesto total asignado (CLP, sin decimales)                          |
  | beneficiarios     | número de beneficiarios                                                  |
  | lat, lng          | coordenadas geográficas                                                   |
  | inicio            | fecha de inicio (YYYY-MM-DD)                                             |
  | finEstimada       | fecha de fin estimada (YYYY-MM-DD)                                       |
  | proveedor         | empresa o entidad ejecutora                                              |
  | observaciones     | comentarios adicionales (opcional)                                       |

- **Meses** (`VITE_SHEET_MESES`):

  | columna      | descripción                                                                 |
  |--------------|-----------------------------------------------------------------------------|
  | idProyecto   | id del proyecto al que pertenece                                            |
  | mes          | mes en formato YYYY-MM                                                      |
  | avance       | porcentaje de avance (0–100)                                                |
  | ejecutadoMes | monto ejecutado en el mes (CLP)                                             |
  | resumen      | texto breve resumiendo el progreso                                          |
  | eventos      | lista de eventos separados por `;` en formato `YYYY-MM-DD:Texto del evento` |

- **Fotos** (`VITE_SHEET_FOTOS`):

  | columna    | descripción                                         |
  |------------|-----------------------------------------------------|
  | idProyecto | id del proyecto                                     |
  | mes        | mes (YYYY-MM)                                       |
  | src        | URL pública de la foto                              |
  | alt        | texto alternativo para accesibilidad                |

La aplicación valida que los porcentajes estén entre 0 y 100 y que las coordenadas sean numéricas. Si faltan fotos para un mes se muestran imágenes de relleno (ver carpeta `public/img/placeholders`).

## 🧮 Formularios de Google

Para facilitar la carga de información en la hoja de cálculo puedes crear dos formularios de Google (esto es opcional y se describe aquí como recomendación):

1. **Nuevo proyecto**: conecta con la hoja **Proyectos** y crea campos para cada columna. Puedes añadir un campo de texto o fórmula para generar el slug (por ejemplo con `=LOWER(SUBSTITUTE(A2," ","-"))`).

2. **Avance mensual**: conecta con la hoja **Meses** y solicita el id del proyecto, el mes (YYYY-MM), porcentaje de avance, monto ejecutado y resumen. Añade hasta tres campos de carga de imágenes (tipo Archivo) para almacenar las fotos. Luego puedes procesar esas imágenes en tu hoja y copiar sus URLs a la hoja **Fotos**: cada imagen se convierte en una fila con `idProyecto`, `mes`, `src` (URL pública de la imagen) y `alt` (descripción breve).

## ✔️ Calidad y buenas prácticas

- **Accesibilidad**: todas las imágenes incluyen texto alternativo. Los componentes interactivos (tabs y carrusel) son navegables con teclado y utilizan atributos `aria-*` apropiados. El contraste de colores cumple con WCAG AA en modo oscuro.
- **Rendimiento**: las imágenes se cargan con `loading="lazy"`. El componente de presupuesto utiliza Chart.js de forma directa y el mapa se carga con Leaflet de manera eficiente.
- **Manejo de errores**: si el fetch de Google Sheets falla (red/CORS), el sitio recurre automáticamente a los archivos CSV de `public/offline-data` para no quedar caído.
- **Formato y linting**: se incluye ESLint con reglas para React y accesibilidad (`eslint-plugin-jsx-a11y`), y Prettier para formatear el código. Ejecuta `npm run lint` y `npm run format` para revisar el estilo.

## 🗃️ Datos de ejemplo

En la carpeta `public/offline-data` se incluyen tres archivos CSV con datos simulados de tres proyectos realesistas (mejora de la plaza de armas, construcción de un centro comunitario y limpieza del río). Estos archivos se utilizan como respaldo y también sirven para probar la aplicación en modo local. Las fotografías de ejemplo son imágenes abstractas generadas y se encuentran en `public/img/placeholders`.

---

¡Esperamos que este proyecto sea útil para fomentar la transparencia y participación ciudadana en Río Bueno! Para cualquier duda o contribución, siéntete libre de abrir un issue o enviar un pull request.