import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="dismiss()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <!-- ✅ Usar [innerHTML] en lugar de {{ message }} -->
      <div [innerHTML]="message" class="mb-3"></div>
      
      <div class="form-group mt-3">
        <label for="inputValue" class="form-label fw-semibold">{{ inputLabel }}</label>
        <textarea 
          id="inputValue" 
          class="form-control" 
          [(ngModel)]="inputValue" 
          [placeholder]="inputPlaceholder"
          rows="4"
          [required]="required"
        ></textarea>
        <small class="text-muted d-block mt-1">{{ inputHint }}</small>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="dismiss()">
        {{ cancelButtonText }}
      </button>
      <button 
        type="button" 
        [class]="'btn ' + confirmButtonClass" 
        (click)="confirm()"
        [disabled]="required && !inputValue.trim()"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
    
    small.text-muted {
      display: block;
      margin-top: 0.25rem;
    }

    /* Estilos para el contenido HTML renderizado */
    ::ng-deep .alert {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 0.375rem;
    }
    
    ::ng-deep .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffecb5;
      color: #997404;
    }
  `]
})
export class InputModalComponent {
  @Input() title: string = 'Ingrese Información';
  @Input() message: string = '';
  @Input() inputLabel: string = 'Detalle';
  @Input() inputPlaceholder: string = 'Escriba aquí...';
  @Input() inputHint: string = '';
  @Input() confirmButtonText: string = 'Confirmar';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() confirmButtonClass: string = 'btn-primary';
  @Input() required: boolean = true;

  inputValue: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  confirm(): void {
    if (this.required && !this.inputValue?.trim()) {
      return;
    }
    this.activeModal.close(this.inputValue.trim());
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
