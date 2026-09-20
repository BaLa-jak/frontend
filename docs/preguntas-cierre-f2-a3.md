# Preguntas de cierre - EC1 F2 A3

## 1. ¿Qué significa refactorizar una aplicación?

Refactorizar significa mejorar la organización interna del código sin cambiar su
comportamiento observable para quien usa la aplicación. En esta actividad,
GIFinder sigue mostrando las mismas cuatro tarjetas, la misma búsqueda por
título, autor o etiqueta y el mismo mensaje de "sin resultados" que tenía en F1
A2; lo único que cambió fue _dónde_ vive cada pieza de lógica
(`src/data/gifs.ts`, `src/utils/text.ts`, `src/services/gif.service.ts`, etc.) y
no _qué_ hace.

## 2. ¿Por qué el proyecto se dividió en módulos?

Antes de la refactorización, `main.ts` concentraba datos, utilidades, lógica de
búsqueda y manipulación del DOM en un solo archivo. Al crecer la aplicación
(agregar detalle de GIF y estados), ese archivo se volvería difícil de leer y de
mantener. Dividirlo en `models`, `data`, `utils`, `services` y `components` hace
que cada archivo tenga una única responsabilidad: por ejemplo, `gif.service.ts`
solo sabe buscar y encontrar GIFs, sin saber nada de cómo se dibujan en
pantalla.

## 3. ¿Cuál es la responsabilidad de `main.ts`?

`main.ts` ya no contiene lógica de negocio propia. Su responsabilidad es
**coordinar**: importa los módulos (`import { gifs } from './data/gifs'`,
`import { renderGallery } from
'./components/gallery'`, etc.), construye el HTML
inicial con `app.innerHTML`, selecciona y valida los elementos del DOM, y
conecta los eventos (`submit`, `input`, `click`) llamando a las funciones de los
servicios y componentes. No define `searchGifs`, ni `createGifCard`, ni ninguna
función que ya vive en otro módulo.

## 4. ¿Qué diferencias existen entre una interfaz, un tipo unión y una enumeración?

- **Interfaz** (`interface Gif { ... }`): describe la forma de un objeto, qué
  propiedades tiene y de qué tipo es cada una. Se usa para tipar datos
  estructurados como un GIF.
- **Tipo unión** (`type GifRating = 'g' | 'pg' | 'pg-13'`): restringe un valor a
  un conjunto cerrado de literales posibles. No genera código en tiempo de
  ejecución, solo existe durante la comprobación de tipos.
- **Enumeración** (`enum RequestStatus { Initial = 'initial', ... }`): agrupa
  valores relacionados bajo un nombre común y, a diferencia del tipo unión, sí
  genera un objeto real en JavaScript, por lo que se puede usar en un `switch` y
  referirse a sus miembros como `RequestStatus.Success` en vez de escribir la
  cadena `'success'` directamente.

## 5. ¿Para qué se utiliza `import type`?

`import type { Gif } from '../models/gif.interface'` le indica a TypeScript que
ese import solo se necesita durante la comprobación de tipos, no en tiempo de
ejecución. Como una interfaz no existe en el JavaScript compilado (se "borra" al
transpilar), usar `import type` deja claro que `Gif` es solo un contrato y evita
que el bundler intente incluir algo que en realidad no existe como valor.

## 6. ¿Dónde se aplicaron la desestructuración, spread y rest?

- **Desestructuración de objeto**: en `gallery.ts` y `gif-detail.ts`,
  `const { id, title, url,
  username = 'Autor no disponible', tags, rating } = gif`
  extrae las propiedades de `gif` sin repetir `gif.title`, `gif.url`, etc.
- **Desestructuración de arreglo con rest**: en `gif-detail.ts`,
  `const [mainTag = 'Sin etiqueta', ...secondaryTags] = tags` separa la primera
  etiqueta (`mainTag`) del resto (`secondaryTags`) en una sola línea.
- **Spread**: en `gif.service.ts`, `[...collection]` crea una copia superficial
  del arreglo cuando la búsqueda está vacía, y en `matchesQuery`,
  `[...gif.tags]` (dentro del arreglo
  `[gif.title, gif.username ?? '', ...gif.tags]`) incorpora todas las etiquetas
  al texto de búsqueda.

## 7. ¿Por qué `searchGifs` recibe la colección como parámetro?

Si `searchGifs` leyera directamente la variable global `gifs`, quedaría acoplada
a esa colección específica y sería difícil de probar o reutilizar con otro
conjunto de datos. Al recibir `collection: Gif[]` como parámetro, la función es
pura respecto a esa entrada: siempre depende solo de lo que se le pasa, lo que
la hace más predecible y reutilizable (por ejemplo, podría usarse en el futuro
con resultados que vengan de una API en vez del arreglo local).

## 8. ¿Por qué `findGifById` puede devolver `undefined`?

`findGifById` usa `Array.prototype.find`, que devuelve el primer elemento que
cumple la condición o `undefined` si ninguno la cumple. El tipo de retorno
`Gif | undefined` refleja ese comportamiento y obliga a quien llama a la función
(en `main.ts`) a comprobar el resultado antes de usarlo:
`if (!selectedGif) { renderStatus(RequestStatus.Error, status); return; }`. Sin
esa validación, TypeScript no dejaría acceder a las propiedades de `selectedGif`
porque podría no existir.

## 9. ¿Qué función cumple `data-gif-id`?

El atributo `data-gif-id="${id}"` que se agrega a cada botón "Ver detalle" en
`gallery.ts` guarda el identificador del GIF directamente en el HTML generado.
Cuando se hace clic en cualquier tarjeta, `main.ts` lee ese valor con
`detailButton.dataset.gifId` y lo usa para buscar el GIF correspondiente con
`findGifById(gifs, gifId)`, sin necesidad de mantener un event listener
independiente por cada botón.

## 10. ¿Qué es la delegación de eventos?

En vez de agregar un listener a cada botón individual (que además tendría que
recrearse cada vez que `renderGallery` vuelve a generar el HTML), se agrega un
único listener al contenedor padre (`gallery.addEventListener('click', ...)`).
Dentro del manejador, `target.closest('[data-gif-id]')` identifica si el clic
ocurrió sobre un botón de detalle (o dentro de él) y actúa en consecuencia. Lo
mismo se aplica en `detailContainer` para el botón "Cerrar" con
`closest('[data-action="close-detail"]')`. Esto simplifica el código y sigue
funcionando aunque el contenido se regenere dinámicamente.

## 11. ¿Por qué el estado `Loading` podría no observarse?

La búsqueda actual trabaja sobre el arreglo local `gifs` con `filter`, una
operación síncrona que termina en microsegundos. Aunque
`renderStatus(RequestStatus.Loading, status)` se ejecuta antes de llamar a
`searchGifs`, el navegador alcanza a repintar la pantalla con el resultado final
(`Success`, `Empty` o `Error`) casi de inmediato, por lo que el mensaje
"Buscando contenido..." no llega a percibirse a simple vista. El estado se dejó
preparado para cuando la búsqueda dependa de una llamada asíncrona real (por
ejemplo, a la API de Giphy), momento en el que sí habrá una espera perceptible.

## 12. ¿Qué dificultad se presentó durante la refactorización y cómo se resolvió?

Al mover el código a módulos separados y agregar la enumeración `RequestStatus`,
la compilación falló porque `tsconfig.json` tenía `"erasableSyntaxOnly": true`,
una opción que impide compilar construcciones de TypeScript que generan código
real (como `enum`) en vez de solo desaparecer al transpilar. La solución fue
cambiar únicamente esa propiedad a `false`, sin tocar el resto de la
configuración, lo que permitió que `pnpm build` terminara sin errores
conservando el resto de las reglas de linting del proyecto.
