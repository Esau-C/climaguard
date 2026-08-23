import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface AlertaSignalR {
  idAlerta: number;
  idSensor: number;
  idLectura: number;
  tipoFenomeno: string;
  nivel: string;
  titulo: string;
  mensaje: string;
  estado: string;
  fechaGeneracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection?: signalR.HubConnection;

  private nuevaAlertaSubject = new Subject<AlertaSignalR>();

  nuevaAlerta$ = this.nuevaAlertaSubject.asObservable();

  iniciarConexion(): void {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5184/hubs/alerts')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR conectado correctamente');
      })
      .catch(error => {
        console.error('Error al conectar SignalR:', error);
      });

    this.hubConnection.on(
      'NuevaAlerta',
      (alerta: AlertaSignalR) => {

        console.log('Nueva alerta recibida:', alerta);

        this.nuevaAlertaSubject.next(alerta);
      }
    );
  }

  detenerConexion(): void {

    if (this.hubConnection) {

      this.hubConnection
        .stop()
        .then(() => {
          console.log('SignalR desconectado');
        })
        .catch(error => {
          console.error(
            'Error al desconectar SignalR:',
            error
          );
        });
    }
  }
}