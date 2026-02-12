  // pedidos.component.ts
  import { CommonModule } from '@angular/common';
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { RouterModule } from '@angular/router';

  import { OrdenDetalle, OrdenEstadoHistorialItem, OrdenListItem } from '../../../core/models/orden.model';
  import { OrdenesService } from '../../../services/ordenes.service';
  import { AdminServices } from '../../../services/admin.service';

  @Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './pedidos.component.html',
    styleUrls: ['./pedidos.component.css'],
  })
  export class PedidosComponent implements OnInit {
    ordenes: OrdenListItem[] = [];
    selectedOrden: OrdenDetalle | null = null;
    historial: OrdenEstadoHistorialItem[] = [];
    selectedUsuarioId: number | null = null;

    isLoading = false;
    isLoadingDetalle = false;
    isLoadingHistorial = false;

    mensajeExito: string | null = null;
    mensajeError: string | null = null;

    adminUsuarioId = 2;
    formEstado: FormGroup;

    constructor(
      private ordenesService: OrdenesService,
      private adminService: AdminServices,
      private fb: FormBuilder
    ) {
      this.formEstado = this.fb.group({
        estadoCodigo: ['', [Validators.required]],
        comentario: [''],
      });
    }

    ngOnInit(): void {
      this.loadOrdenes();
    }

    loadOrdenes(): void {
      this.isLoading = true;
      this.mensajeError = null;

      this.ordenesService.listar().subscribe({
        next: (data) => {
          this.ordenes = data ?? [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al listar órdenes:', err);
          this.isLoading = false;
          this.mensajeError = err?.error?.message ?? 'Error al cargar órdenes';
        }
      });
    }

    verDetalle(o: OrdenListItem): void {
      this.isLoadingDetalle = true;
      this.selectedOrden = null;
      this.historial = [];
      this.mensajeError = null;
      this.selectedUsuarioId = o.usuarioId;

      this.ordenesService.detalle(o.usuarioId, o.id).subscribe({
        next: (det) => {
          this.selectedOrden = det;
          this.isLoadingDetalle = false;
          this.formEstado.reset({ estadoCodigo: '', comentario: '' });
          this.verHistorial(o.usuarioId, o.id);
        },
        error: (err) => {
          console.error('Error al cargar detalle:', err);
          this.isLoadingDetalle = false;
          this.mensajeError = err?.error?.message ?? 'No se pudo cargar el detalle de la orden';
        }
      });
    }

    verHistorial(usuarioId: number, ordenId: number): void {
      this.isLoadingHistorial = true;

      this.ordenesService.historial(usuarioId, ordenId).subscribe({
        next: (h) => {
          this.historial = h ?? [];
          this.isLoadingHistorial = false;
        },
        error: (err) => {
          console.error('Error al cargar historial:', err);
          this.isLoadingHistorial = false;
          this.mensajeError = err?.error?.message ?? 'No se pudo cargar el historial';
        }
      });
    }

    validarPago(pagoId: number, resultado: 'CONFIRMADO' | 'RECHAZADO'): void {
      this.mensajeError = null;
      this.mensajeExito = null;

      const nota = resultado === 'RECHAZADO' 
        ? prompt('Motivo del rechazo (opcional):') || undefined 
        : undefined;

      this.adminService.validarPago(pagoId, this.adminUsuarioId, resultado, nota).subscribe({
        next: () => {
          this.mensajeExito = `Pago ${resultado.toLowerCase()} correctamente`;
          this.loadOrdenes();
          
          if (this.selectedOrden && this.selectedUsuarioId) {
            this.verDetalle({ 
              id: this.selectedOrden.id, 
              usuarioId: this.selectedUsuarioId 
            } as OrdenListItem);
          }
        },
        error: (err) => {
          console.error('Error al validar pago:', err);
          this.mensajeError = err?.error?.message ?? 'Error al validar pago';
        }
      });
    }

    get pagosEnRevision() {
      return this.ordenes.filter(o => o.pagoEstado === 'EN_REVISION');
    }

    get puedeEditarEstado(): boolean {
      if (!this.selectedOrden) return false;
      return this.selectedOrden.pagoEstado !== 'RECHAZADO';
    }

    cambiarEstado(): void {
      if (!this.selectedOrden || this.selectedUsuarioId == null) return;

      if (!this.puedeEditarEstado) {
        this.mensajeError = 'No se puede cambiar el estado de una orden con pago rechazado';
        return;
      }

      this.mensajeError = null;
      this.mensajeExito = null;

      if (this.formEstado.invalid) {
        this.formEstado.markAllAsTouched();
        return;
      }

      const { estadoCodigo, comentario } = this.formEstado.value;

      this.adminService
        .cambiarEstadoOrden(this.selectedOrden.id, this.adminUsuarioId, estadoCodigo, comentario)
        .subscribe({
          next: () => {
            this.mensajeExito = 'Estado actualizado correctamente';

            const ordenId = this.selectedOrden!.id;
            const usuarioId = this.selectedUsuarioId!;

            this.loadOrdenes();

            this.isLoadingDetalle = true;
            this.ordenesService.detalle(usuarioId, ordenId).subscribe({
              next: (det) => {
                this.selectedOrden = det;
                this.isLoadingDetalle = false;
                this.verHistorial(usuarioId, ordenId);
              },
              error: (err) => {
                console.error('Error al refrescar detalle:', err);
                this.isLoadingDetalle = false;
                this.mensajeError = err?.error?.message ?? 'No se pudo refrescar el detalle';
              },
            });
          },
          error: (err) => {
            console.error('Error al cambiar estado:', err);
            this.mensajeError = err?.error?.message ?? 'Error al cambiar estado';
          },
        });
    }
  }
