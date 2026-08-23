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
  cargando = signal(true);
  error = signal('');

  mostrandoFormulario = signal(false);
  modoEdicion = signal(false);

  sensorEditandoId = signal<number | null>(null);

  guardando = signal(false);

  formulario = {
    nombre: '',
    tipo: '',
    ubicacion: '',
    latitud: 0,
    longitud: 0
  };

  constructor(
    private sensoresService: SensoresService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarSensores();
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

  abrirNuevoSensor(): void {

    this.modoEdicion.set(false);
    this.sensorEditandoId.set(null);

    this.formulario = {
      nombre: '',
      tipo: '',
      ubicacion: '',
      latitud: 0,
      longitud: 0
    };

    this.mostrandoFormulario.set(true);
  }

  editarSensor(sensor: Sensor): void {

    this.modoEdicion.set(true);

    this.sensorEditandoId.set(
      sensor.idSensor
    );

    this.formulario = {
      nombre: sensor.nombre,
      tipo: sensor.tipo,
      ubicacion: sensor.ubicacion,
      latitud: sensor.latitud,
      longitud: sensor.longitud
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

    if (!this.formulario.tipo.trim()) {

      alert(
        'El tipo del sensor es obligatorio.'
      );

      return false;
    }

    if (!this.formulario.ubicacion.trim()) {

      alert(
        'La ubicación del sensor es obligatoria.'
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

    }
    else {

      this.crearSensor();

    }
  }

  crearSensor(): void {

    const nuevoSensor: SensorCrear = {

      nombre:
        this.formulario.nombre.trim(),

      tipo:
        this.formulario.tipo.trim(),

      ubicacion:
        this.formulario.ubicacion.trim(),

      latitud:
        Number(this.formulario.latitud),

      longitud:
        Number(this.formulario.longitud)
    };

    this.sensoresService
      .crearSensor(nuevoSensor)
      .subscribe({

        next: sensor => {

          this.sensores.update(
            actuales => [
              sensor,
              ...actuales
            ]
          );

          this.guardando.set(false);

          this.cerrarFormulario();
        },

        error: error => {

          console.error(
            'Error al crear sensor:',
            error
          );

          this.guardando.set(false);

          alert(
            'No fue posible crear el sensor.'
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

    const sensorActual =
      this.sensores()
        .find(
          sensor =>
            sensor.idSensor === id
        );

    if (!sensorActual) {

      this.guardando.set(false);

      return;
    }

    const sensor: SensorActualizar = {

      idSensor:
        sensorActual.idSensor,

      nombre:
        this.formulario.nombre.trim(),

      tipo:
        this.formulario.tipo.trim(),

      ubicacion:
        this.formulario.ubicacion.trim(),

      latitud:
        Number(this.formulario.latitud),

      longitud:
        Number(this.formulario.longitud),

      activo:
        sensorActual.activo,

      fechaRegistro:
        sensorActual.fechaRegistro
    };

    this.sensoresService
      .actualizarSensor(
        id,
        sensor
      )
      .subscribe({

        next: () => {

          this.sensores.update(
            actuales =>
              actuales.map(item => {

                if (
                  item.idSensor === id
                ) {

                  return {
                    ...item,
                    nombre:
                      sensor.nombre,

                    tipo:
                      sensor.tipo,

                    ubicacion:
                      sensor.ubicacion,

                    latitud:
                      sensor.latitud,

                    longitud:
                      sensor.longitud
                  };
                }

                return item;

              })
          );

          this.guardando.set(false);

          this.cerrarFormulario();
        },

        error: error => {

          console.error(
            'Error al actualizar sensor:',
            error
          );

          this.guardando.set(false);

          alert(
            'No fue posible actualizar el sensor.'
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
            'No fue posible cambiar el estado del sensor.'
          );
        }

      });
  }
}