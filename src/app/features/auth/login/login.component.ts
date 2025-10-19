import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  loading = false;
  show = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      Correo: ['', [Validators.required, Validators.email]],
      Contrasena: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;
    this.errorMessage = '';
    this.loading = true;

    const { Correo, Contrasena } = this.loginForm.value;
    this.authService.login({ Correo, Contrasena }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          'Credenciales incorrectas. Verifica e intenta de nuevo.';
        console.error('[LOGIN] error', err);
      },
    });
  }
}
