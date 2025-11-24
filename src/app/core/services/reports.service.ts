import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';

export interface Usuario {
  correo: string;
  nombre: string | null;
  rutaFoto?: string | null;
  mensaje?: string | null;
}

export interface Ubicacion {
  idUbicacion?: number;
  descripcion?: string | null;
  sede: string;
  edificio: string;
  lugar: string;
  piso?: string | null;
  reportes?: any | null;
}

export interface Reporte {
  idReporte: number;
  usuario: Usuario;
  ubicacion: Ubicacion | null;
  descripcion: string | null;
  detallesFinalizacion: string | null;
  ubicacionTextOpcional: string | null;
  rutaAudio?: string | null;
  estado: string;
  paraMi?: boolean;
  fechaCreacion: string;
  horaCreacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private baseUrl: string;

  constructor(private http: HttpClient, @Inject(API_URL) private api: string) {
    this.baseUrl = `${this.api}/admin/reportes`;
  }

  obtenerReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.baseUrl);
  }

  obtenerReportePorId(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.baseUrl}/${id}`);
  }

  obtenerAudio(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/audio`, {
      responseType: 'blob',
    });
  }
}
