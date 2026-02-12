import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';



type SeriePoint = { label: string; value: number };
type TopProduct = { productoId: number; nombre: string; cantidad: number; ingreso: number };

type DashboardVm = {
  pedidosNuevos: number;
  ingresosTotales: number;
  ventasPorDia: SeriePoint[];
  topProductos: TopProduct[];
  totalUsuarios: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  summaryCards: any[] = [];
  loading = true;         // carga de datos
  chartsLoading = false;  // render charts
  error = '';

  private salesChart?: Chart;
  private topProductsChart?: Chart;
  private categoriesChart?: Chart;

  constructor(
    
    private cdr: ChangeDetectorRef
  ) {}
ngOnInit(): void {
  this.cargarDatosDashboard();
}

cargarDatosDashboard(): void {
  this.loading = true;
  this.error = '';
  try {
    // TODO: Implement API call to fetch dashboard data
    const dashboardData: DashboardVm = {
      pedidosNuevos: 0,
      ingresosTotales: 0,
      ventasPorDia: [],
      topProductos: [],
      totalUsuarios: 0
    };
    this.actualizarCards(dashboardData);
    this.renderSalesChart(dashboardData.ventasPorDia);
    this.renderTopProductsChart(dashboardData.topProductos);
    this.renderCategoriesChart();
  } catch (err) {
    this.error = 'Error al cargar los datos del dashboard';
    console.error(err);
  } finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}

actualizarCards(vm: DashboardVm): void {
    this.summaryCards = [
      {
        value: vm.pedidosNuevos.toString(),
        label: 'Pedidos nuevos',
        icon: 'fa-shopping-bag',
        color: 'primary',
        change: null
      },
      {
        value: vm.totalUsuarios.toString(),
        label: 'Usuarios registrados',
        icon: 'fa-user-plus',
        color: 'warning',
        change: null
      },
      
      {
        value: `S/ ${vm.ingresosTotales.toFixed(2)}`,
        label: 'Ingresos totales',
         icon: 'fa-coins', 
        color: 'success',
        change: null
      }
    ];
  }

  renderSalesChart(ventasPorDia: SeriePoint[]): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this.salesChart) this.salesChart.destroy();

    this.salesChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ventasPorDia.map(p => p.label),
        datasets: [{
          label: 'Ventas',
          data: ventasPorDia.map(p => p.value),
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderColor: 'rgba(13,110,253,1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  renderTopProductsChart(topProductos: TopProduct[]): void {
    const canvas = document.getElementById('topProductsChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this.topProductsChart) this.topProductsChart.destroy();

    const labels = topProductos.map(p => p.nombre);
    const data = topProductos.map(p => p.cantidad);

    this.topProductsChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad vendida',
          data,
          backgroundColor: 'rgba(25,135,84,0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  renderCategoriesChart(): void {
    const canvas = document.getElementById('categoriesChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this.categoriesChart) this.categoriesChart.destroy();

    this.categoriesChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Hombre', 'Mujer'],
        datasets: [{
          data: [35, 40],
          backgroundColor: ['rgba(13,110,253,0.8)', 'rgba(220,53,69,0.8)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  ngOnDestroy(): void {
    this.salesChart?.destroy();
    this.topProductsChart?.destroy();
    this.categoriesChart?.destroy();
  }
}
