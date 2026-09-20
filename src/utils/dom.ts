export function getRequiredElement<T extends Element>(
  selector: string,
): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`No se encontró el elemento ${selector}.`);
  }

  return element;
}
