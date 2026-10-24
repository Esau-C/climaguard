import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';

import {
  Comunidad,
  ComunidadesService,
  CrearComunidad,
  ActualizarComunidad
} from '../../services/comunidades.service';

@Component({
  selector: 'app-comunidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './comunidades.html',
  styleUrl: './comunidades.css'
})
export class Comunidades implements OnInit {

  comunidades = signal<Comunidad[]>([]);

  cargando = signal(false);

  mensaje = signal('');

  error = signal('');

  mostrarFormulario = signal(false);

  editando = signal(false);

  idComunidadEditando: number | null = null;

  formulario = {
    nombre: '',
    municipio: '',
    departamento: '',
    pais: 'Guatemala',
    latitud: null as number | null,
    longitud: null as number | null,
    descripcion: ''
  };

  constructor(
    private comunidadesService: ComunidadesService
  ) {}

  ngOnInit(): void {
    this.cargarComunidades();
  }

  cargarComunidades(): void {

    this.cargando.set(true);
    this.error.set('');

    this.comunidadesService
      .obtenerComunidades()
      .subscribe({
        next: respuesta => {

          this.comunidades.set(respuesta);

          this.cargando.set(false);
        },

        error: err => {

          console.error(err);

          this.error.set(
            'No se pudieron cargar las comunidades.'
          );

          this.cargando.set(false);
        }
      });
  }

  abrirFormulario(): void {

    this.limpiarFormulario();

    this.editando.set(false);

    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {

    this.mostrarFormulario.set(false);

    this.editando.set(false);

    this.idComunidadEditando = null;

    this.limpiarFormulario();
  }

  editarComunidad(
    comunidad: Comunidad
  ): void {

    this.idComunidadEditando =
      comunidad.idComunidad;

    this.formulario = {
      nombre:
        comunidad.nombre,

      municipio:
        comunidad.municipio,

      departamento:
        comunidad.departamento,

      pais:
        comunidad.pais,

      latitud:
        comunidad.latitud,

      longitud:
        comunidad.longitud,

      descripcion:
        comunidad.descripcion ?? ''
    };

    this.editando.set(true);

    this.mostrarFormulario.set(true);
  }

  guardarComunidad(): void {

    this.mensaje.set('');
    this.error.set('');

    if (
      !this.formulario.nombre.trim() ||
      !this.formulario.municipio.trim() ||
      !this.formulario.departamento.trim() ||
      !this.formulario.pais.trim()
    ) {

      this.error.set(
        'Complete todos los campos obligatorios.'
      );

      return;
    }

    if (this.editando()) {

      this.actualizarComunidad();

    } else {

      this.crearComunidad();
    }
  }

  private crearComunidad(): void {

    const datos: CrearComunidad = {

      nombre:
        this.formulario.nombre.trim(),

      municipio:
        this.formulario.municipio.trim(),

      departamento:
        this.formulario.departamento.trim(),

      pais:
        this.formulario.pais.trim(),

      latitud:
        this.formulario.latitud,

      longitud:
        this.formulario.longitud,

      descripcion:
        this.formulario.descripcion.trim() || null
    };

    this.comunidadesService
      .crearComunidad(datos)
      .subscribe({
        next: () => {

          this.mensaje.set(
            'Comunidad creada correctamente.'
          );

          this.cerrarFormulario();

          this.cargarComunidades();
        },

        error: err => {

          console.error(err);

          this.error.set(
            this.obtenerMensajeError(
              err,
              'No se pudo crear la comunidad.'
            )
          );
        }
      });
  }

  private actualizarComunidad(): void {

    if (this.idComunidadEditando === null) {
      return;
    }

    const datos: ActualizarComunidad = {

      nombre:
        this.formulario.nombre.trim(),

      municipio:
        this.formulario.municipio.trim(),

      departamento:
        this.formulario.departamento.trim(),

      pais:
        this.formulario.pais.trim(),

      latitud:
        this.formulario.latitud,

      longitud:
        this.formulario.longitud,

      descripcion:
        this.formulario.descripcion.trim() || null
    };

    this.comunidadesService
      .actualizarComunidad(
        this.idComunidadEditando,
        datos
      )
      .subscribe({
        next: () => {

          this.mensaje.set(
            'Comunidad actualizada correctamente.'
          );

          this.cerrarFormulario();

          this.cargarComunidades();
        },

        error: err => {

          console.error(err);

          this.error.set(
            this.obtenerMensajeError(
              err,
              'No se pudo actualizar la comunidad.'
            )
          );
        }
      });
  }

  cambiarEstado(
    comunidad: Comunidad
  ): void {

    const nuevoEstado =
      !comunidad.activa;

    this.mensaje.set('');
    this.error.set('');

    this.comunidadesService
      .cambiarEstado(
        comunidad.idComunidad,
        nuevoEstado
      )
      .subscribe({
        next: () => {

          this.mensaje.set(
            nuevoEstado
              ? 'Comunidad activada correctamente.'
              : 'Comunidad desactivada correctamente.'
          );

          this.cargarComunidades();
        },

        error: err => {

          console.error(err);

          this.error.set(
            this.obtenerMensajeError(
              err,
              'No se pudo cambiar el estado de la comunidad.'
            )
          );
        }
      });
  }

  private limpiarFormulario(): void {

    this.formulario = {
      nombre: '',
      municipio: '',
      departamento: '',
      pais: 'Guatemala',
      latitud: null,
      longitud: null,
      descripcion: ''
    };
  }

  private obtenerMensajeError(
    error: any,
    mensajePredeterminado: string
  ): string {

    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error?.mensaje) {
      return error.error.mensaje;
    }

    return mensajePredeterminado;
  }
}