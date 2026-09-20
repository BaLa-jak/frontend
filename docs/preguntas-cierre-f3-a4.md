# Preguntas de cierre - EC1 F3 A4

## 1. ¿Qué diferencia existe entre una operación síncrona y una asíncrona?

Una operación síncrona bloquea la ejecución hasta que termina: la instrucción
siguiente no corre hasta que la anterior devolvió un resultado. Por ejemplo,
`result.data.map(mapGiphyGif)` en `gif.service.ts` es síncrono: el arreglo ya
existe en memoria y transformarlo no requiere esperar nada externo. Una
operación asíncrona, en cambio, inicia una tarea que puede tardar un tiempo
indeterminado en resolverse (como una petición de red) y le cede el control al
resto del programa mientras espera. `await fetch(url)` dentro de `requestGifs`
es el ejemplo asíncrono central de esta actividad: el navegador sigue
respondiendo a otros eventos (clics, teclado) mientras GIPHY responde.

## 2. ¿Cuáles son los estados de una promesa y qué relación tienen con async/await?

Una `Promise` puede estar en tres estados: `pending` mientras la operación
todavía no concluye, `fulfilled` cuando terminó con éxito y entrega un valor, o
`rejected` cuando ocurrió un error. `fetch(url)` devuelve una promesa que
queda `pending` hasta que el servidor de GIPHY responde; si responde,
la promesa pasa a `fulfilled` con el objeto `Response`. `async/await` es
azúcar sintáctico sobre este mecanismo: `await` pausa la función `async` hasta
que la promesa deja de estar `pending`, entrega el valor si quedó `fulfilled` y
lanza una excepción capturable con `try/catch` si quedó `rejected`. Por eso
`requestGifs` puede leerse como código secuencial aunque por dentro siga
siendo asíncrono.

## 3. ¿Qué devuelve fetch y qué devuelve response.json()?

`fetch(url)` devuelve una `Promise<Response>`: un objeto que representa la
respuesta HTTP (encabezados, código de estado, cuerpo sin procesar), no los
datos en sí. Por eso en `requestGifs` primero se guarda en `response` y se
revisa `response.ok` antes de tocar el contenido. `response.json()` es un
método aparte que lee el cuerpo de esa respuesta, lo interpreta como JSON y
devuelve otra promesa, esta vez de un valor de JavaScript ya utilizable (en
este caso, algo que se afirma como `GiphyResponse`). Son dos pasos separados
porque leer el cuerpo también es una operación asíncrona: el cuerpo puede
llegar en partes y aún no estar completo cuando la cabecera ya se recibió.

## 4. ¿Por qué es necesario comprobar response.ok?

Porque `fetch` solo rechaza su promesa cuando falla la conexión (por ejemplo,
sin red o con un CORS bloqueado), pero no cuando el servidor responde con un
código de error como 404 o 500: esa respuesta llega igualmente como
`fulfilled`. `response.ok` es `true` únicamente cuando el estado HTTP está
entre 200 y 299, así que en `requestGifs` se comprueba explícitamente y, si es
`false`, se lanza un `Error` propio (`GIPHY respondió con el estado
${response.status}.`). Sin esta comprobación, una clave inválida (401) o un
límite alcanzado (429) pasarían desapercibidos y `response.json()` intentaría
interpretar un cuerpo de error como si fueran GIFs, produciendo fallos
confusos más adelante en `mapGiphyGif`.

## 5. ¿Cómo se utilizan try, catch y unknown para manejar errores en GIFinder?

Cada función que dispara una solicitud (`loadTrending` y el manejador
`submit` en `main.ts`) envuelve su `await` en un bloque `try`. Si `fetch`
falla, si `response.ok` es falso o si falta la clave, se lanza un `Error` que
interrumpe el `try` y salta al `catch (error: unknown)`. TypeScript tipa el
parámetro del `catch` como `unknown` en vez de `any` porque en JavaScript se
puede lanzar cualquier valor, no solo instancias de `Error`; por eso
`showRequestError` primero comprueba `error instanceof Error` antes de leer
`error.message`, y si no lo es, usa un mensaje genérico (`'Error
desconocido.'`). Esto evita acceder a una propiedad que podría no existir y
obliga a manejar el caso con seguridad de tipos.

## 6. ¿Qué diferencia existe entre GiphyGif y Gif, y qué responsabilidad tiene mapGiphyGif?

`GiphyGif` (en `giphy-response.interface.ts`) describe la forma cruda que
GIPHY envía: campos como `alt_text` en snake_case, un objeto `images` con
varias variantes (`fixed_width`, `original`) y un `rating` tipado como
`string` genérico. `Gif` (en `gif.interface.ts`) es el modelo que usa el
resto de la aplicación: más simple, con nombres en camelCase, una sola `url`
para la galería, `detailUrl` para el detalle y `rating` restringido a
`GifRating`. `mapGiphyGif` es la función que traduce de uno a otro: elige
`images.fixed_width ?? images.original` como vista previa, usa siempre
`images.original` para el detalle, resuelve valores por defecto cuando faltan
(`title || 'GIF sin título'`) y valida el `rating` con `isGifRating` para no
propagar un valor inesperado hacia la interfaz.

## 7. ¿Por qué se utiliza URLSearchParams al construir la solicitud?

Porque los parámetros de una URL deben codificarse correctamente para no
romper la petición ni interpretarse mal en el servidor: espacios, acentos y
símbolos como `&` necesitan convertirse a su forma porcentual. `URLSearchParams`
hace esa codificación automáticamente. En `buildUrl`, `new URLSearchParams({
api_key, limit, rating: 'g', ...parameters }).toString()` arma la cadena de
consulta a partir de un objeto plano, así que buscar "hola mundo" produce
`q=hola+mundo` sin que el código tenga que escapar el texto manualmente.
Además simplifica agregar parámetros condicionales: en `searchGifs` solo se
agregan `q` y `lang` cuando corresponde, delegando en `URLSearchParams` la
combinación final.

## 8. ¿Qué significa Promise<Gif[]> en el tipo de retorno?

Indica que la función no devuelve un arreglo de `Gif` de inmediato, sino una
promesa que eventualmente se resolverá con ese arreglo (o se rechazará con un
error). `getTrendingGifs(): Promise<Gif[]>` y `searchGifs(value):
Promise<Gif[]>` son funciones `async`, y toda función `async` devuelve
siempre una promesa aunque su cuerpo use `return` con un valor normal;
TypeScript lo refleja en la firma para que quien la use sepa que necesita
`await` (o `.then`) para obtener el arreglo real. Por eso en `main.ts` se
escribe `const results = await getTrendingGifs();` en vez de asignar
directamente el resultado de la llamada.

## 9. ¿Qué diferencia existe entre .env.local y .env.example, y por qué una variable VITE_ no debe considerarse secreta?

`.env.local` contiene la clave real del estudiante y nunca se publica: el
`.gitignore` del proyecto lo excluye con las reglas `.env`, `.env.*` y
`!.env.example`. `.env.example` documenta el nombre de la variable
(`VITE_GIPHY_API_KEY=`) sin ningún valor sensible, y sí se versiona para que
otra persona sepa qué configurar al clonar el repositorio. Sin embargo, una
variable con prefijo `VITE_` no es un secreto real: Vite la incrusta en el
bundle de JavaScript que se envía al navegador durante `pnpm build`, así que
cualquiera puede abrir las herramientas de desarrollador, ver el código fuente
compilado o inspeccionar la solicitud de red y leer la clave. Mantenerla fuera
de Git evita exponerla en el historial del repositorio, pero no la oculta del
cliente compilado; por eso solo se usa con una clave limitada de fines
académicos, nunca con contraseñas o tokens que exijan confidencialidad real.

## 10. ¿Cómo comprobaste que .env.local no está versionado?

Se ejecutaron `git check-ignore -v .env.local` y `git ls-files .env.local`
después de escribir las reglas en `.gitignore`. El primer comando confirmó
que la regla `.gitignore:27:.env.*` es la que excluye el archivo, y el
segundo no imprimió ninguna salida, lo que significa que Git nunca lo agregó
al índice. También se corrió `git check-ignore -v .env.example` para
confirmar lo contrario: coincidió con la regla `!.env.example`, es decir, que
esa excepción sí permite versionarlo. Antes de cada commit se repitió
`git status` para verificar que `.env.local` no apareciera listado entre los
archivos por confirmar.

## 11. ¿Por qué Loading puede observarse con mayor claridad al consultar una API?

Con la colección local de F2 A3, `searchGifs` era una función síncrona que
filtraba un arreglo ya cargado en memoria: el resultado estaba listo en
microsegundos, así que el estado `Loading` prácticamente no llegaba a
renderizarse antes de que apareciera `Success`. Al consultar GIPHY por red, la
respuesta depende de la latencia de internet y del servidor externo, que
normalmente tarda cientos de milisegundos o más; por eso `renderStatus(
RequestStatus.Loading, status)` se ejecuta antes del `await` en
`loadTrending` y en el manejador `submit`, y el mensaje "Consultando GIPHY..."
permanece visible el tiempo suficiente para que el usuario lo perciba, algo
que antes era casi imposible de observar sin retrasos artificiales.

## 12. ¿Qué dificultad se presentó durante la integración y cómo comprobaste que quedó resuelta?

La dificultad principal fue coordinar el orden de reemplazo de los módulos
sin dejar el proyecto en un estado que no compilara: `main.ts` dependía de
`gif.service.ts` y de la colección local `src/data/gifs.ts` al mismo tiempo
que ambos archivos cambiaban de forma. Se resolvió siguiendo el orden que
indica la guía: primero se creó el servicio asíncrono y las interfaces
(Parte B), después se reescribieron los componentes y `main.ts` para que ya
no importaran `./data/gifs` (Parte C), y solo al final se eliminaron
`src/data/gifs.ts` y `src/utils/text.ts`. Se comprobó que cada etapa quedaba
funcional ejecutando `pnpm dev` antes de borrar los archivos obsoletos y
`pnpm build` después de cada bloque de cambios, confirmando en ambos casos
que TypeScript no reportaba módulos faltantes ni tipos incompatibles.
