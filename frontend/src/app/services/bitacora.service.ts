
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioBitacora {
  idUsuario: number;
  nombre: string;
  apellido: string;
  username: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface Bitacora {
  idBitacora: number;
  idUsuario: number;
  accion: string;
  entidad: string;
  idEntidad: string | null;
  descripcion: string;
  fecha: string;
  ip: string | null;
  usuario: UsuarioBitacora | null;
}

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {

  private readonly apiUrl =
    'http://localhost:5184/api/Bitacoras';

  constructor(
    private http: HttpClient
  ) {}

  obtenerBitacoras(): Observable<Bitacora[]> {

    return this.http.get<Bitacora[]>(
      this.apiUrl
    );
  }
}
