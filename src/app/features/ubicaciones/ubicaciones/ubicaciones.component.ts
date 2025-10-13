import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { ToastService } from '../../../shared/components/toast-container/toast-container/toast.service';

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css'],
})
export class UbicacionesComponent implements OnInit {
  cargando = false;
  lista = signal<any[]>([]);
  q = signal<string>('');
  creando = signal<boolean>(false);
  editando = signal<any | null>(null);

  formCrear!: FormGroup;
  formEditar!: FormGroup;

  filtrados = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.lista();
    return this.lista().filter(
      (u) =>
        (u.nombre ?? '').toLowerCase().includes(term) ||
        (u.codigo ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private api: UbicacionesService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.formCrear = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      descripcion: [''],
    });

    this.formEditar = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
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
    this.formCrear.reset({ nombre: '', codigo: '', descripcion: '' });
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
      nombre: item.nombre,
      codigo: item.codigo,
      descripcion: item.descripcion,
    });
  }

  actualizar() {
    const actual = this.editando();
    if (!actual) return;
    const dto = this.formEditar.value;
    this.api.update(actual.id, dto).subscribe({
      next: () => {
        this.toast.success('Ubicación actualizada');
        this.editando.set(null);
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('No se pudo actualizar');
      },
    });
  }

  eliminar(item: any) {
    if (!confirm(`¿Eliminar la ubicación ${item.nombre}?`)) return;
    this.api.delete(item.id).subscribe({
      next: () => {
        this.toast.success('Ubicación eliminada');
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('No se pudo eliminar');
      },
    });
  }

  cerrarModal() {
    this.creando.set(false);
    this.editando.set(null);
  }

  get fC() {
    return this.formCrear.controls;
  }
  get fE() {
    return this.formEditar.controls;
  }

  trackById(index: number, item: any): number {
  return item.id;
}


  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }

  
}
