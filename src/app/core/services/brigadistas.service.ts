import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';

export interface Brigadista {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrigadistasService {
  private base: string;

  constructor(private http: HttpClient, @Inject(API_URL) api: string) {
    this.base = `${api}/admin/brigadistas`;
  }

  listar(): Observable<Brigadista[]> {
    return this.http.get<Brigadista[]>(this.base).pipe(
      tap(() => console.log('🟢 Listando brigadistas...')),
      catchError(err => {
        console.error('❌ Error al listar brigadistas:', err);
        return throwError(() => err);
      })
    );
  }

  crear(data: Omit<Brigadista, 'id'>): Observable<Brigadista> {
    return this.http.post<Brigadista>(this.base, data).pipe(
      tap(() => console.log('🟢 Brigadista creado exitosamente')),
      catchError(err => {
        console.error('❌ Error al crear brigadista:', err);
        return throwError(() => err);
      })
    );
  }

  actualizar(id: number, data: Partial<Brigadista>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data).pipe(
      tap(() => console.log(`🟢 Brigadista #${id} actualizado`)),
      catchError(err => {
        console.error(`❌ Error al actualizar brigadista #${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => console.log(`🟢 Brigadista #${id} eliminado`)),
      catchError(err => {
        console.error(`❌ Error al eliminar brigadista #${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
