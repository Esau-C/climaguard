import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComunidadAlerta {
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

export interface SensorAlerta {
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
  comunidad: ComunidadAlerta | null;
}

export interface LecturaAlerta {
  idLectura: number;
  idSensor: number;
  temperatura: number | null;
  humedad: number | null;
  velocidadViento: number | null;
  nivelLluvia: number | null;
  nivelAgua: number | null;
  fechaLectura: string;
}

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

  sensor?: SensorAlerta | null;
  lectura?: LecturaAlerta | null;
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

  obtenerAlerta(
    id: number
  ): Observable<Alerta> {

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
          estado
        }
      }
    );
  }
}