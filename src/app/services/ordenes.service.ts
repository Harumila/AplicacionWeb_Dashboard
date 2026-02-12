// src/app/services/ordenes.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdenDetalle, OrdenEstadoHistorialItem, OrdenListItem } from '../core/models/orden.model';

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  
  //   localhost:5295      private baseUrl = 'http://localhost:5295';
   private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';
  constructor(private http: HttpClient) {}

  listar(usuarioId?: number): Observable<OrdenListItem[]> {
    // HttpParams es inmutable: set() devuelve una nueva instancia, por eso lo creamos directo. [web:42][web:41]
    const options: { params?: HttpParams } = {};

    if (usuarioId != null) {
      options.params = new HttpParams().set('usuarioId', String(usuarioId));
    }

    // IMPORTANTE: no pongas observe:'events' aquí
    return this.http.get<OrdenListItem[]>(`${this.baseUrl}/api/ordenes`, options);
  }

  detalle(usuarioId: number, id: number): Observable<OrdenDetalle> {
    const params = new HttpParams().set('usuarioId', String(usuarioId));
    return this.http.get<OrdenDetalle>(`${this.baseUrl}/api/ordenes/${id}`, { params });
  }

  historial(usuarioId: number, id: number): Observable<OrdenEstadoHistorialItem[]> {
    const params = new HttpParams().set('usuarioId', String(usuarioId));
    return this.http.get<OrdenEstadoHistorialItem[]>(
      `${this.baseUrl}/api/ordenes/${id}/historial-estados`,
      { params }
    );
  }
}
