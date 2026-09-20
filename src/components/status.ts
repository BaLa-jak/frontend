import { RequestStatus } from "../models/request-status.enum";

export function renderStatus(
  currentStatus: RequestStatus,
  container: HTMLElement,
  amount = 0,
): void {
  container.className = `status status--${currentStatus}`;

  const initialLabel = amount === 1
    ? "1 GIF disponible."
    : `${amount} GIF disponibles.`;

  const resultLabel = amount === 1
    ? "1 resultado encontrado."
    : `${amount} resultados encontrados.`;

  switch (currentStatus) {
    case RequestStatus.Initial:
      container.textContent = `${initialLabel} Preparando la consulta.`;
      break;

    case RequestStatus.Loading:
      container.textContent = "Consultando GIPHY...";
      break;

    case RequestStatus.Success:
      container.textContent = resultLabel;
      break;

    case RequestStatus.Empty:
      container.textContent = "No se encontraron GIF. Prueba otra búsqueda.";
      break;

    case RequestStatus.Error:
      container.textContent = "No fue posible consultar GIPHY.";
      break;
  }
}
