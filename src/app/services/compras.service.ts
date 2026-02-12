// src/app/services/compras.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface VentaDetalle {
  productoId: number;
  cantidad: number;
  nombreProducto: string;
  precio: number;
}

export interface Venta {
  id: number;
  userId: number;
  usuarioEmail: string;
  usuarioNombre: string;
  metodoPagoId: number;
  metodoPagoNombre: string;
  total: number;
  fechaVenta: string;
  initPoint: string | null;
  estadoVoucher: string | null;
  voucherArchivo: string | null;
  detalles: VentaDetalle[];
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private baseUrl = 'https://pusher-backend-elvis.onrender.com';

  constructor(private http: HttpClient) {}

  getVentas(): Observable<Venta[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<Venta[]>(`${this.baseUrl}/api/Ventas`, { headers });
  }

  // Opcional: “mis compras” filtrado en frontend (solo para UI; seguridad real debe ser backend)
  getMisComprasFrontend(userId: number): Observable<Venta[]> {
    return this.getVentas().pipe(map(arr => (arr ?? []).filter(v => v.userId === userId)));
  }
}
