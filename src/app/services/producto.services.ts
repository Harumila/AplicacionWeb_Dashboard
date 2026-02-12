// src/app/services/producto.services.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductoServices {
  private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';
  private apiUrl = `${this.baseUrl}/api/productos`;

  constructor(private http: HttpClient) {}

   getProductoPorId(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  setActivo(id: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activo`, { activo });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

getAllProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(this.apiUrl);
}

  // POST /api/productos (multipart/form-data)
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
