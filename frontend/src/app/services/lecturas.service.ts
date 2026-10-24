import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComunidadLectura {
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

export interface SensorLectura {
  idSensor: number;
  nombre: string;
  codigo: string;
  tipo: string;
  idComunidad: number;
  ubicacion: string;
  unidadMedida: string;
  latitud: number;
  longitud: number;
  activo: boolean;
  fechaInstalacion: string | null;
  descripcion: string | null;
  fechaRegistro: string;
  comunidad: ComunidadLectura | null;
}

export interface Lectura {
  idLectura: number;
  idSensor: number;
  temperatura: number | null;
  humedad: number | null;
  velocidadViento: number | null;
  nivelLluvia: number | null;
  nivelAgua: number | null;
  fechaLectura: string;
  sensor: SensorLectura | null;
}

@Injectable({
  providedIn: 'root'
})
export class LecturasService {

  private readonly apiUrl =
    'http://localhost:5184/api/lecturas';

  constructor(
    private http: HttpClient
  ) {}

  obtenerLecturas(): Observable<Lectura[]> {

    return this.http.get<Lectura[]>(
      this.apiUrl
    );
  }

  obtenerLectura(
    id: number
  ): Observable<Lectura> {

    return this.http.get<Lectura>(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerLecturasPorSensor(
    idSensor: number
  ): Observable<Lectura[]> {

    return this.http.get<Lectura[]>(
      `${this.apiUrl}/sensor/${idSensor}`
    );
  }
}