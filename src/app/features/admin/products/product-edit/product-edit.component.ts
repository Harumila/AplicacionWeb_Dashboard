// src/app/features/admin/products/product-edit/product-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoServices } from '../../../../services/producto.services';
import { Product } from '../../../../core/models/product.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { CategoriaServices } from '../../../../services/categoria.services';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css'],
  animations: [
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class ProductEditComponent implements OnInit {
  productoId!: number;

  productoForm: FormGroup;
  categorias: Categoria[] = [];
  loadingCategorias = false;
  isLoading = false;
  isLoadingData = false;

  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  fotoFile: File | null = null;
  fotoPreview: string | null = null;      // preview de nueva foto
  fotoActualUrl: string | null = null;    // url actual (desde backend)

  private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoServices,
    private route: ActivatedRoute,
    
    private categoriaService: CategoriaServices,   // <-- nuevo
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.mensajeError = 'ID inválido';
      return;
    }
 this.productoId = id;

    this.loadCategorias();  // <-- nuevo
    this.cargarProducto();  // ya lo tenías
  }
 loadCategorias(): void {
    this.loadingCategorias = true;

    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data ?? [];
        this.loadingCategorias = false;

        // opcional: si producto ya cargó antes, forzamos refresh del control
        // this.productoForm.get('categoriaId')?.updateValueAndValidity();
      },
      error: () => {
        this.loadingCategorias = false;
        this.mensajeError = 'No se pudieron cargar las categorías';
      }
    });
  }
  cargarProducto(): void {
    this.isLoadingData = true;
    this.mensajeError = null;

    this.productoService.getProductoPorId(this.productoId).subscribe({
      next: (p: Product) => {
        this.productoForm.patchValue({
          categoriaId: p.categoriaId,
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precio: p.precio,
          activo: !!p.activo,
        });

        this.fotoActualUrl = this.getImageUrl(p.fotoUrl);
        this.isLoadingData = false;
      },
      error: () => {
        this.isLoadingData = false;
        this.mensajeError = 'No se pudo cargar el producto';
      },
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

    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.mensajeError = 'Completa los campos requeridos.';
      return;
    }

    this.isLoading = true;

    const v = this.productoForm.value;

    // IMPORTANTE: nombres como Swagger: CategoriaId, Nombre, Descripcion, Precio, Activo, Foto
    const fd = new FormData();
    fd.append('CategoriaId', String(v.categoriaId));
    fd.append('Nombre', String(v.nombre));
    fd.append('Descripcion', String(v.descripcion ?? ''));
    fd.append('Precio', String(v.precio));
    fd.append('Activo', String(v.activo));

    // Foto es opcional en edit: solo enviar si el user selecciona una nueva
    if (this.fotoFile) {
      fd.append('Foto', this.fotoFile);
    }

    this.productoService.updateProduct(this.productoId, fd).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensajeExito = 'Producto actualizado correctamente';
        setTimeout(() => this.router.navigate(['/admin/mantenimiento/producto']), 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err?.error?.message ?? 'Error al actualizar producto';
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/mantenimiento/producto']);
  }

  getImageUrl(fotoUrl: string | null | undefined): string | null {
    if (!fotoUrl || fotoUrl.trim() === '') return null;
    if (fotoUrl.startsWith('http')) return fotoUrl;

    const cleaned = fotoUrl.replace(/^wwwroot[\\/]+/, '').replace(/\\/g, '/');
    return `${this.baseUrl}/${cleaned.startsWith('/') ? cleaned.substring(1) : cleaned}`;
  }
}
