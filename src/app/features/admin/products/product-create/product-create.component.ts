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
    this.productoForm = this.fb.group({
      categoriaId: [null, [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.maxLength(1000)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
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

        // opcional: si quieres auto-seleccionar la primera
        // if (!this.productoForm.value.categoriaId && this.categorias.length > 0) {
        //   this.productoForm.patchValue({ categoriaId: this.categorias[0].id });
        // }
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
    if (!file) { this.fotoPreview = null; return; }

    const reader = new FileReader();
    reader.onload = () => (this.fotoPreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.mensajeError = 'Completa los campos requeridos.';
      return;
    }
    if (!this.fotoFile) {
      this.mensajeError = 'Selecciona una foto del producto.';
      return;
    }

    this.isLoading = true;
    const v = this.productoForm.value;

    const fd = new FormData();
    fd.append('CategoriaId', String(v.categoriaId));
    fd.append('Nombre', String(v.nombre));
    fd.append('Descripcion', String(v.descripcion ?? ''));
    fd.append('Precio', String(v.precio));
    fd.append('Activo', String(v.activo));
    fd.append('Foto', this.fotoFile);

    this.productoService.createProduct(fd).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensajeExito = 'Producto creado correctamente';
        setTimeout(() => this.router.navigate(['/admin/mantenimiento/producto']), 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err?.error?.message ?? 'Error al crear producto';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/mantenimiento/producto']);
  }
}
