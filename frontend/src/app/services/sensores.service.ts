import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComunidadSensor {
  idComunidad: number;
  nombre: string;
  municipio: string;
  departamento: string;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  activa: boolean;
}

export interface Sensor {
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
  comunidad: ComunidadSensor | null;
}

export interface SensorCrear {
  nombre: string;
  codigo: string;
  tipo: string;
  idComunidad: number;
  ubicacion: string;
  unidadMedida: string;
  latitud: number;
  longitud: number;
  fechaInstalacion?: string | null;
  descripcion?: string | null;
}

export interface SensorActualizar {
  nombre: string;
  codigo: string;
  tipo: string;
  idComunidad: number;
  ubicacion: string;
  unidadMedida: string;
  latitud: number;
  longitud: number;
  fechaInstalacion?: string | null;
  descripcion?: string | null;
}

export interface RespuestaEstadoSensor {
  mensaje: string;
  idSensor: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SensoresService {

  private readonly apiUrl =
    'http://localhost:5184/api/sensors';

  constructor(
    private http: HttpClient
  ) {}

  obtenerSensores(): Observable<Sensor[]> {

    return this.http.get<Sensor[]>(
      this.apiUrl
    );
  }

  obtenerSensor(
    id: number
  ): Observable<Sensor> {

    return this.http.get<Sensor>(
      `${this.apiUrl}/${id}`
    );
  }

  crearSensor(
    sensor: SensorCrear
  ): Observable<Sensor> {

    return this.http.post<Sensor>(
      this.apiUrl,
      sensor
    );
  }

  actualizarSensor(
    id: number,
    sensor: SensorActualizar
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      sensor
    );
  }

  cambiarEstado(
    idSensor: number,
    activo: boolean
  ): Observable<RespuestaEstadoSensor> {

    return this.http.put<RespuestaEstadoSensor>(
      `${this.apiUrl}/${idSensor}/estado`,
      null,
      {
        params: {
          activo
        }
      }
    );
  }
}