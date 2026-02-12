// src/app/features/admin/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../../core/models/product.model';
import { ProductoServices } from '../../../../services/producto.services';
import { SHARED_MANT_IMPORTS } from '../../../../shared/shared-mant';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { CategoriaServices } from '../../../../services/categoria.services';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [...SHARED_MANT_IMPORTS],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
 categorias: Categoria[] = [];
categoriasMap = new Map<number, string>();
loadingCategorias = false;
  loadProducts = false;
  successMessage = '';
  errorMessage = '';

  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  sortField: keyof Product = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  private baseUrl = 'https://harumi-otaku-backend-net.onrender.com';

  constructor(
    private productService: ProductoServices,
    private modalService: NgbModal,
      private categoriaService: CategoriaServices,   // <-- nuevo
    private router: Router
  ) {}

ngOnInit(): void {
  this.loadCategorias();     // <-- nuevo
  this.loadProductData();    // ya estaba
}
loadCategorias(): void {
  this.loadingCategorias = true;

  this.categoriaService.getAll().subscribe({
    next: (data) => {
      this.categorias = data ?? [];
      this.categoriasMap = new Map(this.categorias.map(c => [c.id, c.nombre]));
      this.loadingCategorias = false;

      // Si ya cargaste productos, refresca búsqueda/orden
      this.applySearch();
    },
    error: () => {
      this.loadingCategorias = false;
      // opcional: no bloquees la vista, solo no tendrás nombres
      console.warn('No se pudieron cargar categorías');
    }
  });
}

categoriaNombre(categoriaId: number | null | undefined): string {
  if (!categoriaId) return 'Sin categoría';
  return this.categoriasMap.get(categoriaId) ?? `ID ${categoriaId}`;
}
  loadProductData(): void {
    this.loadProducts = true;
    this.errorMessage = '';

    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = (data ?? []).map((p: Product) => ({ ...p, activo: !!p.activo }));
        this.filteredProducts = [...this.products];
        this.applySearch();
        this.loadProducts = false;
      },
      error: () => {
        this.errorMessage = 'Error al conectar con el servidor';
        this.loadProducts = false;
      },
    });
  }

  reloadProducts(): void {
    this.loadProductData();
  }

  applySearch(): void {
    const q = this.searchTerm.trim().toLowerCase();

    if (!q) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        (p.nombre ?? '').toLowerCase().includes(q) ||
        (p.descripcion ?? '').toLowerCase().includes(q) ||
        (p.categoria ?? '').toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }

    this.currentPage = 1;
    this.sortProducts();
    this.updatePagination();
  }

  onSort(field: keyof Product): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortProducts();
    this.updatePagination();
  }

  sortProducts(): void {
    const field = this.sortField;
    const dir = this.sortDirection;

    this.filteredProducts.sort((a: any, b: any) => {
      const va = a?.[field];
      const vb = b?.[field];

      if (typeof va === 'string' && typeof vb === 'string') {
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return dir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
      }
      return 0;
    });
  }

  getSortIcon(field: keyof Product): string {
    if (this.sortField !== field) return 'fas fa-sort text-muted';
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    this.updatePaginatedProducts();
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getStartIndex(): number {
    return this.filteredProducts.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
  }

getImageUrl(fotoUrl: string | null | undefined): string {
    if (!fotoUrl || fotoUrl.trim() === '') return 'assets/images/no-image.png';
    if (fotoUrl.startsWith('http')) return fotoUrl;

    // Si fotoUrl es "/uploads/productos/imagen.png" 
    // y baseUrl es "https://tu-api.onrender.com"
    // Eliminamos la barra inicial de fotoUrl para evitar "https://api.com//uploads..."
    const cleanPath = fotoUrl.startsWith('/') ? fotoUrl.substring(1) : fotoUrl;
    
    return `${this.baseUrl}/${cleanPath}`;
}

  editProduct(id: number): void {
    this.router.navigate(['/admin/mantenimiento/products/edit', id]);
  }

  openDeleteModal(product: Product): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Confirmar Eliminación';
    modalRef.componentInstance.message = `¿Eliminar el producto <strong>${product.nombre}</strong>?`;
    modalRef.componentInstance.additionalMessage = 'Esta acción no se puede deshacer.';

    modalRef.result.then((result: any) => {
      if (result === 'confirm') this.deleteProduct(product.id);
    }).catch(() => {});
  }

  private deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== productId);
        this.applySearch();
        this.successMessage = 'Producto eliminado correctamente';
        setTimeout(() => (this.successMessage = ''), 2500);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar producto';
        setTimeout(() => (this.errorMessage = ''), 2500);
      },
    });
  }

  async toggleProductStatus(product: Product): Promise<void> {
    const activoActual = !!product.activo;

    // Activar directo
    if (!activoActual) {
      const nuevoEstado = true;
      this.productService.setActivo(product.id, nuevoEstado).subscribe({
        next: () => {
          this.products = this.products.map(p => p.id === product.id ? { ...p, activo: nuevoEstado } : p);
          this.applySearch();
        },
      });
      return;
    }

    // Desactivar con confirmación
    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Confirmar';
    modalRef.componentInstance.message = '¿Seguro que deseas desactivar el producto?';
    modalRef.componentInstance.confirmText = 'Desactivar';
    modalRef.componentInstance.cancelText = 'Cancelar';

    try {
      const result = await modalRef.result;
      if (result !== 'confirm') return;
    } catch {
      return;
    }

    const nuevoEstado = false;
    this.productService.setActivo(product.id, nuevoEstado).subscribe({
      next: () => {
        this.products = this.products.map(p => p.id === product.id ? { ...p, activo: nuevoEstado } : p);
        this.applySearch();
      },
    });
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
