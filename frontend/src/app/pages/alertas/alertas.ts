
import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Navbar } from '../../components/navbar/navbar';

import {
  Alerta,
  AlertasService
} from '../../services/alertas.service';

import {
  SignalrService
} from '../../services/signalr.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class Alertas implements OnInit, OnDestroy {

  alertas = signal<Alerta[]>([]);
  cargando = signal(true);
  error = signal('');

  filtroNivel = signal('');
  filtroEstado = signal('');
  filtroFenomeno = signal('');
  filtroComunidad = signal('');

  alertaActualizando = signal<number | null>(null);

  private suscripcionSignalR?: Subscription;

  alertasFiltradas = computed(() => {

    return this.alertas().filter(alerta => {

      const idComunidad =
        alerta.sensor?.comunidad
          ?.idComunidad?.toString() || '';

      const cumpleNivel =
        !this.filtroNivel() ||
        alerta.nivel === this.filtroNivel();

      const cumpleEstado =
        !this.filtroEstado() ||
        alerta.estado === this.filtroEstado();

      const cumpleFenomeno =
        !this.filtroFenomeno() ||
        alerta.tipoFenomeno === this.filtroFenomeno();

      const cumpleComunidad =
        !this.filtroComunidad() ||
        idComunidad === this.filtroComunidad();

      return (
        cumpleNivel &&
        cumpleEstado &&
        cumpleFenomeno &&
        cumpleComunidad
      );
    });
  });

  comunidadesDisponibles = computed(() => {

    const comunidades = new Map<number, string>();

    this.alertas().forEach(alerta => {

      const comunidad = alerta.sensor?.comunidad;

      if (comunidad) {
        comunidades.set(
          comunidad.idComunidad,
          comunidad.nombre
        );
      }
    });

    return Array.from(comunidades.entries()).map(
      ([idComunidad, nombre]) => ({
        idComunidad,
        nombre
      })
    );
  });

  constructor(
    private alertasService: AlertasService,
    private signalrService: SignalrService
  ) {}

  ngOnInit(): void {

    // escuchar nuevas alertas en tiempo real
    this.suscripcionSignalR =
      this.signalrService.nuevaAlerta$
        .subscribe(alerta => {

          console.log(
            'Actualizando alertas en tiempo real:',
            alerta
          );

          // recargar para obtener tambien los datos
          // del sensor y la comunidad
          this.cargarAlertas();
        });

    // cargar las alertas existentes
    this.cargarAlertas();
  }

  ngOnDestroy(): void {

    // liberar la suscripcion del componente
    this.suscripcionSignalR?.unsubscribe();
  }

  cargarAlertas(): void {

    this.cargando.set(true);
    this.error.set('');

    this.alertasService
      .obtenerAlertas()
      .subscribe({

        next: alertas => {

          this.alertas.set(alertas);
          this.cargando.set(false);
        },

        error: error => {

          console.error(
            'Error al cargar alertas:',
            error
          );

          this.error.set(
            'No fue posible cargar las alertas.'
          );

          this.cargando.set(false);
        }
      });
  }

  cambiarNivel(valor: string): void {
    this.filtroNivel.set(valor);
  }

  cambiarEstado(valor: string): void {
    this.filtroEstado.set(valor);
  }

  cambiarFenomeno(valor: string): void {
    this.filtroFenomeno.set(valor);
  }

  cambiarComunidad(valor: string): void {
    this.filtroComunidad.set(valor);
  }

  limpiarFiltros(): void {

    this.filtroNivel.set('');
    this.filtroEstado.set('');
    this.filtroFenomeno.set('');
    this.filtroComunidad.set('');
  }

  marcarComoAtendida(alerta: Alerta): void {

    if (alerta.estado === 'ATENDIDA') {
      return;
    }

    this.alertaActualizando.set(alerta.idAlerta);

    this.alertasService
      .actualizarEstado(
        alerta.idAlerta,
        'ATENDIDA'
      )
      .subscribe({

        next: respuesta => {

          this.alertas.update(actuales => {

            return actuales.map(item => {

              if (item.idAlerta === alerta.idAlerta) {

                return {
                  ...item,
                  estado: respuesta.estado
                };
              }

              return item;
            });
          });

          this.alertaActualizando.set(null);
        },

        error: error => {

          console.error(
            'Error al actualizar alerta:',
            error
          );

          this.alertaActualizando.set(null);

          alert(
            'No fue posible actualizar la alerta.'
          );
        }
      });
  }
}
