// src/app/core/models/product.model.ts
export interface Product {
  id: number;
  categoriaId: number;        // categoria_id
  categoria?: string | null;  // si tu API lo retorna (nombre categoría)
  nombre: string;
  descripcion?: string | null;
  fotoUrl?: string | null;    // foto_url: "/uploads/productos/xxx.jpg"
  precio: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
