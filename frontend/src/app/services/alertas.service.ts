import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  idAlerta: number;
  idSensor: number;
  idLectura: number;

  tipoFenomeno: string;
  nivel: string;
  titulo: string;
  mensaje: string;

  fechaGeneracion: string;
  estado: string;

  sensor?: {
    idSensor: number;
    nombre: string;
    tipo: string;
    ubicacion: string;
    latitud: number;
    longitud: number;
    activo: boolean;
    fechaRegistro: string;
  };

  lectura?: {
    idLectura: number;
    idSensor: number;
    temperatura: number;
    humedad: number;
    velocidadViento: number;
    nivelLluvia: number;
    nivelAgua: number;
    fechaLectura: string;
  };
}

export interface RespuestaEstadoAlerta {
  mensaje: string;
  idAlerta: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  private readonly apiUrl =
    'http://localhost:5184/api/alertas';

  constructor(
    private http: HttpClient
  ) {}

  obtenerAlertas(): Observable<Alerta[]> {

    return this.http.get<Alerta[]>(
      this.apiUrl
    );
  }

  obtenerAlerta(id: number): Observable<Alerta> {

    return this.http.get<Alerta>(
      `${this.apiUrl}/${id}`
    );
  }

  actualizarEstado(
    idAlerta: number,
    estado: string
  ): Observable<RespuestaEstadoAlerta> {

    return this.http.put<RespuestaEstadoAlerta>(
      `${this.apiUrl}/${idAlerta}/estado`,
      null,
      {
        params: {
          estado: estado
        }
      }
    );
  }
}