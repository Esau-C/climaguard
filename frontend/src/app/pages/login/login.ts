import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  cargando = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {

    this.error.set('');

    if (!this.username || !this.password) {
      this.error.set(
        'Ingrese usuario y contraseña.'
      );

      return;
    }

    this.cargando.set(true);

    this.authService.login({
      username: this.username,
      password: this.password
    })
    .subscribe({
      next: () => {

        this.cargando.set(false);

        this.router.navigate(['/dashboard']);
      },

      error: error => {

        this.cargando.set(false);

        if (error.status === 401) {
          this.error.set(
            'Usuario o contraseña incorrectos.'
          );
        }
        else {
          this.error.set(
            'No fue posible iniciar sesión.'
          );
        }
      }
    });
  }
}