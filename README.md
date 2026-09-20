# GIFinder

Explorador de contenido multimedia construido con Vite y TypeScript.

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev
```

Para compilar el proyecto:

```bash
pnpm build
```

## Funcionalidades actuales

- Representación tipada de GIFs.
- Galería generada desde un arreglo local.
- Búsqueda por título, autor, etiqueta y descripción.
- Manejo del caso sin resultados.

## Estado del proyecto

EC1 F1 A2 completada. Los datos aún son locales; la integración con Giphy API se
realizará después.

## Funcionalidad EC1 F2 A3

El proyecto fue refactorizado en módulos para separar:

- modelos y tipos;
- datos locales;
- servicios de búsqueda;
- componentes de interfaz;
- funciones auxiliares.

La aplicación permite buscar GIFs, consultar su detalle, cerrar el detalle y
comunicar los estados de la interfaz.

## Verificación

```bash
pnpm install
pnpm dev
pnpm build
```
