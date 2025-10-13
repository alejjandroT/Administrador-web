import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/components/toast-container/toast-container/toast.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth  = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout?.();
        router.navigate(['/login']);
        toast.error('Sesión expirada. Vuelve a iniciar sesión.');
      } else if (err.status >= 500) {
        toast.error('Error del servidor. Intenta más tarde.');
      } else {
        const msg = (err.error && (err.error.message || err.error.title)) || err.message || 'Error desconocido';
        toast.error(String(msg));
      }
      return throwError(() => err);
    })
  );
};
