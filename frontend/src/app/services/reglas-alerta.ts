
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReglaAlerta {
  idReglaAlerta: number;
  nombre: string;
  tipoFenomeno: string;
  variable: string;
  operador: string;
  umbral: number;
  variableSecundaria: string | null;
  operadorSecundario: string | null;
  umbralSecundario: number | null;
  nivel: string;
  titulo: string;
  mensaje: string;
  activa: boolean;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export type DatosReglaAlerta = Omit<
  ReglaAlerta,
  'idReglaAlerta' | 'fechaCreacion' | 'fechaModificacion'
>;

@Injectable({
  providedIn: 'root'
})
export class ReglasAlertaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5184/api/reglas-alerta';

  // obtener todas las reglas
  obtenerReglas(): Observable<ReglaAlerta[]> {
    return this.http.get<ReglaAlerta[]>(
      this.apiUrl
    );
  }

  // obtener una regla por id
  obtenerRegla(id: number): Observable<ReglaAlerta> {
    return this.http.get<ReglaAlerta>(
      `${this.apiUrl}/${id}`
    );
  }

  // crear una regla
  crearRegla(datos: DatosReglaAlerta): Observable<ReglaAlerta> {
    return this.http.post<ReglaAlerta>(
      this.apiUrl,
      datos
    );
  }

  // actualizar una regla
  actualizarRegla(
    id: number,
    datos: DatosReglaAlerta
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // activar o desactivar una regla
  cambiarEstado(
    id: number,
    activa: boolean
  ): Observable<{
    mensaje: string;
    idReglaAlerta: number;
    activa: boolean;
  }> {
    return this.http.put<{
      mensaje: string;
      idReglaAlerta: number;
      activa: boolean;
    }>(
      `${this.apiUrl}/${id}/estado`,
      null,
      {
        params: {
          activa: String(activa)
        }
      }
    );
  }
}
