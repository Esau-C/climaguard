import {
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Navbar
} from '../../components/navbar/navbar';

import {
  Alerta,
  AlertasService
} from '../../services/alertas.service';

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
export class Alertas implements OnInit {

  alertas = signal<Alerta[]>([]);
  cargando = signal(true);
  error = signal('');

  filtroNivel = signal('');
  filtroEstado = signal('');
  filtroFenomeno = signal('');

  alertaActualizando = signal<number | null>(null);

  alertasFiltradas = computed(() => {

    return this.alertas().filter(alerta => {

      const cumpleNivel =
        !this.filtroNivel() ||
        alerta.nivel === this.filtroNivel();

      const cumpleEstado =
        !this.filtroEstado() ||
        alerta.estado === this.filtroEstado();

      const cumpleFenomeno =
        !this.filtroFenomeno() ||
        alerta.tipoFenomeno === this.filtroFenomeno();

      return (
        cumpleNivel &&
        cumpleEstado &&
        cumpleFenomeno
      );
    });
  });

  constructor(
    private alertasService: AlertasService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
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

  limpiarFiltros(): void {

    this.filtroNivel.set('');
    this.filtroEstado.set('');
    this.filtroFenomeno.set('');
  }

  marcarComoAtendida(alerta: Alerta): void {

    if (alerta.estado === 'ATENDIDA') {
      return;
    }

    this.alertaActualizando.set(
      alerta.idAlerta
    );

    this.alertasService
      .actualizarEstado(
        alerta.idAlerta,
        'ATENDIDA'
      )
      .subscribe({

        next: respuesta => {

          this.alertas.update(actuales => {

            return actuales.map(item => {

              if (
                item.idAlerta === alerta.idAlerta
              ) {

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