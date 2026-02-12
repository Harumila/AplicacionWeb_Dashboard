import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuariosService, AdminAccount } from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {
  admins: AdminAccount[] = [];
  loading = true;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarAdmins();
  }

  cargarAdmins(): void {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al conectar con la API:', err);
        this.loading = false;
      }
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar esta cuenta definitivamente?')) {
      this.usuariosService.delete(id).subscribe({
        next: () => {
          alert('Usuario eliminado.');
          this.cargarAdmins();
        },
        error: () => alert('Error al eliminar.')
      });
    }
  }
}