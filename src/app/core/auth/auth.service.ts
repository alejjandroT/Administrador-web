import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { AUTH_TOKEN_KEY } from './auth.tokens';
import { API_URL } from '../tokens/api-url.token';

export interface LoginDto {
  Correo: string;
  Contrasena: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base: string;

  constructor(private http: HttpClient, @Inject(API_URL) api: string) {
    this.base = `${api}/admin/auth`;
  }

  login(dto: LoginDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.base}/login`, dto).pipe(
      tap((res) => {
        if (res?.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decode(token);
      if (!payload?.exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  getUserEmailFromToken(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = this.decode(token);
      return payload?.email || payload?.Correo || '';
    } catch {
      return '';
    }
  }

  private decode(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload);
    return JSON.parse(json);
  }

  // Helpers de claims/roles
  getClaims(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decode(token);
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const p = this.getClaims();
    if (!p) return false;

    const normalized = (role || '').toLowerCase();

    const roles: string[] = Array.isArray(p.roles)
      ? p.roles
      : p.role
      ? [p.role]
      : [];
    if (roles.some((r) => String(r || '').toLowerCase() === normalized))
      return true;

    
    if (normalized === 'admin') {
      return !!(
        p.EsAdmin === true ||
        p.esAdmin === true ||
        String(p.EsAdmin ?? p.esAdmin).toLowerCase() === 'true'
      );
    }
    if (normalized === 'brigadista') {
      return !!(
        p.EsBrigadista === true ||
        p.esBrigadista === true ||
        String(p.EsBrigadista ?? p.esBrigadista).toLowerCase() === 'true'
      );
    }
    return false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
  isBrigadista(): boolean {
    return this.hasRole('brigadista');
  }
}
