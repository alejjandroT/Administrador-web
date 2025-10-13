import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BrigadistasService, Brigadista } from '../../../core/services/brigadistas.service';

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
    return this.lista().filter(b =>
      (b.nombre ?? '').toLowerCase().includes(term) ||
      (b.correo ?? '').toLowerCase().includes(term) ||
      (b.telefono ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private api: BrigadistasService,
    private fb: FormBuilder
  ) {
    this.formCrear = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      activo: [true],
    });

    this.formEditar = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      activo: [true],
    });
  }

  ngOnInit(): void { this.refrescar(); }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.q.set(value);
  }

  // --- CRUD ---
  refrescar() {
    this.cargando = true;
    this.error = '';
    this.api.listar().subscribe({
      next: (data) => { this.lista.set(data); this.cargando = false; },
      error: (err) => { console.error(err); this.error = 'No se pudo cargar la lista.'; this.cargando = false; }
    });
  }

  abrirCrear() {
    this.formCrear.reset({ nombre: '', correo: '', telefono: '', activo: true });
    this.creando.set(true);
  }
  crear() {
    if (this.formCrear.invalid) { this.formCrear.markAllAsTouched(); return; }
    const payload = this.formCrear.value as Omit<Brigadista, 'id'>;
    this.api.crear(payload).subscribe({
      next: () => { this.cerrarModal(); this.refrescar(); },
      error: (err) => { console.error(err); this.error = 'No se pudo crear.'; }
    });
  }

  abrirEditar(item: Brigadista) {
    this.editando.set(item);
    this.formEditar.reset({
      nombre: item.nombre ?? '',
      correo: item.correo ?? '',
      telefono: item.telefono ?? '',
      activo: item.activo ?? true,
    });
  }
  actualizar() {
    const current = this.editando();
    if (!current) return;
    if (this.formEditar.invalid) { this.formEditar.markAllAsTouched(); return; }

    const raw = this.formEditar.value;
    const payload: Partial<Brigadista> = {
      nombre: String(raw.nombre ?? ''),
      correo: String(raw.correo ?? ''),
      telefono: raw.telefono != null ? String(raw.telefono) : undefined,
      activo: Boolean(raw.activo ?? true),
    };

    this.api.actualizar(current.id, payload).subscribe({
      next: () => { this.cerrarModal(); this.refrescar(); },
      error: (err) => { console.error(err); this.error = 'No se pudo actualizar.'; }
    });
  }

  eliminar(item: Brigadista) {
    if (!confirm(`¿Eliminar a ${item.nombre}?`)) return;
    this.api.eliminar(item.id).subscribe({
      next: () => this.refrescar(),
      error: (err) => { console.error(err); this.error = 'No se pudo eliminar.'; }
    });
  }

  cerrarModal() { this.creando.set(false); this.editando.set(null); }

  // Helpers de template
  get fC() { return this.formCrear.controls; }
  get fE() { return this.formEditar.controls; }

  trackById(index: number, item: Brigadista) { return item.id; }
}
