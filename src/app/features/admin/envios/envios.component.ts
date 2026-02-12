import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnvioVoletaService } from '../../../services/envioVoleta.services';
import { 
  EstadoEnvio, 
  SeguimientoEnvio, 
  DocumentoEnvio,
  ESTADOS_ENVIO,
  getEstadoInfo,
  getEstadoColor,
  getEstadoIcono
} from '../../../core/models/envioVoleta';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './envios.component.html',
  styleUrl: './envios.component.css'
})
export class Envioscomponent implements OnInit {
  // Formularios
  busquedaForm!: FormGroup;
  seguimientoForm!: FormGroup;
  documentoForm!: FormGroup;

  // Datos
  estados: EstadoEnvio[] = [];
  estadosDisponibles: EstadoEnvio[] = []; // ✅ NUEVO: Estados filtrados
  seguimientos: SeguimientoEnvio[] = [];
  documentos: DocumentoEnvio[] = [];
  
  // Estado de la interfaz
  ventaSeleccionada: number | null = null;
  archivoSeleccionado: File | null = null;
  
  // Flags de carga
  cargando = false;
  enviandoSeguimiento = false;
  subiendoDocumento = false;
  confirmandoEntrega = false;
  
  // Mensajes
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'warning' = 'success';

  ESTADOS_ENVIO = ESTADOS_ENVIO;
 
  constructor(
    private fb: FormBuilder,
    private envioService: EnvioVoletaService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.cargarEstados();
  }

  private initForms(): void {
    this.busquedaForm = this.fb.group({
      ventaId: ['', [Validators.required, Validators.min(1)]]
    });

    this.seguimientoForm = this.fb.group({
      estado_id: ['', Validators.required],
      ubicacion_actual: ['Oficina NTX', Validators.required],
      observaciones: ['']
    });

    this.documentoForm = this.fb.group({
      tipo_documento: ['', Validators.required]
    });
  }

  private cargarEstados(): void {
    this.envioService.getEstados().subscribe({
      next: (estados) => {
        this.estados = estados;
        this.filtrarEstadosDisponibles(); // ✅ Filtrar al cargar
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.mostrarMensaje('Error al cargar los estados', 'error');
      }
    });
  }

  // ✅ NUEVO: Filtrar estados que ya fueron usados
  private filtrarEstadosDisponibles(): void {
    if (this.seguimientos.length === 0) {
      this.estadosDisponibles = [...this.estados];
      return;
    }

    // Obtener IDs de estados ya usados
    const estadosUsados = this.seguimientos.map(s => s.estado_id);
    
    // Filtrar solo estados no usados
    this.estadosDisponibles = this.estados.filter(
      estado => !estadosUsados.includes(estado.id)
    );

    // Si no hay estados disponibles
    if (this.estadosDisponibles.length === 0) {
      this.mostrarMensaje('Todos los estados ya han sido registrados para este envío', 'warning');
    }
  }

buscarEnvio(): void {
  if (this.busquedaForm.invalid) return;

  const ventaId = +this.busquedaForm.value.ventaId;
  this.cargando = true;

  // Reset UI primero
  this.ventaSeleccionada = null;
  this.seguimientos = [];
  this.documentos = [];
  this.filtrarEstadosDisponibles();

  Promise.allSettled([
    this.cargarSeguimientos(ventaId),
    this.cargarDocumentos(ventaId)
  ]).then((results) => {
    const okSeguimiento = results[0].status === 'fulfilled';
    const okDocs = results[1].status === 'fulfilled';

    // ✅ Solo “existe” si al menos una petición respondió OK
   if (okSeguimiento || okDocs) {
  this.ventaSeleccionada = ventaId;

  if (this.seguimientos.length === 0 && this.documentos.length === 0) {
    this.mostrarMensaje(`Venta #${ventaId} sin registros de envío`, 'warning');
  } else {
    this.mostrarMensaje(`Venta #${ventaId} cargada`, 'success');
  }
} else {
  this.ventaSeleccionada = null;
  this.mostrarMensaje(`esa venta aun no existe , Error 404`, 'error');
}

  }).finally(() => {
    this.cargando = false;
  });
}


  private cargarSeguimientos(ventaId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    this.envioService.getSeguimiento(ventaId).subscribe({
      next: (seguimientos) => {
  this.seguimientos = (seguimientos ?? []).sort((a, b) =>
    new Date(a.fecha_cambio || '').getTime() - new Date(b.fecha_cambio || '').getTime()
  );
  this.filtrarEstadosDisponibles();
  resolve(); // ✅ aunque venga []
},
error: (error) => {
  this.seguimientos = [];
  this.filtrarEstadosDisponibles();

  if (error.status === 404) {
    this.ventaSeleccionada = null;
    this.mostrarMensaje(`❌ No existe la venta #${ventaId}`, 'error');
    reject(error);
    return;
  }

  this.mostrarMensaje((error as any).friendlyMessage ?? 'Error al cargar el seguimiento', 'error');
  reject(error);



      }
    });
  });
}


  private cargarDocumentos(ventaId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    this.envioService.getDocumentos(ventaId).subscribe({
      next: (documentos) => {
        this.documentos = (documentos ?? []).sort((a, b) =>
          new Date(b.fecha_subida || '').getTime() - new Date(a.fecha_subida || '').getTime()
        );
        resolve(); // ✅ aunque venga []
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.documentos = [];
        this.filtrarEstadosDisponibles();

        if (error.status === 404) {
  reject(error); // ✅ 404 = no existe
  return;
}


        this.mostrarMensaje((error as any).friendlyMessage ?? 'Error al cargar los documentos', 'error');
        reject(error);
      }
    });
  });
}

  agregarSeguimiento(): void {
    if (this.seguimientoForm.invalid || !this.ventaSeleccionada) return;
    
    const estadoSeleccionado = +this.seguimientoForm.value.estado_id;

    // ✅ VALIDACIÓN: Verificar si el estado ya fue usado
    const estadoYaUsado = this.seguimientos.some(s => s.estado_id === estadoSeleccionado);
    
    if (estadoYaUsado) {
      const nombreEstado = this.estados.find(e => e.id === estadoSeleccionado)?.nombre || 'este estado';
      this.mostrarMensaje(
        `❌ El estado "${nombreEstado}" ya fue registrado para este envío. No se puede repetir.`,
        'error'
      );
      return;
    }

    // ✅ VALIDACIÓN: Verificar orden lógico de estados
    const ultimoEstado = this.seguimientos.length > 0 
      ? this.seguimientos[this.seguimientos.length - 1].estado_id 
      : 0;

    if (estadoSeleccionado <= ultimoEstado && this.seguimientos.length > 0) {
      this.mostrarMensaje(
        `⚠️ El nuevo estado debe ser posterior al estado actual. No puedes retroceder en el proceso.`,
        'warning'
      );
      return;
    }
    
    this.enviandoSeguimiento = true;
    
    const nuevoSeguimiento: Partial<SeguimientoEnvio> = {
      venta_id: this.ventaSeleccionada,
      ...this.seguimientoForm.value
    };

    this.envioService.addSeguimiento(nuevoSeguimiento).subscribe({
      next: (response) => {
        const nombreEstado = this.estados.find(e => e.id === estadoSeleccionado)?.nombre || 'Estado';
        this.mostrarMensaje(
          `✅ Estado actualizado a "${nombreEstado}" y notificación enviada al cliente`,
          'success'
        );
        this.seguimientoForm.patchValue({
          estado_id: '',
          ubicacion_actual: 'Oficina NTX',
          observaciones: ''
        });
        this.cargarSeguimientos(this.ventaSeleccionada!);
      },
      error: (error) => {
        console.error('Error al agregar seguimiento:', error);
        this.mostrarMensaje('Error al agregar el seguimiento', 'error');
      },
      complete: () => {
        this.enviandoSeguimiento = false;
      }
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (this.archivoSeleccionado.size > maxSize) {
        this.mostrarMensaje('El archivo es muy grande. Máximo 5MB', 'error');
        this.archivoSeleccionado = null;
        input.value = '';
      }
    }
  }

  subirDocumento(): void {
    if (this.documentoForm.invalid || !this.archivoSeleccionado || !this.ventaSeleccionada) return;
    
    this.subiendoDocumento = true;
    
    const tipoDocumento = this.documentoForm.value.tipo_documento;
    
    this.envioService.uploadDocumento(
      this.ventaSeleccionada, 
      tipoDocumento, 
      this.archivoSeleccionado
    ).subscribe({
      next: (response) => {
        this.mostrarMensaje('Documento subido correctamente', 'success');
        this.documentoForm.reset();
        this.archivoSeleccionado = null;
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        const collapse = document.getElementById('subirDocumento');
        if (collapse) {
          const bsCollapse = new (window as any).bootstrap.Collapse(collapse);
          bsCollapse.hide();
        }
        
        this.cargarDocumentos(this.ventaSeleccionada!);
      },
      error: (error) => {
        console.error('Error al subir documento:', error);
        this.mostrarMensaje('Error al subir el documento', 'error');
      },
      complete: () => {
        this.subiendoDocumento = false;
      }
    });
  }

  puedeConfirmarEntrega(): boolean {
    return false;
  }

  confirmarEntregaEnvio(): void {
    // Método deshabilitado
  }

  descargarDocumento(documento: DocumentoEnvio): void {
    const url = `https://pusher-backend-elvis.onrender.com${documento.ruta_archivo}`;
    window.open(url, '_blank');
  }

  getTipoDocumentoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'boleta': 'Boleta',
      'foto_envio': 'Foto del Envío',
      'guia_remision': 'Guía de Remisión',
      'comprobante_entrega': 'Comprobante de Entrega'
    };
    
    return tipos[tipo] || tipo;
  }

  getEstadoColor(estadoId: number): string {
    return getEstadoColor(estadoId);
  }

  getEstadoIcono(estadoId: number): string {
    return getEstadoIcono(estadoId);
  }

  getProgresoEstado(estadoId: number): number {
    const info = getEstadoInfo(estadoId);
    return info?.progreso || 0;
  }

  // ✅ NUEVO: Verificar si ya se completó el proceso
  procesoCompletado(): boolean {
    return this.seguimientos.some(s => s.estado_id === 5); // Estado 5 = Enviado a Agencia
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'warning'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.cerrarMensaje();
    }, 5000);
  }

  cerrarMensaje(): void {
    this.mensaje = '';
  }
}
