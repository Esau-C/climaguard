
import {
  Component,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';

import {
  Bitacora as RegistroBitacora,
  BitacoraService
} from '../../services/bitacora.service';
@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './bitacora.html',
  styleUrl: './bitacora.css'
})
export class Bitacora implements OnInit {

  bitacoras = signal<RegistroBitacora[]>([]);
  cargando = signal(true);
  error = signal('');

  filtroTexto = signal('');
  filtroAccion = signal('TODAS');
  filtroEntidad = signal('TODAS');

  acciones = computed(() => {
    return [
      ...new Set(
        this.bitacoras().map(
          registro => registro.accion
        )
      )
    ].sort();
  });

  entidades = computed(() => {
    return [
      ...new Set(
        this.bitacoras().map(
          registro => registro.entidad
        )
      )
    ].sort();
  });

  bitacorasFiltradas = computed(() => {

    const texto = this.filtroTexto()
      .trim()
      .toLowerCase();

    const accion = this.filtroAccion();
    const entidad = this.filtroEntidad();

    return this.bitacoras().filter(registro => {

      const usuario = registro.usuario
        ? `${registro.usuario.nombre} ${registro.usuario.apellido} ${registro.usuario.username}`
        : '';

      const contenido = [
        usuario,
        registro.accion,
        registro.entidad,
        registro.idEntidad ?? '',
        registro.descripcion,
        registro.ip ?? ''
      ].join(' ').toLowerCase();

      const coincideTexto =
        !texto || contenido.includes(texto);

      const coincideAccion =
        accion === 'TODAS' ||
        registro.accion === accion;

      const coincideEntidad =
        entidad === 'TODAS' ||
        registro.entidad === entidad;

      return (
        coincideTexto &&
        coincideAccion &&
        coincideEntidad
      );
    });
  });

  constructor(
    private bitacoraService: BitacoraService
  ) {}

  ngOnInit(): void {
    this.cargarBitacoras();
  }

  cargarBitacoras(): void {

    this.cargando.set(true);
    this.error.set('');

    this.bitacoraService
      .obtenerBitacoras()
      .subscribe({

        next: registros => {

          const ordenados = [...registros].sort(
            (a, b) =>
              new Date(b.fecha).getTime() -
              new Date(a.fecha).getTime()
          );

          this.bitacoras.set(ordenados);
          this.cargando.set(false);
        },

        error: error => {

          console.error(
            'Error al cargar bitacoras:',
            error
          );

          if (error.status === 403) {
            this.error.set(
              'No tiene permisos para consultar la bitacora.'
            );
          } else if (error.status === 401) {
            this.error.set(
              'Su sesion ha expirado. Inicie sesion nuevamente.'
            );
          } else {
            this.error.set(
              'No fue posible cargar los registros de auditoria.'
            );
          }

          this.cargando.set(false);
        }
      });
  }

  actualizarFiltroTexto(valor: string): void {
    this.filtroTexto.set(valor);
  }

  actualizarFiltroAccion(valor: string): void {
    this.filtroAccion.set(valor);
  }

  actualizarFiltroEntidad(valor: string): void {
    this.filtroEntidad.set(valor);
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroAccion.set('TODAS');
    this.filtroEntidad.set('TODAS');
  }
}
