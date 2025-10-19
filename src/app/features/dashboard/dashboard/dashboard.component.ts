import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { CommonModule } from '@angular/common';
import {
  ServicesService,
  Reporte,
} from '../../../core/services/services.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartMes') chartMesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSede') chartSedeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEstado') chartEstadoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartAudio') chartAudioRef!: ElementRef<HTMLCanvasElement>;

  reportes: Reporte[] = [];
  vista: 'tabla' | 'graficas' = 'graficas';
  cargando = false;
  error = '';

  // guardamos instancias para destruirlas
  private chartMes?: Chart | null = null;
  private chartSede?: Chart | null = null;
  private chartEstado?: Chart | null = null;
  private chartAudio?: Chart | null = null;

  constructor(private api: ServicesService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  ngAfterViewInit(): void {
    // Si los datos ya llegaron antes del AfterViewInit, generamos graficas ahora
    if (this.reportes.length && this.vista === 'graficas') {
      // pequeño delay para asegurarnos DOM listo
      setTimeout(() => this.generarGraficas(), 0);
    }
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  cambiarVista(vista: 'tabla' | 'graficas') {
    this.vista = vista;
    if (vista === 'graficas') {
      // generamos graficas cuando el usuario cambia a la vista de gráficas
      // pequeña espera para asegurar que ViewChild esté resuelto
      setTimeout(() => this.generarGraficas(), 0);
    } else {
      // destruye para ahorrar memoria
      this.destroyAllCharts();
    }
  }

  cargarReportes() {
    this.cargando = true;
    this.error = '';
    this.api.obtenerReportes().subscribe({
      next: (data) => {
        this.reportes = data || [];
        this.cargando = false;
        // Si estamos en la vista de graficas y ya existen los canvas -> generar
        if (this.vista === 'graficas') {
          setTimeout(() => this.generarGraficas(), 0);
        }
      },
      error: (err) => {
        console.error('Error al obtener reportes', err);
        this.error = 'No se pudo cargar los reportes.';
        this.cargando = false;
      },
    });
  }

  // ---------------- Grafica principal (orquestador) ----------------
  generarGraficas() {
    // chequeo básico: que los elementos ViewChild estén disponibles
    if (
      !this.chartMesRef ||
      !this.chartSedeRef ||
      !this.chartEstadoRef ||
      !this.chartAudioRef
    ) {
      // Si no están aún, intentamos un reintento corto
      setTimeout(() => this.generarGraficas(), 50);
      return;
    }

    // primero destruimos las instancias previas para evitar errores
    this.destroyAllCharts();

    try {
      this.generarGraficaPorMes();
      this.generarGraficaPorSede();
      this.generarGraficaPorEstado();
      this.generarGraficaPorAudio();
    } catch (err) {
      console.error('Error al generar gráficas', err);
    }
  }

  // ---------- Creadores individuales de gráficas ----------
  private generarGraficaPorMes() {
    const canvas = this.chartMesRef.nativeElement;
    if (!canvas) return;

    const porMes: Record<string, number> = {};
    for (const r of this.reportes) {
      // fechaCreacion viene como string 'YYYY-MM-DD' en tu JSON
      const d = r.fechaCreacion ? new Date(r.fechaCreacion) : null;
      const mes = d
        ? d.toLocaleString('es-CO', { month: 'long' })
        : 'Sin fecha';
      porMes[mes] = (porMes[mes] || 0) + 1;
    }

    const labels = Object.keys(porMes);
    const data = Object.values(porMes);

    const cfg: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Reportes por mes',
            data,
            backgroundColor: 'rgba(54,162,235,0.6)',
            borderColor: 'rgba(54,162,235,1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#000',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value) => value, // muestra el número
          },
          legend: {
            position: 'top',
            labels: { boxWidth: 12 },
          },
        },
      },
    };

    this.chartMes = new Chart(canvas, cfg);
  }

  private generarGraficaPorSede() {
    const canvas = this.chartSedeRef.nativeElement;
    if (!canvas) return;

    const porSede: Record<string, number> = {};
    for (const r of this.reportes) {
      const sede = r.ubicacion?.sede ?? 'Sin sede';
      porSede[sede] = (porSede[sede] || 0) + 1;
    }

    const labels = Object.keys(porSede);
    const data = Object.values(porSede);

    const cfg: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label: 'Reportes por sede',
            data,
            backgroundColor: labels.map((_, i) => this.pickColor(i)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#000',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value) => value, // muestra el número
          },
          legend: {
            position: 'top',
            labels: { boxWidth: 12 },
          },
        },
      },
    };

    this.chartSede = new Chart(canvas, cfg);
  }

  private generarGraficaPorEstado() {
    const canvas = this.chartEstadoRef.nativeElement;
    if (!canvas) return;

    const porEstado: Record<string, number> = {};
    for (const r of this.reportes) {
      const estado = r.estado ?? 'Sin estado';
      porEstado[estado] = (porEstado[estado] || 0) + 1;
    }

    const labels = Object.keys(porEstado);
    const data = Object.values(porEstado);

    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Reportes por estado',
            data,
            backgroundColor: labels.map((_, i) => this.pickColor(i + 5)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#000',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value) => value,
          },
          legend: {
            position: 'top',
            labels: { boxWidth: 12 },
          },
        },
      },
    };

    this.chartEstado = new Chart(canvas, cfg);
  }

  private generarGraficaPorAudio() {
    const canvas = this.chartAudioRef.nativeElement;
    if (!canvas) return;

    let conAudio = 0;
    let sinAudio = 0;
    for (const r of this.reportes) {
      if (r.rutaAudio) conAudio++;
      else sinAudio++;
    }

    const cfg: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Con audio', 'Sin audio'],
        datasets: [
          {
            label: 'Reportes según audio',
            data: [conAudio, sinAudio],
            backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(255,99,132,0.6)'],
            borderColor: ['rgba(75,192,192,1)', 'rgba(255,99,132,1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#000',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value) => value,
          },
          legend: {
            position: 'top',
            labels: { boxWidth: 12 },
          },
        },
      },
    };

    this.chartAudio = new Chart(canvas, cfg);
  }

  // ---------- Helpers ----------
  private destroyChart(chart?: Chart | null) {
    try {
      if (chart) {
        chart.destroy();
      }
    } catch (err) {
      console.warn('Error al destruir chart', err);
    }
  }

  private destroyAllCharts() {
    this.destroyChart(this.chartMes);
    this.destroyChart(this.chartSede);
    this.destroyChart(this.chartEstado);
    this.destroyChart(this.chartAudio);

    this.chartMes = null;
    this.chartSede = null;
    this.chartEstado = null;
    this.chartAudio = null;
  }

  // color generator simple
  private pickColor(index: number) {
    const palette = [
      'rgba(255,99,132,0.6)',
      'rgba(54,162,235,0.6)',
      'rgba(255,206,86,0.6)',
      'rgba(75,192,192,0.6)',
      'rgba(153,102,255,0.6)',
      'rgba(255,159,64,0.6)',
      'rgba(199,199,199,0.6)',
    ];
    return palette[index % palette.length];
  }

  reproducirAudio(idReporte: number) {
    this.api.obtenerAudio(idReporte).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch((err) => console.error('Error al reproducir', err));
      },
      error: (err) => {
        console.error('Error al obtener audio', err);
      },
    });
  }
}
