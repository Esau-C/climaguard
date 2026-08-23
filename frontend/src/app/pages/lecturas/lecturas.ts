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
  Lectura,
  LecturasService
} from '../../services/lecturas.service';

@Component({
  selector: 'app-lecturas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './lecturas.html',
  styleUrl: './lecturas.css'
})
export class Lecturas implements OnInit {

  lecturas = signal<Lectura[]>([]);
  cargando = signal(true);
  error = signal('');

  filtroSensor = signal('');
  filtroFecha = signal('');
  busqueda = signal('');

  paginaActual = signal(1);
  elementosPorPagina = signal(5);

  lecturasFiltradas = computed(() => {

    const sensor =
      this.filtroSensor()
        .trim()
        .toLowerCase();

    const fecha =
      this.filtroFecha();

    const texto =
      this.busqueda()
        .trim()
        .toLowerCase();

    return this.lecturas().filter(
      lectura => {

        const nombreSensor =
          lectura.sensor?.nombre
            ?.toLowerCase() || '';

        const ubicacion =
          lectura.sensor?.ubicacion
            ?.toLowerCase() || '';

        const idLectura =
          lectura.idLectura
            .toString();

        const idSensor =
          lectura.idSensor
            .toString();

        const cumpleSensor =
          !sensor ||
          nombreSensor.includes(sensor) ||
          idSensor === sensor;

        let cumpleFecha = true;

        if (fecha) {

          const fechaLectura =
            new Date(
              lectura.fechaLectura
            );

          const fechaLocal =
            [
              fechaLectura.getFullYear(),

              String(
                fechaLectura.getMonth() + 1
              ).padStart(2, '0'),

              String(
                fechaLectura.getDate()
              ).padStart(2, '0')
            ].join('-');

          cumpleFecha =
            fechaLocal === fecha;
        }

        const cumpleBusqueda =
          !texto ||
          nombreSensor.includes(texto) ||
          ubicacion.includes(texto) ||
          idLectura.includes(texto) ||
          idSensor.includes(texto);

        return (
          cumpleSensor &&
          cumpleFecha &&
          cumpleBusqueda
        );
      }
    );
  });

  totalPaginas = computed(() => {

    return Math.max(
      1,
      Math.ceil(
        this.lecturasFiltradas().length /
        this.elementosPorPagina()
      )
    );
  });

  lecturasPaginadas = computed(() => {

    const pagina =
      Math.min(
        this.paginaActual(),
        this.totalPaginas()
      );

    const inicio =
      (pagina - 1) *
      this.elementosPorPagina();

    const fin =
      inicio +
      this.elementosPorPagina();

    return this.lecturasFiltradas()
      .slice(
        inicio,
        fin
      );
  });

  sensoresDisponibles = computed(() => {

    const sensores = new Map<
      number,
      string
    >();

    this.lecturas().forEach(
      lectura => {

        if (lectura.sensor) {

          sensores.set(
            lectura.idSensor,
            lectura.sensor.nombre
          );
        }

      }
    );

    return Array.from(
      sensores.entries()
    ).map(
      ([idSensor, nombre]) => ({
        idSensor,
        nombre
      })
    );
  });

  constructor(
    private lecturasService: LecturasService
  ) {}

  ngOnInit(): void {

    this.cargarLecturas();
  }

  cargarLecturas(): void {

    this.cargando.set(true);
    this.error.set('');

    this.lecturasService
      .obtenerLecturas()
      .subscribe({

        next: lecturas => {

          this.lecturas.set(lecturas);

          this.paginaActual.set(1);

          this.cargando.set(false);
        },

        error: error => {

          console.error(
            'Error al cargar lecturas:',
            error
          );

          this.error.set(
            'No fue posible cargar las lecturas.'
          );

          this.cargando.set(false);
        }

      });
  }

  cambiarSensor(
    valor: string
  ): void {

    this.filtroSensor.set(valor);
    this.paginaActual.set(1);
  }

  cambiarFecha(
    valor: string
  ): void {

    this.filtroFecha.set(valor);
    this.paginaActual.set(1);
  }

  cambiarBusqueda(
    valor: string
  ): void {

    this.busqueda.set(valor);
    this.paginaActual.set(1);
  }

  cambiarElementosPorPagina(
    valor: number
  ): void {

    this.elementosPorPagina.set(
      Number(valor)
    );

    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {

    this.filtroSensor.set('');
    this.filtroFecha.set('');
    this.busqueda.set('');
    this.paginaActual.set(1);
  }

  paginaAnterior(): void {

    if (this.paginaActual() > 1) {

      this.paginaActual.update(
        pagina => pagina - 1
      );
    }
  }

  paginaSiguiente(): void {

    if (
      this.paginaActual() <
      this.totalPaginas()
    ) {

      this.paginaActual.update(
        pagina => pagina + 1
      );
    }
  }

  irPagina(
    pagina: number
  ): void {

    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas()
    ) {

      this.paginaActual.set(
        pagina
      );
    }
  }

  paginas(): number[] {

    return Array.from(
      {
        length:
          this.totalPaginas()
      },
      (_, indice) =>
        indice + 1
    );
  }

  esTemperaturaCritica(
    valor: number | null | undefined
  ): boolean {

    return (
      valor !== null &&
      valor !== undefined &&
      Number(valor) >= 40
    );
  }

  esHumedadAlta(
    valor: number | null | undefined
  ): boolean {

    return (
      valor !== null &&
      valor !== undefined &&
      Number(valor) >= 80
    );
  }

  esVientoCritico(
    valor: number | null | undefined
  ): boolean {

    return (
      valor !== null &&
      valor !== undefined &&
      Number(valor) >= 70
    );
  }

  esLluviaCritica(
    valor: number | null | undefined
  ): boolean {

    return (
      valor !== null &&
      valor !== undefined &&
      Number(valor) >= 70
    );
  }

  esNivelAguaCritico(
    valor: number | null | undefined
  ): boolean {

    return (
      valor !== null &&
      valor !== undefined &&
      Number(valor) >= 3
    );
  }
}