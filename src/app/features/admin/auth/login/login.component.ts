import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CourtArtComponent } from '../../../../shared/components/court-art/court-art.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CourtArtComponent, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  readonly stats = [
    { label: 'Disponible', value: '24h', mono: true },
    { label: 'Hoy',             value: '47',   sub: 'reservas' },
    { label: 'Ocupación',       value: '74%' },
  ];

  readonly dotRows = Array.from({ length: 12 }, (_, i) => i);
  readonly dotCols = Array.from({ length: 12 }, (_, i) => i);

  showPassword = signal(false);
  loginError   = signal<string | null>(null);
  submitted    = signal(false);
  loading      = signal(false);

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['',         [Validators.required, Validators.minLength(6)]],
  });

  togglePassword(): void { this.showPassword.update(v => !v); }

  signIn(): void {
    this.submitted.set(true);
    this.loginError.set(null);
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.authService.login(email, password).subscribe({
      next: (res) => {
        localStorage.setItem('auth_token', res.token);
        this.userService.setUser(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.loginError.set('Email o contraseña incorrectos.');
        } else {
          this.loginError.set('No se pudo conectar al servidor. Intenta de nuevo.');
        }
      },
    });
  }
}
