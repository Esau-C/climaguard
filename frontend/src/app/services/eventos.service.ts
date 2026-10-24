
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  idEvento: number;
  idAlerta: number;
  idSensor: number;
  tipoFenomeno: string;
  nivel: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private readonly apiUrl =
    'http://localhost:5184/api/eventos';

  constructor(
    private http: HttpClient
  ) {}

  obtenerEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  obtenerEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(
      `${this.apiUrl}/${id}`
    );
  }
}
