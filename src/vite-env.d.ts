/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CSV_PROYECTOS: string;
  readonly VITE_CSV_MESES: string;
  readonly VITE_CSV_FOTOS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
