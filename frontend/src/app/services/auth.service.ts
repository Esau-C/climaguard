import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UsuarioLogin {
  idUsuario: number;
  nombre: string;
  apellido: string;
  username: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioLogin;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5184/api/auth';

  usuarioActual = signal<UsuarioLogin | null>(null);

  constructor(
    private http: HttpClient
  ) {
    this.cargarSesion();
  }

  login(datos: LoginRequest): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        datos
      )
      .pipe(
        tap(respuesta => {

          localStorage.setItem(
            'token',
            respuesta.token
          );

          localStorage.setItem(
            'usuario',
            JSON.stringify(respuesta.usuario)
          );

          this.usuarioActual.set(
            respuesta.usuario
          );
        })
      );
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.usuarioActual.set(null);
  }

  obtenerToken(): string | null {

    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {

    return this.obtenerToken() !== null;
  }

  esAdmin(): boolean {

    return this.usuarioActual()?.rol === 'ADMIN';
  }

  private cargarSesion(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (usuarioGuardado) {

      this.usuarioActual.set(
        JSON.parse(usuarioGuardado)
      );
    }
  }
}