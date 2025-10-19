import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError, map } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';

export interface Brigadista {
  id: number;
  nombre?: string | null;
  correo: string;
  contraseña?: string;
  esBrigadista: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrigadistasService {
  private baseAdmin: string;
  private baseAuth: string;

  constructor(private http: HttpClient, @Inject(API_URL) api: string) {
    this.baseAdmin = `${api}/admin/usuarios`;
    this.baseAuth = `${api}/auth/invitados`;
  }

  listar(): Observable<Brigadista[]> {
    return this.http.get<any[]>(`${this.baseAdmin}/usuarios`).pipe(
      map((items) =>
        (items || []).map((it) => ({
          id: it.id ?? it.idUsuario ?? 0,
          nombre: it.nombre ?? it.nombreUsuario ?? null,
          correo: it.correo ?? it.email ?? '',
          esBrigadista: Boolean(it.esBrigadista ?? it.es_brigadista ?? false),
        }))
      ),
      tap(() => console.log('🟢 Listando brigadistas...')),
      catchError((err) => {
        console.error('❌ Error al listar brigadistas:', err);
        return throwError(() => err);
      })
    );
  }

  crear(data: Omit<Brigadista, 'id'>): Observable<any> {
    return this.http
      .post(`${this.baseAuth}/registro`, data, { responseType: 'text' })
      .pipe(
        tap(() => console.log('🟢 Brigadista creado exitosamente')),
        catchError((err) => {
          console.error('❌ Error al crear brigadista:', err);
          return throwError(() => err);
        })
      );
  }

  actualizar(id: number, data: Partial<Brigadista>): Observable<void> {
    return this.http.put<void>(`${this.baseAuth}/actualizar/${id}`, data).pipe(
      tap(() => console.log(`🟢 Brigadista #${id} actualizado correctamente`)),
      catchError((err) => {
        console.error(`❌ Error al actualizar brigadista #${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  asignarRolBrigadista(id: number): Observable<void> {
    return this.http
      .post(
        `${this.baseAdmin}/${id}/asignar-brigadista`,
        {},
        { responseType: 'text' }
      )
      .pipe(
        tap(() =>
          console.log(`🟢 Rol de brigadista asignado al usuario #${id}`)
        ),
        map(() => void 0),
        catchError((err) => {
          console.error(`❌ Error al asignar rol al usuario #${id}:`, err);
          return throwError(() => err);
        })
      );
  }

  quitarRolBrigadista(id: number): Observable<void> {
    return this.http
      .post(
        `${this.baseAdmin}/${id}/quitar-brigadista`,
        {},
        { responseType: 'text' }
      )
      .pipe(
        tap(() =>
          console.log(`🟢 Rol de brigadista quitado al usuario #${id}`)
        ),
        map(() => void 0),
        catchError((err) => {
          console.error(`❌ Error al quitar rol al usuario #${id}:`, err);
          return throwError(() => err);
        })
      );
  }
}
