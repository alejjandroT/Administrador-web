import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';

export interface Reporte {
  idReporte: number;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  horaCreacion: string;
  rutaAudio?: string | null;
  usuario: {
    correo: string;
    nombre: string;
  };
  ubicacion: {
    sede: string;
    edificio: string;
    lugar: string;
  };
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
