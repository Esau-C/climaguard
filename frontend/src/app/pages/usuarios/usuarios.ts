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
  Usuario,
  UsuarioActualizar,
  UsuarioCrear,
  UsuariosService
} from '../../services/usuarios.service';

import {
  AuthService
} from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal('');

  mostrandoFormulario = signal(false);
  modoEdicion = signal(false);

  usuarioEditandoId = signal<number | null>(null);

  guardando = signal(false);

  formulario = {
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    rol: 'OPERADOR'
  };

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {

    this.cargando.set(true);
    this.error.set('');

    this.usuariosService
      .obtenerUsuarios()
      .subscribe({

        next: usuarios => {

          this.usuarios.set(usuarios);
          this.cargando.set(false);

        },

        error: error => {

          console.error(
            'Error al cargar usuarios:',
            error
          );

          if (error.status === 403) {

            this.error.set(
              'No tiene permisos para consultar usuarios.'
            );

          }
          else {

            this.error.set(
              'No fue posible cargar los usuarios.'
            );

          }

          this.cargando.set(false);
        }

      });
  }

  usuarioActualUsername(): string {

    return (
      this.authService
        .usuarioActual()
        ?.username || ''
    );
  }

  esUsuarioActual(usuario: Usuario): boolean {

    return (
      usuario.username ===
      this.usuarioActualUsername()
    );
  }

  abrirNuevoUsuario(): void {

    this.modoEdicion.set(false);

    this.usuarioEditandoId.set(null);

    this.formulario = {
      nombre: '',
      apellido: '',
      username: '',
      password: '',
      rol: 'OPERADOR'
    };

    this.mostrandoFormulario.set(true);
  }

  editarUsuario(usuario: Usuario): void {

    this.modoEdicion.set(true);

    this.usuarioEditandoId.set(
      usuario.idUsuario
    );

    this.formulario = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      password: '',
      rol: usuario.rol
    };

    this.mostrandoFormulario.set(true);
  }

  cerrarFormulario(): void {

    this.mostrandoFormulario.set(false);

    this.modoEdicion.set(false);

    this.usuarioEditandoId.set(null);
  }

  tieneMayuscula(): boolean {

    return /[A-Z]/.test(
      this.formulario.password
    );
  }

  tieneMinuscula(): boolean {

    return /[a-z]/.test(
      this.formulario.password
    );
  }

  tieneNumero(): boolean {

    return /[0-9]/.test(
      this.formulario.password
    );
  }

  tieneEspecial(): boolean {

    return /[^A-Za-z0-9]/.test(
      this.formulario.password
    );
  }

  tieneLongitud(): boolean {

    return (
      this.formulario.password.length >= 8
    );
  }

  esPasswordComun(): boolean {

    const password =
      this.formulario.password
        .toLowerCase()
        .trim();

    const prohibidas = [
      '123456',
      '12345678',
      '123456789',
      'password',
      'password123',
      'admin',
      'admin123',
      'qwerty',
      'qwerty123',
      'abc123',
      '111111',
      '000000'
    ];

    return prohibidas.includes(
      password
    );
  }

  puntuacionPassword(): number {

    const password =
      this.formulario.password;

    if (!password) {
      return 0;
    }

    let puntos = 0;

    if (password.length >= 8) {
      puntos++;
    }

    if (password.length >= 12) {
      puntos++;
    }

    if (this.tieneMayuscula()) {
      puntos++;
    }

    if (this.tieneMinuscula()) {
      puntos++;
    }

    if (this.tieneNumero()) {
      puntos++;
    }

    if (this.tieneEspecial()) {
      puntos++;
    }

    if (this.esPasswordComun()) {
      puntos = 0;
    }

    return puntos;
  }

  nivelPassword(): string {

    const puntos =
      this.puntuacionPassword();

    if (!this.formulario.password) {
      return '';
    }

    if (puntos <= 2) {
      return 'MUY DÉBIL';
    }

    if (puntos <= 4) {
      return 'DÉBIL';
    }

    if (puntos === 5) {
      return 'SEGURA';
    }

    return 'EXCELENTE';
  }

  clasePassword(): string {

    const puntos =
      this.puntuacionPassword();

    if (puntos <= 2) {
      return 'muy-debil';
    }

    if (puntos <= 4) {
      return 'debil';
    }

    if (puntos === 5) {
      return 'segura';
    }

    return 'excelente';
  }

  porcentajePassword(): number {

    const puntos =
      this.puntuacionPassword();

    return Math.min(
      100,
      Math.round(
        (puntos / 6) * 100
      )
    );
  }

  passwordValida(): boolean {

    if (this.esPasswordComun()) {
      return false;
    }

    return (
      this.tieneLongitud() &&
      this.tieneMayuscula() &&
      this.tieneMinuscula() &&
      this.tieneNumero() &&
      this.tieneEspecial()
    );
  }

  validarFormulario(): boolean {

    if (
      !this.formulario.nombre.trim()
    ) {

      alert(
        'El nombre es obligatorio.'
      );

      return false;
    }

    if (
      !this.formulario.apellido.trim()
    ) {

      alert(
        'El apellido es obligatorio.'
      );

      return false;
    }

    if (
      !this.formulario.username.trim()
    ) {

      alert(
        'El nombre de usuario es obligatorio.'
      );

      return false;
    }

    if (
      !this.modoEdicion() &&
      !this.formulario.password
    ) {

      alert(
        'La contraseña es obligatoria.'
      );

      return false;
    }

    if (this.formulario.password) {

      if (this.esPasswordComun()) {

        alert(
          'La contraseña es demasiado común.'
        );

        return false;
      }

      if (!this.passwordValida()) {

        alert(
          'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
        );

        return false;
      }

    }

    if (
      this.formulario.rol !== 'ADMIN' &&
      this.formulario.rol !== 'OPERADOR'
    ) {

      alert(
        'Seleccione un rol válido.'
      );

      return false;
    }

    return true;
  }

  guardarUsuario(): void {

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {

      this.actualizarUsuario();

    }
    else {

      this.crearUsuario();

    }
  }

  crearUsuario(): void {

    const nuevoUsuario: UsuarioCrear = {

      nombre:
        this.formulario.nombre.trim(),

      apellido:
        this.formulario.apellido.trim(),

      username:
        this.formulario.username.trim(),

      passwordHash:
        this.formulario.password,

      rol:
        this.formulario.rol
    };

    this.usuariosService
      .crearUsuario(
        nuevoUsuario
      )
      .subscribe({

        next: usuario => {

          this.usuarios.update(
            actuales => [
              usuario,
              ...actuales
            ]
          );

          this.guardando.set(false);

          this.cerrarFormulario();
        },

        error: error => {

          console.error(
            'Error al crear usuario:',
            error
          );

          this.guardando.set(false);

          alert(
            error.error ||
            'No fue posible crear el usuario.'
          );
        }

      });
  }

  actualizarUsuario(): void {

    const id =
      this.usuarioEditandoId();

    if (id === null) {

      this.guardando.set(false);

      return;
    }

    const usuarioActual =
      this.usuarios()
        .find(
          usuario =>
            usuario.idUsuario === id
        );

    if (!usuarioActual) {

      this.guardando.set(false);

      return;
    }

    const usuario: UsuarioActualizar = {

      idUsuario:
        usuarioActual.idUsuario,

      nombre:
        this.formulario.nombre.trim(),

      apellido:
        this.formulario.apellido.trim(),

      username:
        this.formulario.username.trim(),

      passwordHash:
        this.formulario.password,

      rol:
        this.formulario.rol,

      activo:
        usuarioActual.activo,

      fechaCreacion:
        usuarioActual.fechaCreacion
    };

    this.usuariosService
      .actualizarUsuario(
        id,
        usuario
      )
      .subscribe({

        next: () => {

          this.usuarios.update(
            actuales =>
              actuales.map(item => {

                if (
                  item.idUsuario === id
                ) {

                  return {
                    ...item,

                    nombre:
                      usuario.nombre,

                    apellido:
                      usuario.apellido,

                    username:
                      usuario.username,

                    rol:
                      usuario.rol
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
            'Error al actualizar usuario:',
            error
          );

          this.guardando.set(false);

          alert(
            error.error ||
            'No fue posible actualizar el usuario.'
          );
        }

      });
  }

  cambiarEstado(usuario: Usuario): void {

    if (this.esUsuarioActual(usuario)) {

      alert(
        'No puede desactivar su propia cuenta mientras tiene la sesión iniciada.'
      );

      return;
    }

    const nuevoEstado =
      !usuario.activo;

    this.usuariosService
      .cambiarEstado(
        usuario.idUsuario,
        nuevoEstado
      )
      .subscribe({

        next: respuesta => {

          this.usuarios.update(
            actuales =>
              actuales.map(item => {

                if (
                  item.idUsuario ===
                  usuario.idUsuario
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
            'No fue posible cambiar el estado del usuario.'
          );
        }

      });
  }
}