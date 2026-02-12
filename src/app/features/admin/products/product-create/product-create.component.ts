import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoServices } from '../../../../services/producto.services';
import { CategoriaServices } from '../../../../services/categoria.services';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css'],
})
export class ProductCreateComponent implements OnInit {
  productoForm: FormGroup;

  categorias: Categoria[] = [];
  loadingCategorias = false;

  isLoading = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  fotoFile: File | null = null;
  fotoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoServices,
    private categoriaService: CategoriaServices,
    private router: Router
  ) {
    // Definición de validaciones estrictas
    this.productoForm = this.fb.group({
      categoriaId: [null, [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(2)]],
      descripcion: ['', [Validators.maxLength(1000)]],
      // No vacío, mínimo 0.01 y máximo 5000
      precio: [null, [Validators.required, Validators.min(0.01), Validators.max(5000)]],
      activo: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loadingCategorias = true;
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data ?? [];
        this.loadingCategorias = false;
      },
      error: () => {
        this.loadingCategorias = false;
        this.mensajeError = 'No se pudieron cargar las categorías';
      }
    });
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.fotoFile = file;
    if (!file) {
      this.fotoPreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => (this.fotoPreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    // Marcamos todos como tocados para activar las alertas visuales en el HTML
    this.productoForm.markAllAsTouched();

    // Validar si el formulario es inválido o tiene campos vacíos
    if (this.productoForm.invalid) {
      this.mensajeError = 'Por favor, completa correctamente los campos obligatorios.';
      return;
    }

    // Validar que la foto no sea nula (campo independiente del formGroup)
    if (!this.fotoFile) {
      this.mensajeError = 'Debes seleccionar una foto para el producto.';
      return;
    }

    this.isLoading = true;
    const v = this.productoForm.value;

    const fd = new FormData();
    fd.append('CategoriaId', String(v.categoriaId));
    // .trim() evita que envíen solo espacios en blanco
    fd.append('Nombre', String(v.nombre).trim());
    fd.append('Descripcion', String(v.descripcion ?? '').trim());
    fd.append('Precio', String(v.precio));
    fd.append('Activo', String(v.activo));
    fd.append('Foto', this.fotoFile);

    this.productoService.createProduct(fd).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensajeExito = 'Producto creado correctamente';
        // Redirección corta para que el usuario vea el mensaje de éxito
        setTimeout(() => this.router.navigate(['/admin/mantenimiento/producto']), 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err?.error?.message ?? 'Error al conectar con el servidor';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/mantenimiento/producto']);
  }
}
