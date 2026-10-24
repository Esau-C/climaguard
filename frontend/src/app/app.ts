
import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import {
  SignalrService
} from './services/signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  constructor(
    private signalrService: SignalrService
  ) {}

  ngOnInit(): void {

    // iniciar la conexion signalr
    // al cargar la aplicacion
    this.signalrService.iniciarConexion();
  }

  ngOnDestroy(): void {

    // cerrar la conexion al destruir
    // el componente principal
    this.signalrService.detenerConexion();
  }
}
