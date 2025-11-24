import {
  Component,
  OnInit,
  computed,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { ToastService } from '../../../shared/components/toast-container/toast-container/toast.service';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css'],
})
export class UbicacionesComponent implements OnInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

  cargando = false;
  lista = signal<any[]>([]);
  q = signal<string>('');
  creando = signal<boolean>(false);
  editando = signal<any | null>(null);
  seleccionada = signal<any | null>(null);
  seleccionados = signal<Set<number>>(new Set<number>());

  formCrear!: FormGroup;
  formEditar!: FormGroup;

  filtrados = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.lista();
    return this.lista().filter((u) =>
      [u.sede, u.edificio, u.lugar, u.piso, u.descripcion]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  });

  constructor(
    private api: UbicacionesService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.formCrear = this.fb.group({
      sede: ['', Validators.required],
      edificio: ['', Validators.required],
      piso: ['', Validators.required],
      lugar: ['', Validators.required],
      descripcion: [''],
    });

    this.formEditar = this.fb.group({
      sede: ['', Validators.required],
      edificio: ['', Validators.required],
      piso: ['', Validators.required],
      lugar: ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar() {
    this.cargando = true;
    this.api.getAll().subscribe({
      next: (data) => {
        this.lista.set(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('No se pudo cargar la lista de ubicaciones');
        this.cargando = false;
      },
    });
  }

  abrirCrear() {
    this.formCrear.reset({
      sede: '',
      edificio: '',
      piso: '',
      lugar: '',
      descripcion: '',
    });
    this.creando.set(true);
  }

  crear() {
    if (this.formCrear.invalid) {
      this.formCrear.markAllAsTouched();
      return;
    }

    const dto = this.formCrear.value;
    this.api.create(dto).subscribe({
      next: () => {
        this.toast.success('Ubicación creada');
        this.creando.set(false);
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('No se pudo crear la ubicación');
      },
    });
  }

  abrirEditar(item: any) {
    this.editando.set(item);
    this.formEditar.reset({
      sede: item.sede,
      edificio: item.edificio,
      piso: item.piso,
      lugar: item.lugar,
      descripcion: item.descripcion,
    });
  }

  actualizar() {
    const actual = this.editando();
    if (!actual) return;
    const dto = this.formEditar.value;
    this.api.update(actual.idUbicacion, dto).subscribe({
      next: () => {
        this.toast.success('Ubicación actualizada');
        this.editando.set(null);
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        const msg =
          err.status === 500
            ? 'No se pudo actualizar la ubicación. Verifica los datos.'
            : 'Error inesperado al actualizar.';
        this.toast.error(msg);
      },
    });
  }

  eliminar(item: any) {
    if (!confirm(`¿Eliminar la ubicación ${item.lugar}?`)) return;
    this.api.delete(item.idUbicacion).subscribe({
      next: () => {
        this.toast.success('Ubicación eliminada');
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        let msg = 'No se pudo eliminar la ubicación';
        if (
          err.status === 500 &&
          err.error?.includes('FK_Reportes_Ubicaciones')
        ) {
          msg = 'No se puede eliminar porque tiene reportes asociados';
        }
        this.toast.error(msg);
      },
    });
  }

  seleccionar(u: any) {
    this.seleccionada.set(u);
    setTimeout(() => this.renderCanvas(u), 0);
  }

  toggleSeleccion(u: any, ev: Event) {
    const set = new Set(this.seleccionados());
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) set.add(u.idUbicacion);
    else set.delete(u.idUbicacion);
    this.seleccionados.set(set);
  }

  toggleSeleccionTodos(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const set = new Set<number>();
    if (checked) {
      this.filtrados().forEach((u) => set.add(u.idUbicacion));
    }
    this.seleccionados.set(set);
  }

  estaSeleccionado(u: any): boolean {
    return this.seleccionados().has(u.idUbicacion);
  }

  private qrPayload(u: any): string {
    return `reportes_unimayor_ubicación_oficial:${encodeURIComponent(u.idUbicacion)}`;
  }

  private async renderCanvas(u: any) {
    if (!this.qrCanvas) return;
    const canvas = this.qrCanvas.nativeElement;
    await QRCode.toCanvas(canvas, this.qrPayload(u), {
      margin: 1,
      width: 250,
    });
  }

  descargarPNG() {
    const u = this.seleccionada();
    if (!u || !this.qrCanvas) return;
    const canvas = this.qrCanvas.nativeElement;
    canvas.toBlob((blob) => {
      if (!blob) return;
      saveAs(
        blob,
        `QR_${u.sede}_Edificio_${u.edificio}_Piso_${u.piso}_${u.lugar}.png`
      );
    });
  }

  async descargarZip() {
    const ids = this.seleccionados();
    if (!ids.size) {
      this.toast.info('Selecciona al menos una ubicación.');
      return;
    }

    const zip = new JSZip();
    for (const u of this.lista()) {
      if (!ids.has(u.idUbicacion)) continue;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, this.qrPayload(u), {
        margin: 1,
        width: 512,
      });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve)
      );
      if (blob) {
        const arrayBuf = await blob.arrayBuffer();
        zip.file(`QR_${u.lugar}.png`, arrayBuf);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(
      content,
      `Ubicaciones_QR_${new Date().toISOString().slice(0, 10)}.zip`
    );
    this.toast.success('ZIP generado correctamente');
  }

  cerrarModal() {
    this.creando.set(false);
    this.editando.set(null);
  }

  trackById(index: number, item: any): number {
    return item.idUbicacion;
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }
}
