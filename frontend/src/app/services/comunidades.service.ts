import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comunidad {
  idComunidad: number;
  nombre: string;
  municipio: string;
  departamento: string;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
  activa: boolean;
  fechaRegistro: string;
}

export interface CrearComunidad {
  nombre: string;
  municipio: string;
  departamento: string;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
}

export interface ActualizarComunidad {
  nombre: string;
  municipio: string;
  departamento: string;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadesService {

  private apiUrl =
    'http://localhost:5184/api/comunidades';

  constructor(
    private http: HttpClient
  ) {}

  obtenerComunidades(): Observable<Comunidad[]> {
    return this.http.get<Comunidad[]>(
      this.apiUrl
    );
  }

  obtenerComunidad(
    id: number
  ): Observable<Comunidad> {

    return this.http.get<Comunidad>(
      `${this.apiUrl}/${id}`
    );
  }

  crearComunidad(
    datos: CrearComunidad
  ): Observable<Comunidad> {

    return this.http.post<Comunidad>(
      this.apiUrl,
      datos
    );
  }

  actualizarComunidad(
    id: number,
    datos: ActualizarComunidad
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  cambiarEstado(
    id: number,
    activa: boolean
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/estado?activa=${activa}`,
      {}
    );
  }
}