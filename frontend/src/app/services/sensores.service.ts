import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sensor {
  idSensor: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  activo: boolean;
  fechaRegistro: string;
}

export interface SensorCrear {
  nombre: string;
  tipo: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
}

export interface SensorActualizar {
  idSensor: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  activo: boolean;
  fechaRegistro: string;
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

  obtenerSensor(id: number): Observable<Sensor> {
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
          activo: activo
        }
      }
    );
  }
}