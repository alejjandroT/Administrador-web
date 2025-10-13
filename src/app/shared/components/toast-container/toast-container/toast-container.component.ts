import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of toast.all()"
        class="toast"
        [class.toast-success]="t.type === 'success'"
        [class.toast-error]="t.type === 'error'"
        [class.toast-info]="t.type === 'info'"
      >
        {{ t.message }}
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.css'],
})
export class ToastContainerComponent implements OnInit {
  toast = inject(ToastService);
  ngOnInit(): void {}
}
