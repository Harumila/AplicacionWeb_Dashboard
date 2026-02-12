// src/app/core/models/envioVoleta.ts

export interface EstadoEnvio {
  id: number;
  nombre: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
}

export interface SeguimientoEnvio {
  id?: number;
  venta_id: number;
  estado_id: number;
  ubicacion_actual: string;
  observaciones: string;
  fecha_cambio?: string;
  confirmado_por_cliente?: boolean;
  fecha_confirmacion?: string | null;
  estado_nombre?: string;
  estado_descripcion?: string;
}

export interface DocumentoEnvio {
  id?: number;
  venta_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_subida?: string;
}

export interface ApiResponse {
  message: string;
  ruta?: string;
}

// Tipos adicionales para mejor tipado
export type TipoDocumento = 'boleta' | 'foto_envio' | 'guia_remision' | 'comprobante_entrega';

// ✅ ACTUALIZADO: Solo 5 estados ahora
export type EstadoEnvioId = 1 | 2 | 3 | 4 | 5;

export interface EstadoEnvioInfo {
  id: EstadoEnvioId;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  progreso: number;
}

// ✅ ACTUALIZADO: Nuevos estados según tu negocio NTX
export const ESTADOS_ENVIO: Record<EstadoEnvioId, EstadoEnvioInfo> = {
  1: {
    id: 1,
    nombre: 'Pedido Realizado',
    descripcion: 'Pedido registrado en el sistema',
    color: '#6c757d',
    icono: 'fas fa-clipboard-check',
    progreso: 20
  },
  2: {
    id: 2,
    nombre: 'Pago Verificado',
    descripcion: 'El pago fue verificado correctamente',
    color: '#28a745',
    icono: 'fas fa-check-circle',
    progreso: 40
  },
  3: {
    id: 3,
    nombre: 'En Preparación',
    descripcion: 'El almacén comenzó a preparar tu pedido',
    color: '#17a2b8',
    icono: 'fas fa-box-open',
    progreso: 60
  },
  4: {
    id: 4,
    nombre: 'Empaquetado',
    descripcion: 'Tu pedido está siendo empaquetado',
    color: '#6f42c1',
    icono: 'fas fa-box',
    progreso: 80
  },
  5: {
    id: 5,
    nombre: 'Enviado a Agencia',
    descripcion: 'Pedido enviado desde oficina NTX a la agencia de transporte',
    color: '#fd7e14',
    icono: 'fas fa-shipping-fast',
    progreso: 100
  }
};

// Función helper para obtener información del estado
export function getEstadoInfo(estadoId: number): EstadoEnvioInfo | null {
  return ESTADOS_ENVIO[estadoId as EstadoEnvioId] || null;
}

// Función helper para obtener el color del estado
export function getEstadoColor(estadoId: number): string {
  const info = getEstadoInfo(estadoId);
  return info?.color || '#6c757d';
}

// Función helper para obtener el icono del estado
export function getEstadoIcono(estadoId: number): string {
  const info = getEstadoInfo(estadoId);
  return info?.icono || 'fas fa-question-circle';
}

// Tipos de documento con información adicional
export const TIPOS_DOCUMENTO: Record<TipoDocumento, { label: string; icono: string; extension: string[] }> = {
  'boleta': {
    label: 'Boleta',
    icono: 'fas fa-file-invoice',
    extension: ['.pdf']
  },
  'foto_envio': {
    label: 'Foto del Envío',
    icono: 'fas fa-camera',
    extension: ['.jpg', '.jpeg', '.png']
  },
  'guia_remision': {
    label: 'Guía de Remisión',
    icono: 'fas fa-truck',
    extension: ['.pdf']
  },
  'comprobante_entrega': {
    label: 'Comprobante de Entrega',
    icono: 'fas fa-check-circle',
    extension: ['.pdf', '.jpg', '.jpeg', '.png']
  }
};
