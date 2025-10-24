import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Brigadista, UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-brigadistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponents implements OnInit {
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

  constructor(private api: UsersService, private fb: FormBuilder) {
    this.formCrear = this.fb.group({
      correo: ['', [Validators.required, Validators.pattern(/^[^@]+$/)]],
      contraseña: ['', [Validators.required]],
      esBrigadista: [false],
    });

    this.formEditar = this.fb.group({
      correo: ['', [Validators.required, Validators.pattern(/^[^@]+$/)]],
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

    const username = this.formCrear.value.correo.trim().replace(/@.*/, '');
    const payload = {
      ...this.formCrear.value,
      correo: `${username}@unimayor.invitado.edu.co`,
      esBrigadista: false, // 👈 Fuerza a falso
    } as Omit<Brigadista, 'id'>;

    this.api.crear(payload).subscribe({
      next: () => {
        console.log('✅ Brigadista creado correctamente');
        const actual = this.lista();
        const ultimoId =
          actual.length > 0 ? Math.max(...actual.map((b) => b.id)) : 0;
        const nuevo: Brigadista = { id: ultimoId + 1, ...payload };
        this.lista.set([...actual, nuevo]);
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo crear el brigadista.';
      },
    });
  }

  actualizar() {
    const current = this.editando();
    if (!current) return;
    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const username = this.formEditar.value.correo.trim().replace(/@.*/, '');
    const payload = {
      ...this.formEditar.value,
      correo: `${username}@unimayor.invitado.edu.co`,
      esBrigadista: false, // 👈 Fuerza a falso
    };

    this.api.actualizar(current.id, payload).subscribe({
      next: () => {
        console.log('✅ Brigadista actualizado correctamente');
        this.refrescar();
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo actualizar el brigadista.';
      },
    });
  }

  abrirEditar(item: Brigadista) {
    this.editando.set(item);
    const baseCorreo = (item.correo ?? '').replace(
      '@unimayor.invitado.edu.co',
      ''
    );
    this.formEditar.reset({
      correo: baseCorreo,
      contraseña: '',
      esBrigadista: item.esBrigadista ?? false,
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

  cambiarRol(item: Brigadista) {
    const nuevoEstado = !item.esBrigadista;
    item.esBrigadista = nuevoEstado;

    const accion = nuevoEstado
      ? this.api.asignarRolBrigadista(item.id)
      : this.api.quitarRolBrigadista(item.id);

    accion.subscribe({
      next: () => {
        console.log(
          `✅ Usuario #${item.id} ahora ${
            nuevoEstado ? 'ES' : 'NO ES'
          } brigadista`
        );
        const actual = this.lista().map((b) =>
          b.id === item.id ? { ...b, esBrigadista: nuevoEstado } : b
        );
        this.lista.set(actual);
      },
      error: (err) => {
        console.error('❌ Error al cambiar el rol:', err);
        item.esBrigadista = !nuevoEstado;
      },
    });
  }

  limpiarCorreo(event: Event, form: FormGroup) {
    const input = event.target as HTMLInputElement;
    const valor = input.value.replace(/@.*/g, '');
    form.get('correo')?.setValue(valor, { emitEvent: false });
  }
}
