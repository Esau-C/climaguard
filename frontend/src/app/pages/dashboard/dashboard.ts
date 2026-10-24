
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Navbar } from '../../components/navbar/navbar';

import {
  AlertaSignalR,
  SignalrService
} from '../../services/signalr.service';

import { SensoresService } from '../../services/sensores.service';

import {
  Lectura,
  LecturasService
} from '../../services/lecturas.service';

import {
  Alerta,
  AlertasService
} from '../../services/alertas.service';

import {
  Comunidad,
  ComunidadesService
} from '../../services/comunidades.service';

import {
  Evento,
  EventosService
} from '../../services/eventos.service';

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

interface SensorDashboard {
  idSensor: number;
  idComunidad: number | null;
  activo: boolean;
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

  // comunidades y filtros
  comunidades = signal<Comunidad[]>([]);
  comunidadSeleccionada = signal<number | null>(null);

  totalComunidades = computed(() =>
    this.comunidades().length
  );

  private sensoresOriginales: SensorDashboard[] = [];
  private lecturasOriginales: Lectura[] = [];
  private alertasOriginales: Alerta[] = [];
  private eventosOriginales: Evento[] = [];

  private suscripcionAlertas?: Subscription;

  // estadisticas
  totalSensores = signal(0);
  totalSensoresActivos = signal(0);
  totalSensoresInactivos = signal(0);
  totalLecturas = signal(0);

  alertasActivas = signal(0);
  alertasAmarillas = signal(0);
  alertasNaranjas = signal(0);
  alertasRojas = signal(0);

  // eventos climaticos
  totalEventos = signal(0);
  eventosActivos = signal(0);
  eventosCerrados = signal(0);
  ultimosEventos = signal<Evento[]>([]);

  // alertas recientes
  alertasTiempoReal = signal<AlertaSignalR[]>([]);

  // ultima lectura
  ultimaTemperatura = signal<number | null>(null);
  ultimaHumedad = signal<number | null>(null);
  ultimoNivelAgua = signal<number | null>(null);
  ultimaVelocidadViento = signal<number | null>(null);
  ultimoNivelLluvia = signal<number | null>(null);
  fechaUltimaLectura = signal<string | null>(null);

  // grafica
  ultimasLecturas = signal<Lectura[]>([]);
  variableGrafica = signal<VariableGrafica>('todas');

  tooltipGrafica = signal<TooltipGrafica>({
    visible: false,
    left: '0%',
    top: '0%',
    titulo: '',
    valor: '',
    hora: ''
  });

  constructor(
    private signalrService: SignalrService,
    private sensoresService: SensoresService,
    private lecturasService: LecturasService,
    private alertasService: AlertasService,
    private comunidadesService: ComunidadesService,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {

    this.comunidadesService.obtenerComunidades().subscribe({
      next: comunidades => {
        this.comunidades.set(comunidades);
      },
      error: error => {
        console.error('Error al cargar comunidades:', error);
      }
    });

    this.cargarEstadisticas();
    this.cargarEventos();

    this.signalrService.iniciarConexion();

    this.suscripcionAlertas =
      this.signalrService.nuevaAlerta$.subscribe(() => {
        this.actualizarEstadisticas();
        this.cargarEventos();
      });
  }

  // cambiar comunidad seleccionada
  cambiarComunidad(valor: string): void {

    const idComunidad =
      valor === 'todas' ? null : Number(valor);

    this.comunidadSeleccionada.set(idComunidad);

    this.aplicarFiltros();
    this.ocultarTooltip();
  }

  // obtener los sensores de la comunidad seleccionada
  private idsSensoresFiltrados(): Set<number> {

    const comunidad = this.comunidadSeleccionada();

    return new Set(
      this.sensoresOriginales
        .filter(sensor =>
          comunidad === null ||
          sensor.idComunidad === comunidad
        )
        .map(sensor => sensor.idSensor)
    );
  }

  // aplicar filtros a todas las secciones
  private aplicarFiltros(): void {

    const ids = this.idsSensoresFiltrados();

    const sensores = this.sensoresOriginales.filter(
      sensor => ids.has(sensor.idSensor)
    );

    const lecturas = this.lecturasOriginales.filter(
      lectura => ids.has(lectura.idSensor)
    );

    const alertas = this.alertasOriginales.filter(
      alerta => ids.has(alerta.idSensor)
    );

    // filtrar eventos por comunidad
    const eventos = this.eventosOriginales.filter(
      evento => ids.has(evento.idSensor)
    );

    // indicadores de eventos climaticos
    this.totalEventos.set(eventos.length);

    this.eventosActivos.set(
      eventos.filter(evento =>
        evento.estado === 'ACTIVO'
      ).length
    );

    this.eventosCerrados.set(
      eventos.filter(evento =>
        evento.estado === 'CERRADO'
      ).length
    );

    // ultimos cinco eventos
    this.ultimosEventos.set(
      [...eventos]
        .sort((a, b) =>
          new Date(b.fechaInicio).getTime() -
          new Date(a.fechaInicio).getTime()
        )
        .slice(0, 5)
    );

    // indicadores de sensores
    this.totalSensores.set(sensores.length);

    this.totalSensoresActivos.set(
      sensores.filter(sensor =>
        sensor.activo === true
      ).length
    );

    this.totalSensoresInactivos.set(
      sensores.filter(sensor =>
        sensor.activo === false
      ).length
    );

    // indicadores de lecturas
    this.totalLecturas.set(lecturas.length);

    // indicadores de alertas
    this.alertasActivas.set(
      alertas.filter(alerta =>
        alerta.estado === 'ACTIVA'
      ).length
    );

    this.alertasAmarillas.set(
      alertas.filter(alerta =>
        alerta.nivel === 'AMARILLO'
      ).length
    );

    this.alertasNaranjas.set(
      alertas.filter(alerta =>
        alerta.nivel === 'NARANJA'
      ).length
    );

    this.alertasRojas.set(
      alertas.filter(alerta =>
        alerta.nivel === 'ROJO'
      ).length
    );

    // ultima lectura de la comunidad
    this.actualizarUltimaLectura(lecturas);

    // seleccionar un sensor para evitar mezclar
    // diferentes sensores en una misma serie
    this.actualizarGrafica(lecturas);

    // ultimas cinco alertas filtradas
    const ultimasAlertas = [...alertas]
      .sort((a, b) =>
        new Date(b.fechaGeneracion).getTime() -
        new Date(a.fechaGeneracion).getTime()
      )
      .slice(0, 5)
      .map((alerta): AlertaSignalR => ({
        idAlerta: alerta.idAlerta,
        idSensor: alerta.idSensor,
        idLectura: alerta.idLectura,
        tipoFenomeno: alerta.tipoFenomeno,
        nivel: alerta.nivel,
        titulo: alerta.titulo,
        mensaje: alerta.mensaje,
        estado: alerta.estado,
        fechaGeneracion: alerta.fechaGeneracion
      }));

    this.alertasTiempoReal.set(ultimasAlertas);
  }

  // cargar eventos desde el backend
  cargarEventos(): void {

    this.eventosService.obtenerEventos().subscribe({
      next: eventos => {
        this.eventosOriginales = eventos;
        this.aplicarFiltros();
      },
      error: error => {
        console.error('Error al cargar eventos:', error);
      }
    });
  }

  // cargar sensores y sus estados
  cargarEstadisticas(): void {

    this.sensoresService.obtenerSensores().subscribe({
      next: sensores => {

        this.sensoresOriginales = sensores.map(sensor => ({
          idSensor: sensor.idSensor,
          idComunidad: sensor.idComunidad ?? null,
          activo: sensor.activo
        }));

        this.aplicarFiltros();
      },
      error: error => {
        console.error('Error al cargar sensores:', error);
      }
    });

    this.actualizarEstadisticas();
  }

  // refrescar lecturas y alertas
  actualizarEstadisticas(): void {

    this.lecturasService.obtenerLecturas().subscribe({
      next: lecturas => {

        this.lecturasOriginales = lecturas;
        this.aplicarFiltros();
      },
      error: error => {
        console.error('Error al cargar lecturas:', error);
      }
    });

    this.cargarUltimasAlertas();
  }

  cargarUltimasAlertas(): void {

    this.alertasService.obtenerAlertas().subscribe({
      next: alertas => {

        this.alertasOriginales = alertas;
        this.aplicarFiltros();
      },
      error: error => {
        console.error('Error al cargar alertas:', error);
      }
    });
  }

  
  // actualizar la ultima lectura disponible de cada variable
  actualizarUltimaLectura(lecturas: Lectura[]): void {

    const ordenadas = [...lecturas].sort((a, b) =>
      new Date(b.fechaLectura).getTime() -
      new Date(a.fechaLectura).getTime()
    );

    // buscar el valor mas reciente de cada variable
    const temperatura = ordenadas.find(
      lectura => lectura.temperatura != null
    );

    const humedad = ordenadas.find(
      lectura => lectura.humedad != null
    );

    const viento = ordenadas.find(
      lectura => lectura.velocidadViento != null
    );

    const lluvia = ordenadas.find(
      lectura => lectura.nivelLluvia != null
    );

    const agua = ordenadas.find(
      lectura => lectura.nivelAgua != null
    );

    this.ultimaTemperatura.set(
      temperatura?.temperatura == null
        ? null
        : Number(temperatura.temperatura)
    );

    this.ultimaHumedad.set(
      humedad?.humedad == null
        ? null
        : Number(humedad.humedad)
    );

    this.ultimaVelocidadViento.set(
      viento?.velocidadViento == null
        ? null
        : Number(viento.velocidadViento)
    );

    this.ultimoNivelLluvia.set(
      lluvia?.nivelLluvia == null
        ? null
        : Number(lluvia.nivelLluvia)
    );

    this.ultimoNivelAgua.set(
      agua?.nivelAgua == null
        ? null
        : Number(agua.nivelAgua)
    );

    // fecha de la lectura mas reciente
    this.fechaUltimaLectura.set(
      ordenadas.length > 0
        ? ordenadas[0].fechaLectura
        : null
    );
  }

  // calcular estado general
  estadoGeneral = computed(() => {

    const temperatura = this.ultimaTemperatura();
    const humedad = this.ultimaHumedad();
    const viento = this.ultimaVelocidadViento();
    const lluvia = this.ultimoNivelLluvia();
    const nivelAgua = this.ultimoNivelAgua();

    if (
      temperatura === null &&
      viento === null &&
      lluvia === null &&
      nivelAgua === null
    ) {
      return 'SIN DATOS';
    }

    // riesgo critico
    if (
      (
        temperatura !== null &&
        temperatura >= 45 &&
        humedad !== null &&
        humedad <= 30
      ) ||
      (viento !== null && viento >= 80) ||
      (lluvia !== null && lluvia >= 80) ||
      (nivelAgua !== null && nivelAgua >= 3)
    ) {
      return 'CRÍTICO';
    }

    // riesgo alto
    if (
      (
        temperatura !== null &&
        temperatura >= 40 &&
        humedad !== null &&
        humedad <= 45
      ) ||
      (viento !== null && viento >= 60) ||
      (lluvia !== null && lluvia >= 50) ||
      (nivelAgua !== null && nivelAgua >= 2)
    ) {
      return 'ALTO';
    }

    // precaucion
    if (
      (
        temperatura !== null &&
        temperatura >= 35 &&
        humedad !== null &&
        humedad <= 60
      ) ||
      (viento !== null && viento >= 40) ||
      (lluvia !== null && lluvia >= 30) ||
      (nivelAgua !== null && nivelAgua >= 1.5)
    ) {
      return 'PRECAUCIÓN';
    }

    return 'NORMAL';
  });

  claseEstadoGeneral(): string {

    switch (this.estadoGeneral()) {

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

  
  // actualizar las lecturas para las graficas
  actualizarGrafica(lecturas: Lectura[]): void {

    const ultimas = [...lecturas]
      .sort((a, b) =>
        new Date(a.fechaLectura).getTime() -
        new Date(b.fechaLectura).getTime()
      )
      .slice(-100);

    this.ultimasLecturas.set(ultimas);
  }


  // seleccionar variable de la grafica
  cambiarVariableGrafica(valor: string): void {

    const variablesPermitidas: VariableGrafica[] = [
      'todas',
      'temperatura',
      'humedad',
      'viento',
      'lluvia',
      'agua'
    ];

    if (variablesPermitidas.includes(valor as VariableGrafica)) {
      this.variableGrafica.set(valor as VariableGrafica);
      this.ocultarTooltip();
    }
  }

  nombreVariableGrafica = computed(() => {

    switch (this.variableGrafica()) {

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

    switch (this.variableGrafica()) {

      case 'temperatura':
        return '°C';

      case 'humedad':
        return '%';

      default:
        return '';
    }
  });

  claseVariableGrafica = computed(() => {

    switch (this.variableGrafica()) {

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

  mostrarTodas = computed(() =>
    this.variableGrafica() === 'todas'
  );

  // generar valores para las graficas
  
// generar valores para las graficas
  puntosTemperatura = computed(() =>
    this.generarPuntos(
      this.ultimasLecturas()
        .filter(lectura => lectura.temperatura != null)
        .map(lectura => Number(lectura.temperatura)),
      0,
      50
    )
  );

  puntosHumedad = computed(() =>
    this.generarPuntos(
      this.ultimasLecturas()
        .filter(lectura => lectura.humedad != null)
        .map(lectura => Number(lectura.humedad)),
      0,
      100
    )
  );

  puntosViento = computed(() =>
    this.generarPuntos(
      this.ultimasLecturas()
        .filter(lectura => lectura.velocidadViento != null)
        .map(lectura => Number(lectura.velocidadViento)),
      0,
      100
    )
  );

  puntosLluvia = computed(() =>
    this.generarPuntos(
      this.ultimasLecturas()
        .filter(lectura => lectura.nivelLluvia != null)
        .map(lectura => Number(lectura.nivelLluvia)),
      0,
      100
    )
  );

  puntosAgua = computed(() =>
    this.generarPuntos(
      this.ultimasLecturas()
        .filter(lectura => lectura.nivelAgua != null)
        .map(lectura => Number(lectura.nivelAgua)),
      0,
      5
    )
  );



valoresGrafica = computed(() => {
  const variable = this.variableGrafica();

  if (variable === 'todas') {
    return [];
  }

    return this.ultimasLecturas()
      .map(lectura => {
        switch (variable) {
          case 'temperatura':
            return lectura.temperatura;

          case 'humedad':
            return lectura.humedad;

          case 'viento':
            return lectura.velocidadViento;

          case 'lluvia':
            return lectura.nivelLluvia;

          case 'agua':
            return lectura.nivelAgua;

          default:
            return null;
        }
      })
      .filter((valor): valor is number => valor != null)
      .map(valor => Number(valor));
  });

  maximoGrafica = computed(() => {

    switch (this.variableGrafica()) {

      case 'temperatura':
        return 50;

      case 'humedad':
      case 'viento':
      case 'lluvia':
        return 100;

      case 'agua':
        return 5;

      default:
        return 100;
    }
  });

  puntosGrafica = computed(() =>
    this.generarPuntos(
      this.valoresGrafica(),
      0,
      this.maximoGrafica()
    )
  );

  // coordenadas para los puntos interactivos
  
// coordenadas para los puntos interactivos
  coordenadasTemperatura = computed(() =>
    this.generarCoordenadas(
      this.ultimasLecturas()
        .filter(lectura => lectura.temperatura != null)
        .map(lectura => Number(lectura.temperatura)),
      0,
      50
    )
  );

  coordenadasHumedad = computed(() =>
    this.generarCoordenadas(
      this.ultimasLecturas()
        .filter(lectura => lectura.humedad != null)
        .map(lectura => Number(lectura.humedad)),
      0,
      100
    )
  );

  coordenadasViento = computed(() =>
    this.generarCoordenadas(
      this.ultimasLecturas()
        .filter(lectura => lectura.velocidadViento != null)
        .map(lectura => Number(lectura.velocidadViento)),
      0,
      100
    )
  );

  coordenadasLluvia = computed(() =>
    this.generarCoordenadas(
      this.ultimasLecturas()
        .filter(lectura => lectura.nivelLluvia != null)
        .map(lectura => Number(lectura.nivelLluvia)),
      0,
      100
    )
  );

  coordenadasAgua = computed(() =>
    this.generarCoordenadas(
      this.ultimasLecturas()
        .filter(lectura => lectura.nivelAgua != null)
        .map(lectura => Number(lectura.nivelAgua)),
      0,
      5
    )
  );


  coordenadasGrafica = computed(() =>
    this.generarCoordenadas(
      this.valoresGrafica(),
      0,
      this.maximoGrafica()
    )
  );

  // generar linea SVG
  generarPuntos(
    valores: number[],
    minimo: number,
    maximo: number
  ): string {

    return this.generarCoordenadas(
      valores,
      minimo,
      maximo
    )
      .map(punto => `${punto.x},${punto.y}`)
      .join(' ');
  }

  // generar coordenadas SVG
  generarCoordenadas(
    valores: number[],
    minimo: number,
    maximo: number
  ): PuntoGrafica[] {

    if (valores.length === 0) {
      return [];
    }

    const ancho = 1000;
    const alto = 260;
    const margenX = 25;
    const margenY = 20;

    const anchoDisponible = ancho - margenX * 2;
    const altoDisponible = alto - margenY * 2;

    return valores.map((valor, indice) => {

      const x = valores.length === 1
        ? ancho / 2
        : margenX +
          (indice / (valores.length - 1)) *
          anchoDisponible;

      const valorLimitado = Math.min(
        maximo,
        Math.max(minimo, valor)
      );

      const proporcion =
        (valorLimitado - minimo) / (maximo - minimo);

      const y =
        margenY +
        altoDisponible -
        proporcion * altoDisponible;

      return {
        x,
        y,
        valor,
        indice
      };
    });
  }

  
  // mostrar informacion de cada punto
  mostrarTooltip(
    punto: PuntoGrafica,
    titulo: string,
    unidad: string = ''
  ): void {

    const lecturas = this.ultimasLecturas();

    let lecturasFiltradas = lecturas;

    switch (titulo) {
      case 'Temperatura':
        lecturasFiltradas = lecturas.filter(
          lectura => lectura.temperatura != null
        );
        break;

      case 'Humedad':
        lecturasFiltradas = lecturas.filter(
          lectura => lectura.humedad != null
        );
        break;

      case 'Velocidad del viento':
        lecturasFiltradas = lecturas.filter(
          lectura => lectura.velocidadViento != null
        );
        break;

      case 'Nivel de lluvia':
        lecturasFiltradas = lecturas.filter(
          lectura => lectura.nivelLluvia != null
        );
        break;

      case 'Nivel de agua':
        lecturasFiltradas = lecturas.filter(
          lectura => lectura.nivelAgua != null
        );
        break;
    }

    const lectura = lecturasFiltradas[punto.indice];

    if (!lectura) {
      return;
    }

    const fecha = new Date(lectura.fechaLectura);

    const hora = fecha.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    this.tooltipGrafica.set({
      visible: true,
      left: `${(punto.x / 1000) * 100}%`,
      top: `${(punto.y / 260) * 100}%`,
      titulo,
      valor: unidad
        ? `${punto.valor} ${unidad}`
        : `${punto.valor}`,
      hora
    });
  }

  ocultarTooltip(): void {

    this.tooltipGrafica.update(tooltip => ({
      ...tooltip,
      visible: false
    }));
  }

  ngOnDestroy(): void {

    this.suscripcionAlertas?.unsubscribe();
    this.signalrService.detenerConexion();
  }
}
