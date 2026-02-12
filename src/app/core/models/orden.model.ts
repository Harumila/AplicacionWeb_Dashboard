// src/app/core/models/orden.model.ts
export interface OrdenListItem {
  id: number;
  usuarioId: number;
  pickupAt: string;
  totalAmount: number;
  estadoActualId: number;
  estadoCodigo: string | null;
  estadoNombre: string | null;
  createdAt: string;
  itemsCount: number;
  itemsCantidadTotal: number;
  itemsSubtotalTotal: number;
  items: any[];
  pagoId: number | null;
  pagoEstado: string | null;
  voucherImagenUrl: string | null;
  nroOperacion: string | null;
  paidAt: string | null;
}

export interface OrdenDetalle {
  id: number;
  usuarioId: number;
  pickupAt: string;
  totalAmount: number;
  estadoActualId: number;
  estadoCodigo: string;
  estadoNombre: string;
  createdAt: string;
  pagoId: number | null;
  pagoEstado: string | null;
  voucherImagenUrl: string | null;
  nroOperacion: string | null;
  paidAt: string | null;
  items: Array<{
    id: number;
    productoId: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

export interface OrdenEstadoHistorialItem {
  id: number;
  ordenId: number;
  estadoId: number;
  estadoCodigo: string;
  estadoNombre: string;
  cambiadoPorUsuarioId: number;
  comentario: string;
  fechaCambio: string;
}
