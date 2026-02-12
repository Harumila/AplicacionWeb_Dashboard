import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
 templateUrl: './Estadisticas.component.html', 
  styleUrls: ['./Estadisticas.component.css']
})
export class EstadisticasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('platillosChart') platillosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bubbleteaChart') bubbleteaCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ventasChart') ventasCanvas!: ElementRef<HTMLCanvasElement>;

  charts: Chart[] = [];
  filtroTiempo: string = 'semana';
  summaryCards: any[] = [];
  loading = true;
  error = '';
  colores = ["#f472b6", "#c084fc", "#9333ea", "#fb7185", "#38bdf8"];

  constructor(private cdr: ChangeDetectorRef, private dashboardService: DashboardService) {}

  ngAfterViewInit(): void {
    this.cargarDatosDashboard();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  cambiarFiltro(): void { this.cargarDatosDashboard(); }

  destruirCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  cargarDatosDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.loading = false;
        this.actualizarCards(data);
        
        // El secreto: forzamos a Angular a renderizar el HTML primero
        this.cdr.detectChanges(); 
        
        // Y luego dibujamos los gráficos
        this.destruirCharts();
        this.renderVentas(data.ventasPorDia);
        this.renderTop(data.topProductos);
        this.renderResumen(data);
      },
      error: () => {
        this.error = 'Error de conexión.';
        this.loading = false;
      }
    });
  }

  actualizarCards(data: DashboardData): void {
    this.summaryCards = [
      { value: data.pedidosNuevos.toString(), label: 'Órdenes Nuevas', icon: 'fa-shopping-bag', color: 'primary' },
      { value: data.pagosRevision.toString(), label: 'Vouchers Pendientes', icon: 'fa-clock', color: 'danger' },
      { value: `S/ ${data.ingresosTotales.toFixed(2)}`, label: 'Ventas Totales', icon: 'fa-coins', color: 'success' }
    ];
  }

  private renderVentas(ventas: any[]) {
    if (!this.ventasCanvas) return;
    const chart = new Chart(this.ventasCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ventas.map(v => v.label),
        datasets: [{ label: 'Ventas S/.', data: ventas.map(v => v.value), backgroundColor: '#f472b6', borderRadius: 5 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    this.charts.push(chart);
  }

  private renderTop(productos: any[]) {
    if (!this.platillosCanvas) return;
    const chart = new Chart(this.platillosCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: productos.map(p => p.nombre),
        datasets: [{ data: productos.map(p => p.cantidad), backgroundColor: this.colores }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  private renderResumen(data: DashboardData) {
    if (!this.bubbleteaCanvas) return;
    const chart = new Chart(this.bubbleteaCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Ventas Realizadas', 'Pendientes de Pago'],
        datasets: [{ data: [data.ingresosTotales, data.pedidosNuevos * 20], backgroundColor: [this.colores[0], this.colores[3]] }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
    });
    this.charts.push(chart);
  }
}