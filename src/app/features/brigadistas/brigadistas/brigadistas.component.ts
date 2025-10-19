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
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required]],
      esBrigadista: [false],
    });

    this.formEditar = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contraseña: [''],
      esBrigadista: [false],
    });
  }

  ngOnInit(): void {
    this.refrescar();
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }

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
      correo: '',
      contraseña: '',
      esBrigadista: false,
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
        this.error = 'No se pudo crear el brigadista.';
      },
    });
  }

  abrirEditar(item: Brigadista) {
    this.editando.set(item);
    this.formEditar.reset({
      correo: item.correo ?? '',
      contraseña: '',
      esBrigadista: item.esBrigadista ?? false,
    });
  }

  actualizar() {
    const current = this.editando();
    if (!current) return;
    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const payload = this.formEditar.value;
    this.api.actualizar(current.id, payload).subscribe({
      next: () => {
        this.cerrarModal();
        this.refrescar();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo actualizar el brigadista.';
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

  trackById(index: number, item: Brigadista) {
    return item.id;
  }
}
