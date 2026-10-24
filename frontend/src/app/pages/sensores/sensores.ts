import {
  Component,
  OnInit,
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
  Sensor,
  SensorActualizar,
  SensorCrear,
  SensoresService
} from '../../services/sensores.service';

import {
  Comunidad,
  ComunidadesService
} from '../../services/comunidades.service';

import {
  AuthService
} from '../../services/auth.service';

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './sensores.html',
  styleUrl: './sensores.css'
})
export class Sensores implements OnInit {

  sensores = signal<Sensor[]>([]);
  comunidades = signal<Comunidad[]>([]);

  cargando = signal(true);
  error = signal('');

  mostrandoFormulario = signal(false);
  modoEdicion = signal(false);

  sensorEditandoId = signal<number | null>(null);

  guardando = signal(false);

  formulario = {
    nombre: '',
    codigo: '',
    tipo: '',
    idComunidad: 0,
    ubicacion: '',
    unidadMedida: '',
    latitud: 0,
    longitud: 0,
    fechaInstalacion: '',
    descripcion: ''
  };

  constructor(
    private sensoresService: SensoresService,
    private comunidadesService: ComunidadesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.cargarSensores();
    this.cargarComunidades();
  }

  esAdmin(): boolean {

    return this.authService.esAdmin();
  }

  cargarSensores(): void {

    this.cargando.set(true);
    this.error.set('');

    this.sensoresService
      .obtenerSensores()
      .subscribe({

        next: sensores => {

          this.sensores.set(sensores);
          this.cargando.set(false);
        },

        error: error => {

          console.error(
            'Error al cargar sensores:',
            error
          );

          this.error.set(
            'No fue posible cargar los sensores.'
          );

          this.cargando.set(false);
        }

      });
  }

  cargarComunidades(): void {

    this.comunidadesService
      .obtenerComunidades()
      .subscribe({

        next: comunidades => {

          this.comunidades.set(
            comunidades.filter(
              comunidad => comunidad.activa
            )
          );
        },

        error: error => {

          console.error(
            'Error al cargar comunidades:',
            error
          );
        }

      });
  }

  abrirNuevoSensor(): void {

    this.modoEdicion.set(false);
    this.sensorEditandoId.set(null);

    this.formulario = {
      nombre: '',
      codigo: '',
      tipo: '',
      idComunidad: 0,
      ubicacion: '',
      unidadMedida: '',
      latitud: 0,
      longitud: 0,
      fechaInstalacion: '',
      descripcion: ''
    };

    this.mostrandoFormulario.set(true);
  }

  editarSensor(sensor: Sensor): void {

    this.modoEdicion.set(true);

    this.sensorEditandoId.set(
      sensor.idSensor
    );

    this.formulario = {

      nombre:
        sensor.nombre,

      codigo:
        sensor.codigo ?? '',

      tipo:
        sensor.tipo,

      idComunidad:
        sensor.idComunidad ?? 0,

      ubicacion:
        sensor.ubicacion,

      unidadMedida:
        sensor.unidadMedida ?? '',

      latitud:
        sensor.latitud,

      longitud:
        sensor.longitud,

      fechaInstalacion:
        sensor.fechaInstalacion
          ? sensor.fechaInstalacion.substring(0, 10)
          : '',

      descripcion:
        sensor.descripcion ?? ''
    };

    this.mostrandoFormulario.set(true);
  }

  cerrarFormulario(): void {

    this.mostrandoFormulario.set(false);
    this.modoEdicion.set(false);
    this.sensorEditandoId.set(null);
  }

  validarFormulario(): boolean {

    if (!this.formulario.nombre.trim()) {

      alert(
        'El nombre del sensor es obligatorio.'
      );

      return false;
    }

    if (!this.formulario.codigo.trim()) {

      alert(
        'El código del sensor es obligatorio.'
      );

      return false;
    }

    if (!this.formulario.tipo.trim()) {

      alert(
        'El tipo del sensor es obligatorio.'
      );

      return false;
    }

    if (
      !this.formulario.idComunidad ||
      Number(this.formulario.idComunidad) <= 0
    ) {

      alert(
        'Debe seleccionar una comunidad.'
      );

      return false;
    }

    if (!this.formulario.ubicacion.trim()) {

      alert(
        'La ubicación del sensor es obligatoria.'
      );

      return false;
    }

    if (!this.formulario.unidadMedida.trim()) {

      alert(
        'La unidad de medida es obligatoria.'
      );

      return false;
    }

    const latitud =
      Number(this.formulario.latitud);

    const longitud =
      Number(this.formulario.longitud);

    if (Number.isNaN(latitud)) {

      alert(
        'La latitud debe ser un número válido.'
      );

      return false;
    }

    if (Number.isNaN(longitud)) {

      alert(
        'La longitud debe ser un número válido.'
      );

      return false;
    }

    if (
      latitud < -90 ||
      latitud > 90
    ) {

      alert(
        'La latitud debe estar entre -90 y 90.'
      );

      return false;
    }

    if (
      longitud < -180 ||
      longitud > 180
    ) {

      alert(
        'La longitud debe estar entre -180 y 180.'
      );

      return false;
    }

    return true;
  }

  guardarSensor(): void {

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {

      this.actualizarSensor();

    } else {

      this.crearSensor();
    }
  }

  crearSensor(): void {

    const nuevoSensor: SensorCrear = {

      nombre:
        this.formulario.nombre.trim(),

      codigo:
        this.formulario.codigo.trim(),

      tipo:
        this.formulario.tipo.trim(),

      idComunidad:
        Number(this.formulario.idComunidad),

      ubicacion:
        this.formulario.ubicacion.trim(),

      unidadMedida:
        this.formulario.unidadMedida.trim(),

      latitud:
        Number(this.formulario.latitud),

      longitud:
        Number(this.formulario.longitud),

      fechaInstalacion:
        this.formulario.fechaInstalacion
          ? this.formulario.fechaInstalacion
          : null,

      descripcion:
        this.formulario.descripcion.trim()
          ? this.formulario.descripcion.trim()
          : null
    };

    this.sensoresService
      .crearSensor(nuevoSensor)
      .subscribe({

        next: () => {

          this.guardando.set(false);

          this.cerrarFormulario();

          this.cargarSensores();
        },

        error: error => {

          console.error(
            'Error al crear sensor:',
            error
          );

          this.guardando.set(false);

          alert(
            this.obtenerMensajeError(
              error,
              'No fue posible crear el sensor.'
            )
          );
        }

      });
  }

  actualizarSensor(): void {

    const id =
      this.sensorEditandoId();

    if (id === null) {

      this.guardando.set(false);

      return;
    }

    const sensor: SensorActualizar = {

      nombre:
        this.formulario.nombre.trim(),

      codigo:
        this.formulario.codigo.trim(),

      tipo:
        this.formulario.tipo.trim(),

      idComunidad:
        Number(this.formulario.idComunidad),

      ubicacion:
        this.formulario.ubicacion.trim(),

      unidadMedida:
        this.formulario.unidadMedida.trim(),

      latitud:
        Number(this.formulario.latitud),

      longitud:
        Number(this.formulario.longitud),

      fechaInstalacion:
        this.formulario.fechaInstalacion
          ? this.formulario.fechaInstalacion
          : null,

      descripcion:
        this.formulario.descripcion.trim()
          ? this.formulario.descripcion.trim()
          : null
    };

    this.sensoresService
      .actualizarSensor(
        id,
        sensor
      )
      .subscribe({

        next: () => {

          this.guardando.set(false);

          this.cerrarFormulario();

          this.cargarSensores();
        },

        error: error => {

          console.error(
            'Error al actualizar sensor:',
            error
          );

          this.guardando.set(false);

          alert(
            this.obtenerMensajeError(
              error,
              'No fue posible actualizar el sensor.'
            )
          );
        }

      });
  }

  cambiarEstado(sensor: Sensor): void {

    const nuevoEstado =
      !sensor.activo;

    this.sensoresService
      .cambiarEstado(
        sensor.idSensor,
        nuevoEstado
      )
      .subscribe({

        next: respuesta => {

          this.sensores.update(
            actuales =>
              actuales.map(item => {

                if (
                  item.idSensor ===
                  sensor.idSensor
                ) {

                  return {
                    ...item,
                    activo:
                      respuesta.activo
                  };
                }

                return item;
              })
          );
        },

        error: error => {

          console.error(
            'Error al cambiar estado:',
            error
          );

          alert(
            this.obtenerMensajeError(
              error,
              'No fue posible cambiar el estado del sensor.'
            )
          );
        }

      });
  }

  private obtenerMensajeError(
    error: any,
    mensajePredeterminado: string
  ): string {

    if (
      typeof error?.error === 'string'
    ) {

      return error.error;
    }

    if (
      error?.error?.mensaje
    ) {

      return error.error.mensaje;
    }

    if (
      error?.error?.title
    ) {

      return error.error.title;
    }

    return mensajePredeterminado;
  }
}