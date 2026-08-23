import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SensorLectura {
  idSensor: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
}

export interface Lectura {
  idLectura: number;
  idSensor: number;
  temperatura: number;
  humedad: number;
  velocidadViento: number;
  nivelLluvia: number;
  nivelAgua: number;
  fechaLectura: string;
  sensor: SensorLectura | null;
}

@Injectable({
  providedIn: 'root'
})
export class LecturasService {

  private apiUrl =
    'http://localhost:5184/api/lecturas';

  constructor(
    private http: HttpClient
  ) {}

  obtenerLecturas(): Observable<Lectura[]> {
    return this.http.get<Lectura[]>(
      this.apiUrl
    );
  }

  obtenerLectura(id: number): Observable<Lectura> {
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