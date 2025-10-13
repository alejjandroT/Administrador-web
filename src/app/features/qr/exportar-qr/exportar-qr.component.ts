import { Component, OnInit, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';

export interface Ubicacion {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
}

@Component({
  selector: 'app-exportar-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exportar-qr.component.html',
  styleUrls: ['./exportar-qr.component.css']
})
export class ExportarQrComponent implements OnInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

  cargando = signal<boolean>(false);
  q = signal<string>('');
  lista = signal<Ubicacion[]>([]);
  seleccionada = signal<Ubicacion | null>(null);
  // selección múltiple (ids)
  seleccionados = signal<Set<number>>(new Set<number>());

  filtradas = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.lista();
    return this.lista().filter(u =>
      (u.nombre ?? '').toLowerCase().includes(term) ||
      (u.codigo ?? '').toLowerCase().includes(term)
    );
  });

  constructor(private ubicaciones: UbicacionesService) {}

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    this.cargando.set(true);
    this.ubicaciones.getAll().subscribe({
      next: (data) => {
        const normal: Ubicacion[] = (data || []).map((x: any) => ({
          id: x.id ?? x.idUbicacion ?? 0,
          nombre: x.nombre ?? '',
          codigo: x.codigo ?? '',
          descripcion: x.descripcion ?? ''
        }));
        this.lista.set(normal);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('No se pudo cargar ubicaciones', err);
        this.cargando.set(false);
      }
    });
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }

  
  seleccionar(u: Ubicacion) {
    this.seleccionada.set(u);
    setTimeout(() => this.renderCanvas(u), 0);
  }

  private qrPayload(u: Ubicacion): string {
    return `${location.origin}/scan?codigo=${encodeURIComponent(u.codigo)}`;
  }


  private async renderCanvas(u: Ubicacion) {
    if (!this.qrCanvas) return;
    const canvas = this.qrCanvas.nativeElement;
    await QRCode.toCanvas(canvas, this.qrPayload(u), {
      margin: 1,
      width: 256
    });
  }

  
  descargarPNG() {
    const u = this.seleccionada();
    if (!u || !this.qrCanvas) return;
    const canvas = this.qrCanvas.nativeElement;
    canvas.toBlob((blob) => {
      if (!blob) return;
      saveAs(blob, `QR_${u.codigo}.png`);
    });
  }

  
  toggleSeleccion(u: Ubicacion, ev: Event) {
    const set = new Set(this.seleccionados());
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) set.add(u.id);
    else set.delete(u.id);
    this.seleccionados.set(set);
  }

  // Genera PNGs en memoria y los empaqueta en ZIP
  async descargarZip() {
    const ids = this.seleccionados();
    if (!ids.size) return;

    const zip = new JSZip();

    
    for (const u of this.lista()) {
      if (!ids.has(u.id)) continue;

      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, this.qrPayload(u), { margin: 1, width: 512 });

      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve));
      if (blob) {
        const arrayBuf = await blob.arrayBuffer();
        zip.file(`QR_${u.codigo}.png`, arrayBuf);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `QRS_${new Date().toISOString().slice(0,10)}.zip`);
  }

  
  estaSeleccionado(u: Ubicacion): boolean {
    return this.seleccionados().has(u.id);
  }

  limpiarSeleccionMultiple() {
    this.seleccionados.set(new Set());
  }

  trackById(index: number, item: any): number {
  return item.id;
}
}
