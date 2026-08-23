import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  username: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioCrear {
  nombre: string;
  apellido: string;
  username: string;
  passwordHash: string;
  rol: string;
}

export interface UsuarioActualizar {
  idUsuario: number;
  nombre: string;
  apellido: string;
  username: string;
  passwordHash: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface RespuestaEstadoUsuario {
  mensaje: string;
  idUsuario: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly apiUrl =
    'http://localhost:5184/api/usuarios';

  constructor(
    private http: HttpClient
  ) {}

  obtenerUsuarios(): Observable<Usuario[]> {

    return this.http.get<Usuario[]>(
      this.apiUrl
    );
  }

  obtenerUsuario(id: number): Observable<Usuario> {

    return this.http.get<Usuario>(
      `${this.apiUrl}/${id}`
    );
  }

  crearUsuario(
    usuario: UsuarioCrear
  ): Observable<Usuario> {

    return this.http.post<Usuario>(
      this.apiUrl,
      usuario
    );
  }

  actualizarUsuario(
    id: number,
    usuario: UsuarioActualizar
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      usuario
    );
  }

  cambiarEstado(
    idUsuario: number,
    activo: boolean
  ): Observable<RespuestaEstadoUsuario> {

    return this.http.put<RespuestaEstadoUsuario>(
      `${this.apiUrl}/${idUsuario}/estado`,
      null,
      {
        params: {
          activo: activo
        }
      }
    );
  }
}