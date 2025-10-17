import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  BrigadistasService,
  Brigadista,
} from '../../../core/services/brigadistas.service';

@Component({
  selector: 'app-brigadistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brigadistas.component.html',
  styleUrls: ['./brigadistas.component.css'],
})
export class BrigadistasComponent implements OnInit {
  cargando = false;
  error = '';
  lista = signal<Brigadista[]>([]);
  q = signal<string>('');
  creando = signal<boolean>(false);
  editando = signal<Brigadista | null>(null);

  formCrear!: FormGroup;
  formEditar!: FormGroup;

  // Filtro (signal computado)
  filtrados = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.lista();
    return this.lista().filter(
      (b) =>
        (b.nombre ?? '').toLowerCase().includes(term) ||
        (b.correo ?? '').toLowerCase().includes(term)
    );
  });

  constructor(private api: BrigadistasService, private fb: FormBuilder) {
    this.formCrear = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      esBrigadista: [true],
    });

    this.formEditar = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      esBrigadista: [true],
    });
  }

  ngOnInit(): void {
    this.refrescar();
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }

  // --- CRUD ---
  refrescar() {
    this.cargando = true;
    this.error = '';
    this.api.listar().subscribe({
      next: (data) => {
        this.lista.set(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar la lista.';
        this.cargando = false;
      },
    });
  }

  abrirCrear() {
    this.formCrear.reset({
      nombre: '',
      correo: '',
      telefono: '',
      esBrigadista: true,
    });
    this.creando.set(true);
  }
  crear() {
    if (this.formCrear.invalid) {
      this.formCrear.markAllAsTouched();
      return;
    }
    const payload = this.formCrear.value as Omit<Brigadista, 'id'>;
    this.api.crear(payload).subscribe({
      next: () => {
        this.cerrarModal();
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo crear.';
      },
    });
  }

  abrirEditar(item: Brigadista) {
    this.editando.set(item);
    this.formEditar.reset({
      nombre: item.nombre ?? '',
      correo: item.correo ?? '',
      esBrigadista: item.esBrigadista ?? true,
    });
  }

  actualizar() {
    const current = this.editando();
    if (!current) return;
    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const raw = this.formEditar.value;
    const nuevoEsBrig = Boolean(raw.esBrigadista ?? true);
    const previoEsBrig = Boolean(current.esBrigadista ?? false);

    if (!previoEsBrig && nuevoEsBrig) {
      this.api.asignarRolBrigadista(current.id).subscribe({
        next: () => {
          this.cerrarModal();
          this.refrescar();
        },
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo asignar el rol de brigadista.';
        },
      });
      return;
    }

    if (previoEsBrig && !nuevoEsBrig) {
      this.api.quitarRolBrigadista(current.id).subscribe({
        next: () => {
          this.cerrarModal();
          this.refrescar();
        },
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo quitar el rol de brigadista.';
        },
      });
      return;
    }

    this.cerrarModal();
    this.refrescar();
  }

  // Métodos para asignar/quitar directamente desde la lista (ej. botones rápidos)
  asignarRol(item: Brigadista) {
    if (!confirm(`¿Asignar rol de brigadista a ${item.correo}?`)) return;
    this.api.asignarRolBrigadista(item.id).subscribe({
      next: () => this.refrescar(),
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo asignar el rol.';
      },
    });
  }

  quitarRol(item: Brigadista) {
    if (!confirm(`¿Quitar rol de brigadista a ${item.correo}?`)) return;
    this.api.quitarRolBrigadista(item.id).subscribe({
      next: () => this.refrescar(),
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo quitar el rol.';
      },
    });
  }

  /**
   * Handler tipo-B: recibe el evento del checkbox (change) y el item.
   * Usa ev.target como HTMLInputElement con chequeo de null seguro.
   * Llama a los endpoints correspondientes y refresca la lista.
   */
  onToggleBrigadista(ev: Event, item: Brigadista) {
    const input = ev.target as HTMLInputElement | null;
    if (!input) return;

    // Si quedó checked -> asignar, si no -> quitar
    if (input.checked) {
      this.api.asignarRolBrigadista(item.id).subscribe({
        next: () => this.refrescar(),
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo asignar el rol de brigadista.';
        },
      });
    } else {
      this.api.quitarRolBrigadista(item.id).subscribe({
        next: () => this.refrescar(),
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo quitar el rol de brigadista.';
        },
      });
    }
  }

  cerrarModal() {
    this.creando.set(false);
    this.editando.set(null);
  }

  // Helpers de template
  get fC() {
    return this.formCrear.controls;
  }
  get fE() {
    return this.formEditar.controls;
  }

  trackById(index: number, item: Brigadista) {
    return item.id;
  }
}
