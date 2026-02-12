// Lo que devuelve /api/productos
export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

// Lo que devuelve /api/ordenes
export interface Orden {
  id: number;
  usuarioId: number;
  totalAmount: number;
  estadoActualId: number;
  estadoNombre: string;
  createdAt: string;
  pagoEstado: string; // "EN_REVISION", "CONFIRMADO", etc.
  items: any[]; // Si el backend los incluyera en el futuro
}

// La estructura final para tus gráficos
export interface DashboardData {
  pedidosNuevos: number;
  ingresosTotales: number;
  pagosRevision: number;
  ventasPorDia: { label: string; value: number }[];
  topProductos: { nombre: string; cantidad: number }[];
  totalUsuarios: number;
}