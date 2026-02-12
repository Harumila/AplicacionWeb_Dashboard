import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { DashboardData, Orden, Producto } from '../core/models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'https://harumi-otaku-backend-net.onrender.com/api'; 

  constructor(private http: HttpClient) {}

 // En dashboard.service.ts

// dashboard.service.ts

getDashboardData(): Observable<DashboardData> {
  return forkJoin({
    ordenes: this.http.get<Orden[]>(`${this.apiUrl}/ordenes`),
    productos: this.http.get<Producto[]>(`${this.apiUrl}/productos`)
  }).pipe(
    map(res => {
      // FILTRO CRÍTICO: Solo tomamos órdenes con pago confirmado para el dinero
      // y órdenes NO rechazadas para el conteo de volumen.
      const ordenesConfirmadas = res.ordenes.filter(o => o.pagoEstado === 'CONFIRMADO');
      const ordenesActivas = res.ordenes.filter(o => o.pagoEstado !== 'RECHAZADO' && o.estadoActualId !== 6);

      const ingresos = ordenesConfirmadas.reduce((acc, obj) => acc + (Number(obj.totalAmount) || 0), 0);
      const pagosRevision = res.ordenes.filter(o => o.pagoEstado === 'EN_REVISION').length;
      const pedidosNuevos = res.ordenes.filter(o => o.estadoActualId === 1 && o.pagoEstado !== 'RECHAZADO').length;

      return {
        pedidosNuevos,
        ingresosTotales: ingresos,
        pagosRevision,
        // Usamos ordenesConfirmadas para que el gráfico de barras solo muestre dinero real
        ventasPorDia: this.procesarVentasPorDia(ordenesConfirmadas),
        // Usamos ordenesActivas para el top de productos (excluyendo lo rechazado)
        topProductos: this.procesarTopProductos(ordenesActivas),
        totalUsuarios: 28 
      };
    })
  );
}

  private procesarVentasPorDia(ordenes: any[]) {
    const diasLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    const ultimos7Dias = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoy.getDate() - i);
      ultimos7Dias.set(diasLabels[d.getDay()], 0);
    }

    ordenes.forEach(o => {
      const fecha = new Date(o.createdAt);
      const diaNombre = diasLabels[fecha.getDay()];
      if (ultimos7Dias.has(diaNombre)) {
        const actual = ultimos7Dias.get(diaNombre) || 0;
        ultimos7Dias.set(diaNombre, actual + (Number(o.totalAmount) || 0));
      }
    });

    return Array.from(ultimos7Dias, ([label, value]) => ({ label, value }));
  }

// CORRECCIÓN en dashboard.service.ts
private procesarTopProductos(ordenes: any[]) {
  const conteo = new Map<string, number>();
  
  ordenes.forEach(o => {
    // ERROR ACTUAL: const nombre = o.estadoNombre; <--- Esto saca "Orden Creada"
    // CORRECCIÓN: Si tu API no devuelve los items individuales, usa 'Venta #'+o.id 
    // o asegúrate de que el backend mande los nombres de productos.
    const nombre = "Orden #" + o.id; 
    conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
  });
  
  return Array.from(conteo, ([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
}
}