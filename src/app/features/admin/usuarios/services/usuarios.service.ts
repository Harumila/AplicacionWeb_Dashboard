import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz basada en tu UserResponseDto de .NET
export interface AdminAccount {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  // Ajusta el puerto (5295) según lo que veas en tu laptop MSI
  private apiUrl = 'https://harumi-otaku-backend-net.onrender.com';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminAccount[]> {
    // Consumimos el nuevo endpoint "list" que creamos en el controlador
    return this.http.get<AdminAccount[]>(`${this.apiUrl}/list`);
  }

  // Otros métodos que podrías necesitar para el CRUD
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
