// src/app/services/categoria.services.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../core/models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaServices {
  private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';
  private apiUrl = `${this.baseUrl}/api/categorias`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(nombre: string): Observable<any> {
    return this.http.post(this.apiUrl, { nombre });
  }

  update(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { nombre });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
