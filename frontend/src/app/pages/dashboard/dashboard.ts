import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  Navbar
} from '../../components/navbar/navbar';

import {
  AlertaSignalR,
  SignalrService
} from '../../services/signalr.service';

import {
  SensoresService
} from '../../services/sensores.service';

import {
  Lectura,
  LecturasService
} from '../../services/lecturas.service';

import {
  Alerta,
  AlertasService
} from '../../services/alertas.service';


type VariableGrafica =
  | 'todas'
  | 'temperatura'
  | 'humedad'
  | 'viento'
  | 'lluvia'
  | 'agua';


interface PuntoGrafica {
  x: number;
  y: number;
  valor: number;
  indice: number;
}


interface TooltipGrafica {
  visible: boolean;
  left: string;
  top: string;
  titulo: string;
  valor: string;
  hora: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  alertasTiempoReal =
    signal<AlertaSignalR[]>([]);


  totalSensores =
    signal(0);

  totalLecturas =
    signal(0);

  alertasActivas =
    signal(0);

  alertasRojas =
    signal(0);


  ultimaTemperatura =
    signal<number | null>(null);

  ultimaHumedad =
    signal<number | null>(null);

  ultimoNivelAgua =
    signal<number | null>(null);

  ultimaVelocidadViento =
    signal<number | null>(null);

  ultimoNivelLluvia =
    signal<number | null>(null);

  fechaUltimaLectura =
    signal<string | null>(null);


  ultimasLecturas =
    signal<Lectura[]>([]);


  variableGrafica =
    signal<VariableGrafica>('todas');


  tooltipGrafica =
    signal<TooltipGrafica>({
      visible: false,
      left: '0%',
      top: '0%',
      titulo: '',
      valor: '',
      hora: ''
    });


  /* =========================================
     ESTADO GENERAL
  ========================================= */

  estadoGeneral = computed(() => {

    const temperatura =
      this.ultimaTemperatura();

    const viento =
      this.ultimaVelocidadViento();

    const lluvia =
      this.ultimoNivelLluvia();

    const nivelAgua =
      this.ultimoNivelAgua();


    if (
      temperatura === null &&
      viento === null &&
      lluvia === null &&
      nivelAgua === null
    ) {
      return 'SIN DATOS';
    }


    // rojo
    if (
      (
        temperatura !== null &&
        temperatura >= 45
      ) ||
      (
        viento !== null &&
        viento >= 80
      ) ||
      (
        lluvia !== null &&
        lluvia >= 80
      ) ||
      (
        nivelAgua !== null &&
        nivelAgua >= 3
      )
    ) {
      return 'CRÍTICO';
    }


    // naranja
    if (
      (
        temperatura !== null &&
        temperatura >= 40
      ) ||
      (
        viento !== null &&
        viento >= 60
      ) ||
      (
        lluvia !== null &&
        lluvia >= 50
      ) ||
      (
        nivelAgua !== null &&
        nivelAgua >= 2
      )
    ) {
      return 'ALTO';
    }


    // amarillo
    if (
      (
        temperatura !== null &&
        temperatura >= 35
      ) ||
      (
        viento !== null &&
        viento >= 40
      ) ||
      (
        lluvia !== null &&
        lluvia >= 30
      ) ||
      (
        nivelAgua !== null &&
        nivelAgua >= 1.5
      )
    ) {
      return 'PRECAUCIÓN';
    }


    return 'NORMAL';
  });


  /* =========================================
     VARIABLE GRAFICA
  ========================================= */

  nombreVariableGrafica = computed(() => {

    switch (
      this.variableGrafica()
    ) {

      case 'todas':
        return 'Todas las variables';

      case 'temperatura':
        return 'Temperatura';

      case 'humedad':
        return 'Humedad';

      case 'viento':
        return 'Velocidad del viento';

      case 'lluvia':
        return 'Nivel de lluvia';

      case 'agua':
        return 'Nivel de agua';

      default:
        return 'Variable';
    }
  });


  unidadVariableGrafica = computed(() => {

    switch (
      this.variableGrafica()
    ) {

      case 'temperatura':
        return '°C';

      case 'humedad':
        return '%';

      default:
        return '';
    }
  });


  claseVariableGrafica = computed(() => {

    switch (
      this.variableGrafica()
    ) {

      case 'temperatura':
        return 'temperatura';

      case 'humedad':
        return 'humedad';

      case 'viento':
        return 'viento';

      case 'lluvia':
        return 'lluvia';

      case 'agua':
        return 'agua';

      default:
        return 'todas';
    }
  });


  mostrarTodas = computed(() => {

    return (
      this.variableGrafica() === 'todas'
    );
  });


  /* =========================================
     LINEAS GRAFICA
  ========================================= */

  puntosTemperatura = computed(() => {

    return this.generarPuntos(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.temperatura ?? 0
          )
      ),
      0,
      50
    );
  });


  puntosHumedad = computed(() => {

    return this.generarPuntos(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.humedad ?? 0
          )
      ),
      0,
      100
    );
  });


  puntosViento = computed(() => {

    return this.generarPuntos(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.velocidadViento ?? 0
          )
      ),
      0,
      100
    );
  });


  puntosLluvia = computed(() => {

    return this.generarPuntos(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.nivelLluvia ?? 0
          )
      ),
      0,
      100
    );
  });


  puntosAgua = computed(() => {

    return this.generarPuntos(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.nivelAgua ?? 0
          )
      ),
      0,
      5
    );
  });


  valoresGrafica = computed(() => {

    return this.ultimasLecturas()
      .map(
        lectura => {

          switch (
            this.variableGrafica()
          ) {

            case 'temperatura':
              return Number(
                lectura.temperatura ?? 0
              );

            case 'humedad':
              return Number(
                lectura.humedad ?? 0
              );

            case 'viento':
              return Number(
                lectura.velocidadViento ?? 0
              );

            case 'lluvia':
              return Number(
                lectura.nivelLluvia ?? 0
              );

            case 'agua':
              return Number(
                lectura.nivelAgua ?? 0
              );

            default:
              return 0;
          }
        }
      );
  });


  maximoGrafica = computed(() => {

    switch (
      this.variableGrafica()
    ) {

      case 'temperatura':
        return 50;

      case 'humedad':
        return 100;

      case 'viento':
        return 100;

      case 'lluvia':
        return 100;

      case 'agua':
        return 5;

      default:
        return 100;
    }
  });


  puntosGrafica = computed(() => {

    return this.generarPuntos(
      this.valoresGrafica(),
      0,
      this.maximoGrafica()
    );
  });


  /* =========================================
     COORDENADAS
  ========================================= */

  coordenadasTemperatura = computed(() => {

    return this.generarCoordenadas(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.temperatura ?? 0
          )
      ),
      0,
      50
    );
  });


  coordenadasHumedad = computed(() => {

    return this.generarCoordenadas(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.humedad ?? 0
          )
      ),
      0,
      100
    );
  });


  coordenadasViento = computed(() => {

    return this.generarCoordenadas(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.velocidadViento ?? 0
          )
      ),
      0,
      100
    );
  });


  coordenadasLluvia = computed(() => {

    return this.generarCoordenadas(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.nivelLluvia ?? 0
          )
      ),
      0,
      100
    );
  });


  coordenadasAgua = computed(() => {

    return this.generarCoordenadas(
      this.ultimasLecturas().map(
        lectura =>
          Number(
            lectura.nivelAgua ?? 0
          )
      ),
      0,
      5
    );
  });


  coordenadasGrafica = computed(() => {

    return this.generarCoordenadas(
      this.valoresGrafica(),
      0,
      this.maximoGrafica()
    );
  });


  constructor(
    private signalrService:
      SignalrService,

    private sensoresService:
      SensoresService,

    private lecturasService:
      LecturasService,

    private alertasService:
      AlertasService
  ) {}


  ngOnInit(): void {

    this.cargarEstadisticas();

    this.cargarUltimasAlertas();

    this.signalrService
      .iniciarConexion();


    this.signalrService
      .nuevaAlerta$
      .subscribe(
        alerta => {

          this.alertasTiempoReal
            .update(
              actuales => [
                alerta,
                ...actuales
              ].slice(
                0,
                5
              )
            );

          this.actualizarEstadisticas();
        }
      );
  }


  /* =========================================
     CARGAR ESTADISTICAS
  ========================================= */

  cargarEstadisticas(): void {

    this.sensoresService
      .obtenerSensores()
      .subscribe({

        next: sensores => {

          this.totalSensores.set(
            sensores.length
          );
        },

        error: error => {

          console.error(
            'Error al cargar sensores:',
            error
          );
        }

      });


    this.lecturasService
      .obtenerLecturas()
      .subscribe({

        next: lecturas => {

          this.totalLecturas.set(
            lecturas.length
          );

          this.actualizarUltimaLectura(
            lecturas
          );

          this.actualizarGrafica(
            lecturas
          );
        },

        error: error => {

          console.error(
            'Error al cargar lecturas:',
            error
          );
        }

      });


    this.alertasService
      .obtenerAlertas()
      .subscribe({

        next: alertas => {

          this.alertasActivas.set(
            alertas.filter(
              alerta =>
                alerta.estado === 'ACTIVA'
            ).length
          );


          this.alertasRojas.set(
            alertas.filter(
              alerta =>
                alerta.nivel === 'ROJO'
            ).length
          );
        },

        error: error => {

          console.error(
            'Error al cargar alertas:',
            error
          );
        }

      });
  }


  /* =========================================
     ULTIMA LECTURA
  ========================================= */

  actualizarUltimaLectura(
    lecturas: Lectura[]
  ): void {

    if (
      lecturas.length === 0
    ) {

      this.ultimaTemperatura.set(null);

      this.ultimaHumedad.set(null);

      this.ultimoNivelAgua.set(null);

      this.ultimaVelocidadViento.set(null);

      this.ultimoNivelLluvia.set(null);

      this.fechaUltimaLectura.set(null);

      return;
    }


    const ordenadas = [
      ...lecturas
    ].sort(
      (a, b) =>

        new Date(
          b.fechaLectura
        ).getTime() -

        new Date(
          a.fechaLectura
        ).getTime()
    );


    const ultima =
      ordenadas[0];


    this.ultimaTemperatura.set(
      ultima.temperatura !== null &&
      ultima.temperatura !== undefined

        ? Number(
            ultima.temperatura
          )

        : null
    );


    this.ultimaHumedad.set(
      ultima.humedad !== null &&
      ultima.humedad !== undefined

        ? Number(
            ultima.humedad
          )

        : null
    );


    this.ultimoNivelAgua.set(
      ultima.nivelAgua !== null &&
      ultima.nivelAgua !== undefined

        ? Number(
            ultima.nivelAgua
          )

        : null
    );


    this.ultimaVelocidadViento.set(
      ultima.velocidadViento !== null &&
      ultima.velocidadViento !== undefined

        ? Number(
            ultima.velocidadViento
          )

        : null
    );


    this.ultimoNivelLluvia.set(
      ultima.nivelLluvia !== null &&
      ultima.nivelLluvia !== undefined

        ? Number(
            ultima.nivelLluvia
          )

        : null
    );


    this.fechaUltimaLectura.set(
      ultima.fechaLectura
    );
  }


  /* =========================================
     ACTUALIZAR GRAFICA
  ========================================= */

  actualizarGrafica(
    lecturas: Lectura[]
  ): void {

    const ultimas = [
      ...lecturas
    ]
      .sort(
        (a, b) =>

          new Date(
            a.fechaLectura
          ).getTime() -

          new Date(
            b.fechaLectura
          ).getTime()
      )
      .slice(-10);


    this.ultimasLecturas.set(
      ultimas
    );
  }


  /* =========================================
     CAMBIAR VARIABLE
  ========================================= */

  cambiarVariableGrafica(
    valor: string
  ): void {

    const variablesPermitidas:
      VariableGrafica[] = [
        'todas',
        'temperatura',
        'humedad',
        'viento',
        'lluvia',
        'agua'
      ];


    if (
      variablesPermitidas.includes(
        valor as VariableGrafica
      )
    ) {

      this.variableGrafica.set(
        valor as VariableGrafica
      );

      this.ocultarTooltip();
    }
  }


  /* =========================================
     GENERAR PUNTOS
  ========================================= */

  generarPuntos(
    valores: number[],
    minimo: number,
    maximo: number
  ): string {

    if (
      valores.length === 0
    ) {
      return '';
    }


    const ancho =
      1000;

    const alto =
      260;

    const margenX =
      25;

    const margenY =
      20;


    const anchoDisponible =
      ancho -
      margenX * 2;

    const altoDisponible =
      alto -
      margenY * 2;


    return valores
      .map(
        (
          valor,
          indice
        ) => {

          const x =
            valores.length === 1

              ? ancho / 2

              : margenX +

                (
                  indice /
                  (
                    valores.length - 1
                  )
                ) *

                anchoDisponible;


          const valorLimitado =
            Math.min(
              maximo,

              Math.max(
                minimo,
                valor
              )
            );


          const proporcion =
            (
              valorLimitado -
              minimo
            ) /
            (
              maximo -
              minimo
            );


          const y =
            margenY +

            altoDisponible -

            proporcion *
            altoDisponible;


          return `${x},${y}`;
        }
      )
      .join(' ');
  }


  /* =========================================
     GENERAR COORDENADAS
  ========================================= */

  generarCoordenadas(
    valores: number[],
    minimo: number,
    maximo: number
  ): PuntoGrafica[] {

    if (
      valores.length === 0
    ) {
      return [];
    }


    const ancho =
      1000;

    const alto =
      260;

    const margenX =
      25;

    const margenY =
      20;


    const anchoDisponible =
      ancho -
      margenX * 2;

    const altoDisponible =
      alto -
      margenY * 2;


    return valores.map(
      (
        valor,
        indice
      ) => {

        const x =
          valores.length === 1

            ? ancho / 2

            : margenX +

              (
                indice /
                (
                  valores.length - 1
                )
              ) *

              anchoDisponible;


        const valorLimitado =
          Math.min(
            maximo,

            Math.max(
              minimo,
              valor
            )
          );


        const proporcion =
          (
            valorLimitado -
            minimo
          ) /
          (
            maximo -
            minimo
          );


        const y =
          margenY +

          altoDisponible -

          proporcion *
          altoDisponible;


        return {
          x,
          y,
          valor,
          indice
        };
      }
    );
  }


  /* =========================================
     TOOLTIP
  ========================================= */

  mostrarTooltip(
    punto: PuntoGrafica,
    titulo: string,
    unidad: string = ''
  ): void {

    const lectura =
      this.ultimasLecturas()[
        punto.indice
      ];


    if (!lectura) {
      return;
    }


    const fecha =
      new Date(
        lectura.fechaLectura
      );


    const hora =
      fecha.toLocaleTimeString(
        'es-GT',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }
      );


    this.tooltipGrafica.set({

      visible: true,

      left:
        `${(punto.x / 1000) * 100}%`,

      top:
        `${(punto.y / 260) * 100}%`,

      titulo,

      valor:
        unidad
          ? `${punto.valor} ${unidad}`
          : `${punto.valor}`,

      hora
    });
  }


  ocultarTooltip(): void {

    this.tooltipGrafica.update(
      tooltip => ({
        ...tooltip,
        visible: false
      })
    );
  }


  /* =========================================
     ULTIMAS ALERTAS
  ========================================= */

  cargarUltimasAlertas(): void {

    this.alertasService
      .obtenerAlertas()
      .subscribe({

        next: alertas => {

          const ultimas =

            alertas
              .slice(
                0,
                5
              )
              .map(
                (
                  alerta: Alerta
                ): AlertaSignalR => ({

                  idAlerta:
                    alerta.idAlerta,

                  idSensor:
                    alerta.idSensor,

                  idLectura:
                    alerta.idLectura,

                  tipoFenomeno:
                    alerta.tipoFenomeno,

                  nivel:
                    alerta.nivel,

                  titulo:
                    alerta.titulo,

                  mensaje:
                    alerta.mensaje,

                  estado:
                    alerta.estado,

                  fechaGeneracion:
                    alerta.fechaGeneracion
                })
              );


          this.alertasTiempoReal
            .set(
              ultimas
            );
        },

        error: error => {

          console.error(
            'Error al cargar ultimas alertas:',
            error
          );
        }

      });
  }


  /* =========================================
     ACTUALIZAR ESTADISTICAS
  ========================================= */

  actualizarEstadisticas(): void {

    this.lecturasService
      .obtenerLecturas()
      .subscribe({

        next: lecturas => {

          this.totalLecturas.set(
            lecturas.length
          );

          this.actualizarUltimaLectura(
            lecturas
          );

          this.actualizarGrafica(
            lecturas
          );
        },

        error: error => {

          console.error(
            'Error al actualizar lecturas:',
            error
          );
        }

      });


    this.alertasService
      .obtenerAlertas()
      .subscribe({

        next: alertas => {

          this.alertasActivas.set(
            alertas.filter(
              alerta =>
                alerta.estado === 'ACTIVA'
            ).length
          );


          this.alertasRojas.set(
            alertas.filter(
              alerta =>
                alerta.nivel === 'ROJO'
            ).length
          );
        },

        error: error => {

          console.error(
            'Error al actualizar alertas:',
            error
          );
        }

      });
  }


  /* =========================================
     CLASE ESTADO GENERAL
  ========================================= */

  claseEstadoGeneral(): string {

    switch (
      this.estadoGeneral()
    ) {

      case 'CRÍTICO':
        return 'critico';

      case 'ALTO':
        return 'alto';

      case 'PRECAUCIÓN':
        return 'precaucion';

      case 'NORMAL':
        return 'normal';

      default:
        return 'sin-datos';
    }
  }


  /* =========================================
     DESTRUIR
  ========================================= */

  ngOnDestroy(): void {

    this.signalrService
      .detenerConexion();
  }

}