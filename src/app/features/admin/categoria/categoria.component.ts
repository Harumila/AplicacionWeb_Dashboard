// src/app/features/admin/categoria/categoria.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaServices } from '../../../services/categoria.services';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];

  form: FormGroup;

  isLoading = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  // edición simple inline
  editId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaServices
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.isLoading = true;
    this.mensajeError = null;

    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.mensajeError = 'Error al cargar categorías';
      }
    });
  }

  startCreate(): void {
    this.editId = null;
    this.form.reset({ nombre: '' });
  }

  startEdit(c: Categoria): void {
    this.editId = c.id;
    this.form.patchValue({ nombre: c.nombre });
  }

  cancelEdit(): void {
    this.editId = null;
    this.form.reset({ nombre: '' });
  }

  submit(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nombre = String(this.form.value.nombre ?? '').trim();
    if (!nombre) return;

    this.isLoading = true;

    // CREATE
    if (this.editId === null) {
      this.categoriaService.create(nombre).subscribe({
        next: () => {
          this.isLoading = false;
          this.mensajeExito = 'Categoría creada';
          this.form.reset({ nombre: '' });
          this.loadCategorias();
        },
        error: (err) => {
          this.isLoading = false;
          // si el índice unique nombre falla, backend puede devolver 400/500
          this.mensajeError = err?.error?.message ?? 'Error al crear categoría';
        }
      });
      return;
    }

    // UPDATE
    this.categoriaService.update(this.editId, nombre).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensajeExito = 'Categoría actualizada';
        this.editId = null;
        this.form.reset({ nombre: '' });
        this.loadCategorias();
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err?.error?.message ?? 'Error al actualizar categoría';
      }
    });
  }

  delete(id: number): void {
    const ok = confirm('¿Eliminar categoría?');
    if (!ok) return;

    this.isLoading = true;
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensajeExito = 'Categoría eliminada';
        this.loadCategorias();
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err?.error?.message ?? 'Error al eliminar categoría';
      }
    });
  }
}
