// src/app/services/admin.services.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminServices {
   //private baseUrl = 'http://localhost:5295';
     private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';
  constructor(private http: HttpClient) {}

  cambiarEstadoOrden(ordenId: number, adminUsuarioId: number, estadoCodigo: string, comentario?: string): Observable<any> {
    const params = new HttpParams().set('adminUsuarioId', String(adminUsuarioId));
    return this.http.patch(`${this.baseUrl}/api/admin/ordenes/${ordenId}/estado`, { estadoCodigo, comentario }, { params });
  }

  validarPago(pagoId: number, adminUsuarioId: number, resultado: 'CONFIRMADO'|'RECHAZADO', nota?: string): Observable<any> {
    const params = new HttpParams().set('adminUsuarioId', String(adminUsuarioId));
    return this.http.post(`${this.baseUrl}/api/admin/pagos/${pagoId}/validar`, { resultado, nota }, { params });
  }
}
