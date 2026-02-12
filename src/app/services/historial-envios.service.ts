// src/app/services/historial-envios.service.ts
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EnvioVoletaService } from './envioVoleta.services';
import { SeguimientoEnvio } from '../core/models/envioVoleta';

export interface HistorialEnvioItem {
  venta_id: number;
  ultimo_estado_id: number;
  ultimo_estado_nombre?: string;
  ultima_fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class HistorialEnviosService {
  constructor(private envioService: EnvioVoletaService) {}

  getMiHistorialEnvios(): Observable<HistorialEnvioItem[]> {
    return this.envioService.getMisSeguimientos().pipe(
      map((rows: SeguimientoEnvio[]) => {
        const mapVenta = new Map<number, SeguimientoEnvio>();

        for (const r of rows) {
          const prev = mapVenta.get(r.venta_id);
          const prevTime = prev?.fecha_cambio ? new Date(prev.fecha_cambio).getTime() : 0;
          const curTime = r.fecha_cambio ? new Date(r.fecha_cambio).getTime() : 0;

          if (!prev || curTime >= prevTime) mapVenta.set(r.venta_id, r);
        }

        return Array.from(mapVenta.values()).map((r) => ({
          venta_id: r.venta_id,
          ultimo_estado_id: r.estado_id,
          ultimo_estado_nombre: (r as any).estado_nombre, // si tu API lo manda
          ultima_fecha: r.fecha_cambio ?? undefined,
        }));
      })
    );
  }
}
