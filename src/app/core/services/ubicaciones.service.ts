import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../tokens/api-url.token';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbicacionesService {
  private base: string;

  constructor(private http: HttpClient, @Inject(API_URL) private api: string) {
    this.base = `${this.api}/admin/ubicaciones`;
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post<any>(this.base, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
