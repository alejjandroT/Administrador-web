import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warn';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  timeout: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private counter = 0;
  private _toasts$ = new Subject<Toast>();
  toasts$ = this._toasts$.asObservable();

  show(message: string, type: ToastType = 'info', timeout = 3500) {
    this._toasts$.next({ id: ++this.counter, type, message, timeout });
  }

  success(msg: string, timeout = 3000) {
    this.show(msg, 'success', timeout);
  }
  error(msg: string, timeout = 5000) {
    this.show(msg, 'error', timeout);
  }
  info(msg: string, timeout = 3500) {
    this.show(msg, 'info', timeout);
  }
  warn(msg: string, timeout = 4000) {
    this.show(msg, 'warn', timeout);
  }
}
