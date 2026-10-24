
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';

import {
  DatosReglaAlerta,
  ReglaAlerta as ModeloReglaAlerta,
  ReglasAlertaService
} from '../../services/reglas-alerta';

import { AuthService } from '../../services/auth.service';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-reglas-alerta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './reglas-alerta.html',
  styleUrl: './reglas-alerta.css'
})
export class ReglasAlerta implements OnInit {

  private readonly reglasService = inject(ReglasAlertaService);
  private readonly authService = inject(AuthService);

  reglas = signal<ModeloReglaAlerta[]>([]);
  cargando = signal(false);
  guardando = signal(false);

  error = signal('');
  mensaje = signal('');

  mostrarFormulario = signal(false);
  idEdicion = signal<number | null>(null);

  filtroFenomeno = '';
  filtroNivel = '';
  filtroEstado = '';

  formulario: DatosReglaAlerta = this.crearFormularioVacio();

  readonly fenomenos = [
    'INUNDACION',
    'TORMENTA',
    'INCENDIO'
  ];

  readonly variables = [
    'temperatura',
    'humedad',
    'velocidadViento',
    'nivelLluvia',
    'nivelAgua'
  ];

  readonly operadores = [
    '>',
    '>=',
    '<',
    '<=',
    '==',
    '!='
  ];

  readonly niveles = [
    'AMARILLO',
    'NARANJA',
    'ROJO'
  ];

  ngOnInit(): void {
    this.cargarReglas();
  }

  // verificar permisos del administrador
  get esAdministrador(): boolean {
    return this.authService.esAdmin();
  }

  // filtrar reglas por fenomeno, nivel y estado
  get reglasFiltradas(): ModeloReglaAlerta[] {
    return this.reglas().filter(regla => {

      const coincideFenomeno =
        !this.filtroFenomeno ||
        regla.tipoFenomeno.toUpperCase() ===
          this.filtroFenomeno;

      const coincideNivel =
        !this.filtroNivel ||
        regla.nivel.toUpperCase() ===
          this.filtroNivel;

      const coincideEstado =
        !this.filtroEstado ||
        (this.filtroEstado === 'ACTIVA'
          ? regla.activa
          : !regla.activa);

      return coincideFenomeno &&
        coincideNivel &&
        coincideEstado;
    });
  }

  // obtener las reglas desde la api
  cargarReglas(): void {
    this.cargando.set(true);
    this.error.set('');

    this.reglasService.obtenerReglas().subscribe({
      next: reglas => {
        this.reglas.set(reglas);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          this.obtenerMensajeError(error)
        );
        this.cargando.set(false);
      }
    });
  }

  // abrir formulario para crear una regla
  abrirFormulario(): void {
    if (!this.esAdministrador) {
      return;
    }

    this.formulario = this.crearFormularioVacio();

    this.idEdicion.set(null);
    this.mostrarFormulario.set(true);

    this.error.set('');
    this.mensaje.set('');
  }

  // cargar los datos para editar una regla
  editarRegla(regla: ModeloReglaAlerta): void {
    if (!this.esAdministrador) {
      return;
    }

    this.idEdicion.set(regla.idReglaAlerta);

    this.formulario = {
      nombre: regla.nombre,
      tipoFenomeno: regla.tipoFenomeno,
      variable: regla.variable,
      operador: regla.operador,
      umbral: regla.umbral,
      variableSecundaria: regla.variableSecundaria,
      operadorSecundario: regla.operadorSecundario,
      umbralSecundario: regla.umbralSecundario,
      nivel: regla.nivel,
      titulo: regla.titulo,
      mensaje: regla.mensaje,
      activa: regla.activa
    };

    this.mostrarFormulario.set(true);

    this.error.set('');
    this.mensaje.set('');
  }

  // cancelar la creacion o edicion
  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.idEdicion.set(null);

    this.formulario = this.crearFormularioVacio();

    this.error.set('');
  }

  // crear o actualizar una regla
  guardarRegla(): void {
    if (!this.esAdministrador || this.guardando()) {
      return;
    }

    this.error.set('');
    this.mensaje.set('');

    const datos: DatosReglaAlerta = {
      ...this.formulario,

      nombre:
        this.formulario.nombre.trim(),

      tipoFenomeno:
        this.formulario.tipoFenomeno
          .trim()
          .toUpperCase(),

      variable:
        this.formulario.variable.trim(),

      operador:
        this.formulario.operador.trim(),

      nivel:
        this.formulario.nivel
          .trim()
          .toUpperCase(),

      titulo:
        this.formulario.titulo.trim(),

      mensaje:
        this.formulario.mensaje.trim(),

      variableSecundaria:
        this.formulario.variableSecundaria || null,

      operadorSecundario:
        this.formulario.variableSecundaria
          ? this.formulario.operadorSecundario || null
          : null,

      umbralSecundario:
        this.formulario.variableSecundaria
          ? this.formulario.umbralSecundario
          : null
    };

    // validar campos obligatorios
    if (
      !datos.nombre ||
      !datos.tipoFenomeno ||
      !datos.variable ||
      !datos.operador ||
      !datos.nivel ||
      !datos.titulo ||
      !datos.mensaje
    ) {
      this.error.set(
        'Completa los campos obligatorios.'
      );
      return;
    }

    // validar el umbral principal
    if (!Number.isFinite(Number(datos.umbral))) {
      this.error.set(
        'El umbral principal debe ser un numero valido.'
      );
      return;
    }

    datos.umbral = Number(datos.umbral);

    // validar la condicion secundaria
    if (datos.variableSecundaria) {

      if (
        !datos.operadorSecundario ||
        datos.umbralSecundario === null ||
        datos.umbralSecundario === undefined ||
        !Number.isFinite(Number(datos.umbralSecundario))
      ) {
        this.error.set(
          'Completa correctamente la condicion secundaria.'
        );
        return;
      }

      datos.umbralSecundario =
        Number(datos.umbralSecundario);
    }

    this.guardando.set(true);

    const id = this.idEdicion();

    // unificar los tipos de respuesta de crear y actualizar
    const peticion = id === null
      ? this.reglasService.crearRegla(datos).pipe(
          map(() => null)
        )
      : this.reglasService.actualizarRegla(id, datos).pipe(
          map(() => null)
        );

    peticion.subscribe({
      next: () => {

        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.idEdicion.set(null);

        this.formulario =
          this.crearFormularioVacio();

        this.mensaje.set(
          id === null
            ? 'Regla creada correctamente.'
            : 'Regla actualizada correctamente.'
        );

        this.cargarReglas();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);

        this.error.set(
          this.obtenerMensajeError(error)
        );
      }
    });
  }

  // activar o desactivar una regla
  cambiarEstado(regla: ModeloReglaAlerta): void {
    if (!this.esAdministrador || this.guardando()) {
      return;
    }

    const nuevoEstado = !regla.activa;

    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.reglasService
      .cambiarEstado(
        regla.idReglaAlerta,
        nuevoEstado
      )
      .subscribe({
        next: respuesta => {

          this.guardando.set(false);

          this.mensaje.set(
            respuesta.mensaje
          );

          this.cargarReglas();
        },

        error: (error: HttpErrorResponse) => {

          this.guardando.set(false);

          this.error.set(
            this.obtenerMensajeError(error)
          );
        }
      });
  }

  // restablecer los filtros
  limpiarFiltros(): void {
    this.filtroFenomeno = '';
    this.filtroNivel = '';
    this.filtroEstado = '';
  }

  // limpiar la condicion secundaria
  limpiarCondicionSecundaria(): void {
    if (!this.formulario.variableSecundaria) {
      this.formulario.operadorSecundario = null;
      this.formulario.umbralSecundario = null;
    }
  }

  // crear formulario con valores iniciales
  private crearFormularioVacio(): DatosReglaAlerta {
    return {
      nombre: '',
      tipoFenomeno: 'INUNDACION',
      variable: 'nivelAgua',
      operador: '>=',
      umbral: 0,
      variableSecundaria: null,
      operadorSecundario: null,
      umbralSecundario: null,
      nivel: 'AMARILLO',
      titulo: '',
      mensaje: '',
      activa: true
    };
  }

  // obtener mensajes de error de la api
  private obtenerMensajeError(
    error: HttpErrorResponse
  ): string {

    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.error?.mensaje ||
      'Ocurrio un error al comunicarse con el servidor.';
  }
}
