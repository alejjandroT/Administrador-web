import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 1;

  
  get all() {
    return this.toasts.asReadonly();
  }

  private show(message: string, type: Toast['type']) {
    const id = this.nextId++;
    this.toasts.update((prev) => [...prev, { id, message, type }]);
    setTimeout(() => this.remove(id), 3000);
  }

  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error');
  }

  info(msg: string) {
    this.show(msg, 'info');
  }

  private remove(id: number) {
    this.toasts.update((prev) => prev.filter((t) => t.id !== id));
  }
}
