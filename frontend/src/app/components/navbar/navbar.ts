import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get usuario() {
    return this.authService.usuarioActual;
  }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  cerrarSesion(): void {
    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}