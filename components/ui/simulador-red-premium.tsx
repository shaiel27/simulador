"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Monitor,
  Router,
  Wifi,
  Laptop,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Trash2,
  Cable,
  Terminal,
  Activity,
  Network,
  Zap,
  Cpu,
  HardDrive,
  Users,
  Code,
  Power,
  PowerOff,
  MonitorSpeaker,
  Eye,
  BarChart3,
  EyeOff,
} from "lucide-react"

interface Dispositivo {
  id: string
  tipo: "laptop" | "router" | "switch"
  nombre: string
  x: number
  y: number
  ip?: string
  mascara?: string
  gateway?: string
  estado: "encendido" | "apagado"
  interfaces: Interface[]
  cpu: number
  memoria: number
  trafico: number
}

interface Interface {
  nombre: string
  ip?: string
  mascara?: string
  estado: "up" | "down" | "admin-down"
  conectado: boolean
  dispositivoConectado?: string
  interfazConectada?: string
}

interface Conexion {
  id: string
  desde: string
  hacia: string
  interfazDesde: string
  interfazHacia: string
  estado: "activa" | "inactiva"
  velocidad: number
  latencia: number
}

interface Paquete {
  id: string
  desde: string
  hacia: string
  ipOrigen: string
  ipDestino: string
  progreso: number
  tipo: "ping" | "arp" | "data"
  exitoso: boolean
  mensaje: string
  tamaño: number
}

interface LogEntry {
  id: string
  timestamp: string
  dispositivo: string
  tipo: "success" | "error" | "info" | "warning"
  mensaje: string
}

const tiposDispositivos = [
  {
    tipo: "laptop" as const,
    icono: Laptop,
    nombre: "Laptop",
    descripcion: "Dispositivo de usuario final",
    color: "from-violet-500 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-500/30",
    borderColor: "border-violet-400/40",
    bgColor: "bg-violet-500/10",
    interfaces: [
      {
        nombre: "Ethernet0",
        ip: "",
        mascara: "",
        estado: "down" as const,
        conectado: false,
      },
    ],
  },
  {
    tipo: "router" as const,
    icono: Router,
    nombre: "Router",
    descripcion: "Dispositivo de enrutamiento L3",
    color: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "shadow-emerald-500/30",
    borderColor: "border-emerald-400/40",
    bgColor: "bg-emerald-500/10",
    interfaces: [
      {
        nombre: "GigabitEthernet0/0",
        ip: "",
        mascara: "",
        estado: "admin-down" as const,
        conectado: false,
      },
      {
        nombre: "GigabitEthernet0/1",
        ip: "",
        mascara: "",
        estado: "admin-down" as const,
        conectado: false,
      },
    ],
  },
  {
    tipo: "switch" as const,
    icono: Wifi,
    nombre: "Switch",
    descripcion: "Dispositivo de conmutación L2",
    color: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/30",
    borderColor: "border-amber-400/40",
    bgColor: "bg-amber-500/10",
    interfaces: Array.from({ length: 4 }, (_, i) => ({
      nombre: `FastEthernet0/${i + 1}`,
      ip: "",
      mascara: "",
      estado: "down" as const,
      conectado: false,
    })),
  },
]

export default function SimuladorRedPremium() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [conexiones, setConexiones] = useState<Conexion[]>([])
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<Dispositivo | null>(null)
  const [simulando, setSimulando] = useState(false)
  const [dispositivoArrastrado, setDispositivoArrastrado] = useState<string | null>(null)
  const [modoConexion, setModoConexion] = useState<{
    activo: boolean
    origen?: { dispositivo: string; interfaz: string }
  }>({ activo: false })
  const [comandoActual, setComandoActual] = useState("")
  const [historialComandos, setHistorialComandos] = useState<string[]>([])
  const [panelActivo, setPanelActivo] = useState<"dispositivos" | "config" | "terminal" | "logs" | "analytics">(
    "dispositivos",
  )
  const [mostrarMetricas, setMostrarMetricas] = useState(true)
  const [mostrarCables, setMostrarCables] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Agregar log simplificado
  const agregarLog = useCallback((dispositivo: string, tipo: LogEntry["tipo"], mensaje: string) => {
    const nuevoLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      dispositivo,
      tipo,
      mensaje,
    }
    setLogs((prev) => [nuevoLog, ...prev].slice(0, 50))
  }, [])

  // Función simplificada para verificar si dos dispositivos están conectados
  const estanConectados = useCallback(
    (dispositivo1Id: string, dispositivo2Id: string): boolean => {
      return conexiones.some(
        (conexion) =>
          conexion.estado === "activa" &&
          ((conexion.desde === dispositivo1Id && conexion.hacia === dispositivo2Id) ||
            (conexion.desde === dispositivo2Id && conexion.hacia === dispositivo1Id)),
      )
    },
    [conexiones],
  )

  // Función simplificada para encontrar dispositivo por IP
  const encontrarDispositivoPorIP = useCallback(
    (ip: string): Dispositivo | null => {
      return dispositivos.find((d) => d.ip === ip) || null
    },
    [dispositivos],
  )

  // Agregar dispositivo simplificado
  const agregarDispositivo = useCallback(
    (tipo: Dispositivo["tipo"], x: number, y: number) => {
      const tipoInfo = tiposDispositivos.find((t) => t.tipo === tipo)
      const contador = dispositivos.filter((d) => d.tipo === tipo).length + 1
      const nuevoDispositivo: Dispositivo = {
        id: `${tipo}-${Date.now()}`,
        tipo,
        nombre: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)}${contador}`,
        x,
        y,
        estado: "apagado",
        interfaces: tipoInfo?.interfaces.map((int) => ({ ...int })) || [],
        cpu: Math.floor(Math.random() * 30) + 10,
        memoria: Math.floor(Math.random() * 40) + 20,
        trafico: 0,
      }

      if (tipo === "laptop") {
        nuevoDispositivo.ip = `192.168.1.${contador + 10}`
        nuevoDispositivo.mascara = "255.255.255.0"
        nuevoDispositivo.gateway = "192.168.1.1"
      }

      setDispositivos((prev) => [...prev, nuevoDispositivo])
      agregarLog(nuevoDispositivo.nombre, "info", `Dispositivo ${nuevoDispositivo.nombre} agregado`)
    },
    [dispositivos, agregarLog],
  )

  // Manejar drop simplificado
  const manejarDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!dispositivoArrastrado || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      agregarDispositivo(dispositivoArrastrado as Dispositivo["tipo"], x, y)
      setDispositivoArrastrado(null)
    },
    [dispositivoArrastrado, agregarDispositivo],
  )

  // Iniciar conexión
  const iniciarConexion = useCallback((dispositivoId: string, interfazNombre: string) => {
    setModoConexion({
      activo: true,
      origen: { dispositivo: dispositivoId, interfaz: interfazNombre },
    })
  }, [])

  // Conectar dispositivos simplificado
  const conectarDispositivos = useCallback(
    (dispositivoId: string, interfazNombre: string) => {
      if (!modoConexion.origen) return

      const nuevaConexion: Conexion = {
        id: `conn-${Date.now()}`,
        desde: modoConexion.origen.dispositivo,
        hacia: dispositivoId,
        interfazDesde: modoConexion.origen.interfaz,
        interfazHacia: interfazNombre,
        estado: "activa",
        velocidad: Math.floor(Math.random() * 900) + 100,
        latencia: Math.floor(Math.random() * 20) + 1,
      }

      setConexiones((prev) => [...prev, nuevaConexion])

      // Actualizar interfaces
      setDispositivos((prev) =>
        prev.map((d) => {
          if (d.id === modoConexion.origen!.dispositivo || d.id === dispositivoId) {
            return {
              ...d,
              interfaces: d.interfaces.map((int) => {
                if (
                  (d.id === modoConexion.origen!.dispositivo && int.nombre === modoConexion.origen!.interfaz) ||
                  (d.id === dispositivoId && int.nombre === interfazNombre)
                ) {
                  return {
                    ...int,
                    conectado: true,
                    estado: d.estado === "encendido" ? "up" : "down",
                    dispositivoConectado:
                      d.id === modoConexion.origen!.dispositivo ? dispositivoId : modoConexion.origen!.dispositivo,
                    interfazConectada:
                      d.id === modoConexion.origen!.dispositivo ? interfazNombre : modoConexion.origen!.interfaz,
                  }
                }
                return int
              }),
            }
          }
          return d
        }),
      )

      const dispositivoOrigen = dispositivos.find((d) => d.id === modoConexion.origen!.dispositivo)
      const dispositivoDestino = dispositivos.find((d) => d.id === dispositivoId)
      agregarLog("Sistema", "success", `Conexión: ${dispositivoOrigen?.nombre} ↔ ${dispositivoDestino?.nombre}`)

      setModoConexion({ activo: false })
    },
    [modoConexion.origen, dispositivos, agregarLog],
  )

  // Función de ping simplificada
  const hacerPing = useCallback(
    (origenId: string, ipDestino: string) => {
      const origen = dispositivos.find((d) => d.id === origenId)
      if (!origen) {
        agregarLog("Error", "error", "Dispositivo origen no encontrado")
        return
      }

      if (origen.estado === "apagado") {
        agregarLog(origen.nombre, "error", "Dispositivo apagado")
        return
      }

      const destino = encontrarDispositivoPorIP(ipDestino)
      if (!destino) {
        agregarLog(origen.nombre, "error", `Ping a ${ipDestino}: Destino no encontrado`)
        return
      }

      if (destino.estado === "apagado") {
        agregarLog(origen.nombre, "error", `Ping a ${ipDestino}: Destino apagado`)
        return
      }

      // Verificar si están conectados directamente o a través de la misma red
      const mismaRed =
        origen.ip &&
        destino.ip &&
        origen.ip.split(".").slice(0, 3).join(".") === destino.ip.split(".").slice(0, 3).join(".")

      if (!mismaRed) {
        agregarLog(origen.nombre, "error", `Ping a ${ipDestino}: No hay ruta al destino`)
        return
      }

      // Crear paquete de ping
      const paquete: Paquete = {
        id: `ping-${Date.now()}`,
        desde: origenId,
        hacia: destino.id,
        ipOrigen: origen.ip || "0.0.0.0",
        ipDestino,
        progreso: 0,
        tipo: "ping",
        exitoso: true,
        mensaje: `Ping desde ${origen.nombre} hacia ${ipDestino}`,
        tamaño: 64,
      }

      setPaquetes((prev) => [...prev, paquete])
      agregarLog(origen.nombre, "info", `Enviando ping a ${ipDestino}...`)

      // Actualizar tráfico
      setDispositivos((prev) =>
        prev.map((d) => {
          if (d.id === origenId || d.id === destino.id) {
            return { ...d, trafico: Math.min(d.trafico + 15, 100) }
          }
          return d
        }),
      )
    },
    [dispositivos, encontrarDispositivoPorIP, agregarLog],
  )

  // Ejecutar comando simplificado
  const ejecutarComando = useCallback(
    (comando: string) => {
      if (!dispositivoSeleccionado) return

      const cmd = comando.trim().toLowerCase()
      const partes = comando.trim().split(" ")

      agregarComando(`${dispositivoSeleccionado.nombre}@nexus:~$ ${comando}`)

      if (cmd.startsWith("ping ")) {
        const ip = partes[1]
        if (ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
          hacerPing(dispositivoSeleccionado.id, ip)
        } else {
          agregarComando("Error: Formato de IP inválido. Uso: ping 192.168.1.1")
        }
      } else if (cmd === "ipconfig" || cmd === "ifconfig") {
        if (dispositivoSeleccionado.ip) {
          agregarComando(`Dirección IP: ${dispositivoSeleccionado.ip}`)
          agregarComando(`Máscara de subred: ${dispositivoSeleccionado.mascara || "255.255.255.0"}`)
          agregarComando(`Puerta de enlace: ${dispositivoSeleccionado.gateway || "No configurada"}`)
        } else {
          agregarComando("No hay configuración IP")
        }
      } else if (cmd === "help" || cmd === "ayuda") {
        agregarComando("Comandos disponibles:")
        agregarComando("  ping <ip>     - Probar conectividad")
        agregarComando("  ipconfig      - Mostrar configuración IP")
        agregarComando("  clear         - Limpiar terminal")
        agregarComando("  help          - Mostrar ayuda")
      } else if (cmd === "clear" || cmd === "limpiar") {
        setHistorialComandos([])
        return
      } else {
        agregarComando(`Comando no reconocido: ${comando}`)
        agregarComando("Escribe 'help' para ver comandos disponibles")
      }

      setComandoActual("")
    },
    [dispositivoSeleccionado, hacerPing],
  )

  const agregarComando = useCallback((texto: string) => {
    setHistorialComandos((prev) => [...prev, texto])
  }, [])

  // Actualizar dispositivo
  const actualizarDispositivo = useCallback(
    (dispositivoId: string, actualizaciones: Partial<Dispositivo>) => {
      setDispositivos((prev) =>
        prev.map((d) => {
          if (d.id === dispositivoId) {
            const actualizado = { ...d, ...actualizaciones }
            if (actualizaciones.estado) {
              actualizado.interfaces = actualizado.interfaces.map((int) => ({
                ...int,
                estado: int.conectado ? (actualizaciones.estado === "encendido" ? "up" : "down") : int.estado,
              }))
            }
            return actualizado
          }
          return d
        }),
      )

      if (dispositivoSeleccionado?.id === dispositivoId) {
        setDispositivoSeleccionado((prev) => (prev ? { ...prev, ...actualizaciones } : null))
      }
    },
    [dispositivoSeleccionado],
  )

  // Eliminar dispositivo
  const eliminarDispositivo = useCallback(
    (dispositivoId: string) => {
      const dispositivo = dispositivos.find((d) => d.id === dispositivoId)
      setDispositivos((prev) => prev.filter((d) => d.id !== dispositivoId))
      setConexiones((prev) => prev.filter((c) => c.desde !== dispositivoId && c.hacia !== dispositivoId))

      if (dispositivoSeleccionado?.id === dispositivoId) {
        setDispositivoSeleccionado(null)
      }

      if (dispositivo) {
        agregarLog("Sistema", "warning", `Dispositivo ${dispositivo.nombre} eliminado`)
      }
    },
    [dispositivos, dispositivoSeleccionado, agregarLog],
  )

  // Animación simplificada
  useEffect(() => {
    if (!simulando) return

    const interval = setInterval(() => {
      // Animar paquetes
      setPaquetes((prev) =>
        prev
          .map((paquete) => {
            const nuevoProgreso = Math.min(paquete.progreso + 8, 100)
            if (nuevoProgreso === 100 && paquete.progreso < 100) {
              const origen = dispositivos.find((d) => d.id === paquete.desde)
              if (paquete.tipo === "ping" && origen) {
                if (paquete.exitoso) {
                  agregarLog(
                    origen.nombre,
                    "success",
                    `Ping a ${paquete.ipDestino}: Respuesta recibida (${Math.floor(Math.random() * 50) + 1}ms)`,
                  )
                } else {
                  agregarLog(origen.nombre, "error", `Ping a ${paquete.ipDestino}: Tiempo agotado`)
                }
              }
            }
            return { ...paquete, progreso: nuevoProgreso }
          })
          .filter((paquete) => paquete.progreso < 100),
      )

      // Actualizar métricas
      setDispositivos((prev) =>
        prev.map((dispositivo) => ({
          ...dispositivo,
          cpu: Math.max(0, Math.min(100, dispositivo.cpu + (Math.random() - 0.5) * 8)),
          memoria: Math.max(0, Math.min(100, dispositivo.memoria + (Math.random() - 0.5) * 4)),
          trafico: Math.max(0, dispositivo.trafico - 3),
        })),
      )
    }, 300)

    return () => clearInterval(interval)
  }, [simulando, dispositivos, agregarLog])

  // Obtener posición del dispositivo
  const obtenerPosicionDispositivo = useCallback(
    (dispositivoId: string) => {
      const dispositivo = dispositivos.find((d) => d.id === dispositivoId)
      return dispositivo ? { x: dispositivo.x, y: dispositivo.y } : { x: 0, y: 0 }
    },
    [dispositivos],
  )

  // Componente de dispositivo simplificado
  const ComponenteDispositivo = ({ dispositivo }: { dispositivo: Dispositivo }) => {
    const tipoInfo = tiposDispositivos.find((t) => t.tipo === dispositivo.tipo)
    const Icono = tipoInfo?.icono || Monitor
    const isSelected = dispositivoSeleccionado?.id === dispositivo.id

    return (
      <div
        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isSelected ? "scale-110 z-30" : "z-20 hover:scale-105"
        }`}
        style={{ left: dispositivo.x, top: dispositivo.y }}
        onClick={(e) => {
          e.stopPropagation()
          if (!modoConexion.activo) {
            setDispositivoSeleccionado(dispositivo)
            setHistorialComandos([`Conectado a ${dispositivo.nombre}`, `${dispositivo.nombre}@nexus:~$ `])
          }
        }}
      >
        {/* Glow effect */}
        {dispositivo.estado === "encendido" && (
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tipoInfo?.color} opacity-20 blur-xl animate-pulse`}
            style={{ transform: "scale(1.5)" }}
          />
        )}

        {/* Main container */}
        <div
          className={`relative bg-white/95 backdrop-blur-sm ${tipoInfo?.borderColor} border-2 rounded-2xl p-4 shadow-lg ${
            isSelected ? "ring-2 ring-violet-400/50" : ""
          } transition-all duration-300`}
        >
          {/* Device icon */}
          <div
            className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${tipoInfo?.color} p-4 shadow-md relative`}
          >
            <Icono className="w-full h-full text-white" />
            {dispositivo.estado === "encendido" && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
            )}
          </div>

          {/* Device info */}
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-gray-800 mb-1">{dispositivo.nombre}</div>
            <div className="text-xs text-gray-500 mb-2">{tipoInfo?.descripcion}</div>
            {dispositivo.ip && (
              <div className="text-xs text-violet-600 bg-violet-100 rounded px-2 py-1 font-mono">{dispositivo.ip}</div>
            )}
          </div>

          {/* Metrics */}
          {mostrarMetricas && dispositivo.estado === "encendido" && (
            <div className="space-y-1 mb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">CPU:</span>
                <span className="font-mono">{Math.round(dispositivo.cpu)}%</span>
              </div>
              <Progress value={dispositivo.cpu} className="h-1" />
              <div className="flex justify-between">
                <span className="text-gray-600">RAM:</span>
                <span className="font-mono">{Math.round(dispositivo.memoria)}%</span>
              </div>
              <Progress value={dispositivo.memoria} className="h-1" />
              {dispositivo.trafico > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Red:</span>
                    <span className="font-mono">{Math.round(dispositivo.trafico)}%</span>
                  </div>
                  <Progress value={dispositivo.trafico} className="h-1" />
                </>
              )}
            </div>
          )}

          {/* Status indicator */}
          <div className="absolute -top-2 -right-2">
            <div
              className={`w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
                dispositivo.estado === "encendido" ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            >
              {dispositivo.estado === "encendido" ? (
                <Power className="w-3 h-3 text-white" />
              ) : (
                <PowerOff className="w-3 h-3 text-white" />
              )}
            </div>
          </div>

          {/* Network interfaces */}
          {dispositivo.interfaces.map((interfaz, index) => {
            const angulo = (index * 360) / dispositivo.interfaces.length
            const radio = 45
            const x = Math.cos((angulo * Math.PI) / 180) * radio
            const y = Math.sin((angulo * Math.PI) / 180) * radio

            return (
              <div
                key={interfaz.nombre}
                className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer transition-all hover:scale-110 flex items-center justify-center ${
                  interfaz.conectado
                    ? interfaz.estado === "up"
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-400 hover:bg-violet-500"
                } ${modoConexion.activo && !interfaz.conectado ? "ring-2 ring-violet-400 animate-bounce" : ""}`}
                style={{
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (modoConexion.activo && !interfaz.conectado) {
                    if (modoConexion.origen) {
                      conectarDispositivos(dispositivo.id, interfaz.nombre)
                    } else {
                      iniciarConexion(dispositivo.id, interfaz.nombre)
                    }
                  }
                }}
                title={`${interfaz.nombre} - ${interfaz.estado}`}
              >
                <div className="w-2 h-2 bg-white/80 rounded-full" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Componente de conexión muy simplificado (solo si mostrarCables está activo)
  const ComponenteConexion = ({ conexion }: { conexion: Conexion }) => {
    if (!mostrarCables) return null

    const posDesde = obtenerPosicionDispositivo(conexion.desde)
    const posHacia = obtenerPosicionDispositivo(conexion.hacia)

    return (
      <div className="absolute pointer-events-none z-5">
        <svg
          className="absolute"
          style={{
            left: Math.min(posDesde.x, posHacia.x),
            top: Math.min(posDesde.y, posHacia.y),
            width: Math.abs(posHacia.x - posDesde.x),
            height: Math.abs(posHacia.y - posDesde.y),
          }}
        >
          <line
            x1={posDesde.x > posHacia.x ? Math.abs(posHacia.x - posDesde.x) : 0}
            y1={posDesde.y > posHacia.y ? Math.abs(posHacia.y - posDesde.y) : 0}
            x2={posDesde.x > posHacia.x ? 0 : Math.abs(posHacia.x - posDesde.x)}
            y2={posDesde.y > posHacia.y ? 0 : Math.abs(posHacia.y - posDesde.y)}
            stroke={conexion.estado === "activa" ? "#3b82f6" : "#9ca3af"}
            strokeWidth="2"
            strokeDasharray={conexion.estado === "activa" ? "0" : "5,5"}
            opacity="0.6"
          />
        </svg>
      </div>
    )
  }

  // Componente de paquete simplificado
  const ComponentePaquete = ({ paquete }: { paquete: Paquete }) => {
    const posDesde = obtenerPosicionDispositivo(paquete.desde)
    const posHacia = obtenerPosicionDispositivo(paquete.hacia)

    const xActual = posDesde.x + (posHacia.x - posDesde.x) * (paquete.progreso / 100)
    const yActual = posDesde.y + (posHacia.y - posDesde.y) * (paquete.progreso / 100)

    return (
      <div
        className="absolute pointer-events-none z-40"
        style={{ left: xActual, top: yActual, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-8 h-8 bg-yellow-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono">
          <div className="text-center">
            <div>{paquete.tipo.toUpperCase()}</div>
            <div className="text-gray-300">{paquete.tamaño}B</div>
          </div>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const estadisticas = {
    dispositivosOnline: dispositivos.filter((d) => d.estado === "encendido").length,
    dispositivosTotal: dispositivos.length,
    conexionesActivas: conexiones.filter((c) => c.estado === "activa").length,
    conexionesTotal: conexiones.length,
    paquetesEnTransito: paquetes.length,
    traficoPromedio:
      dispositivos.length > 0
        ? Math.round(dispositivos.reduce((acc, d) => acc + d.trafico, 0) / dispositivos.length)
        : 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  SIMULADOR DE RED NEXUS
                </h1>
                <p className="text-gray-600 text-sm">Plataforma de Simulación de Redes</p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-600">{estadisticas.dispositivosOnline}</div>
                  <div className="text-xs text-gray-500">En línea</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-violet-600">{estadisticas.conexionesActivas}</div>
                  <div className="text-xs text-gray-500">Enlaces</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600">{estadisticas.paquetesEnTransito}</div>
                  <div className="text-xs text-gray-500">Paquetes</div>
                </div>
              </div>

              <Separator orientation="vertical" className="h-8" />

              {/* Créditos */}
              <div className="text-right text-sm">
                <div className="flex items-center gap-2 text-violet-600 font-semibold">
                  <Code className="w-3 h-3" />
                  <span>Shaiel Becerra</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  <Users className="w-3 h-3" />
                  <span>Yoangel Godoy</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${simulando ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-xs font-semibold text-gray-700">{simulando ? "ACTIVO" : "PARADO"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Panel lateral */}
        <div className="w-72 bg-white/60 backdrop-blur-xl border-r border-gray-200/50 shadow-lg flex flex-col">
          {/* Navigation tabs */}
          <div className="p-3 border-b border-gray-200/50">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: "dispositivos", icon: HardDrive, label: "Dispositivos" },
                { id: "config", icon: Settings, label: "Config" },
                { id: "terminal", icon: Terminal, label: "Terminal" },
                { id: "logs", icon: Activity, label: "Logs" },
                { id: "analytics", icon: BarChart3, label: "Stats" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPanelActivo(tab.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all text-xs ${
                    panelActivo === tab.id
                      ? "bg-violet-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3">
                {panelActivo === "dispositivos" && (
                  <div className="space-y-4">
                    {/* Device library */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MonitorSpeaker className="w-4 h-4" />
                        Dispositivos
                      </h3>
                      <div className="space-y-2">
                        {tiposDispositivos.map((tipo) => (
                          <div
                            key={tipo.tipo}
                            draggable
                            onDragStart={() => setDispositivoArrastrado(tipo.tipo)}
                            className={`${tipo.bgColor} ${tipo.borderColor} border rounded-lg p-3 cursor-move transition-all hover:scale-105 hover:shadow-md group`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`p-2 bg-gradient-to-br ${tipo.color} rounded-lg shadow-sm`}>
                                <tipo.icono className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 text-sm">{tipo.nombre}</div>
                                <div className="text-xs text-gray-600">{tipo.descripcion}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Control panel */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Control
                      </h3>
                      <div className="space-y-2">
                        <Button
                          onClick={() => setSimulando(!simulando)}
                          className={`w-full text-white font-semibold shadow-md transition-all ${
                            simulando ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {simulando ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {simulando ? "DETENER" : "INICIAR"}
                        </Button>

                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            onClick={() => setModoConexion({ activo: !modoConexion.activo })}
                            variant={modoConexion.activo ? "default" : "outline"}
                            className={`text-xs ${
                              modoConexion.activo
                                ? "bg-violet-500 text-white"
                                : "border-violet-300 text-violet-600 hover:bg-violet-50"
                            }`}
                          >
                            <Cable className="w-3 h-3 mr-1" />
                            Cable
                          </Button>
                          <Button
                            onClick={() => setMostrarMetricas(!mostrarMetricas)}
                            variant="outline"
                            className="border-amber-300 text-amber-600 hover:bg-amber-50 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Métricas
                          </Button>
                          <Button
                            onClick={() => setMostrarCables(!mostrarCables)}
                            variant="outline"
                            className={`text-xs ${
                              mostrarCables
                                ? "border-blue-300 text-blue-600 bg-blue-50"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {mostrarCables ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                            Cables
                          </Button>
                        </div>

                        <Button
                          onClick={() => {
                            setDispositivos([])
                            setConexiones([])
                            setPaquetes([])
                            setLogs([])
                            setDispositivoSeleccionado(null)
                            setSimulando(false)
                            setModoConexion({ activo: false })
                            setHistorialComandos([])
                          }}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 text-sm"
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          REINICIAR
                        </Button>
                      </div>
                    </div>

                    {modoConexion.activo && (
                      <Alert className="bg-violet-50 border-violet-200">
                        <Cable className="h-3 w-3 text-violet-600" />
                        <AlertDescription className="text-violet-700 text-sm">
                          {modoConexion.origen
                            ? "Haz clic en la interfaz de destino"
                            : "Haz clic en la interfaz de origen"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {panelActivo === "config" && (
                  <div className="space-y-3">
                    {dispositivoSeleccionado ? (
                      <Card className="bg-white/80 border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              {dispositivoSeleccionado.nombre}
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarDispositivo(dispositivoSeleccionado.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs font-semibold">Nombre</Label>
                            <Input
                              value={dispositivoSeleccionado.nombre}
                              onChange={(e) =>
                                actualizarDispositivo(dispositivoSeleccionado.id, { nombre: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>

                          {dispositivoSeleccionado.tipo === "laptop" && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">IP</Label>
                                <Input
                                  value={dispositivoSeleccionado.ip || ""}
                                  onChange={(e) =>
                                    actualizarDispositivo(dispositivoSeleccionado.id, { ip: e.target.value })
                                  }
                                  placeholder="192.168.1.10"
                                  className="h-8 text-sm font-mono"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Máscara</Label>
                                <Input
                                  value={dispositivoSeleccionado.mascara || ""}
                                  onChange={(e) =>
                                    actualizarDispositivo(dispositivoSeleccionado.id, { mascara: e.target.value })
                                  }
                                  placeholder="255.255.255.0"
                                  className="h-8 text-sm font-mono"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Gateway</Label>
                                <Input
                                  value={dispositivoSeleccionado.gateway || ""}
                                  onChange={(e) =>
                                    actualizarDispositivo(dispositivoSeleccionado.id, { gateway: e.target.value })
                                  }
                                  placeholder="192.168.1.1"
                                  className="h-8 text-sm font-mono"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <Label className="text-xs font-semibold">Estado</Label>
                            <div className="flex gap-2 mt-1">
                              <Button
                                size="sm"
                                variant={dispositivoSeleccionado.estado === "encendido" ? "default" : "outline"}
                                onClick={() =>
                                  actualizarDispositivo(dispositivoSeleccionado.id, { estado: "encendido" })
                                }
                                className="h-7 text-xs flex-1"
                              >
                                <Power className="w-3 h-3 mr-1" />
                                ON
                              </Button>
                              <Button
                                size="sm"
                                variant={dispositivoSeleccionado.estado === "apagado" ? "default" : "outline"}
                                onClick={() => actualizarDispositivo(dispositivoSeleccionado.id, { estado: "apagado" })}
                                className="h-7 text-xs flex-1"
                              >
                                <PowerOff className="w-3 h-3 mr-1" />
                                OFF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">Selecciona un dispositivo</p>
                        <p className="text-xs text-gray-400">para configurarlo</p>
                      </div>
                    )}
                  </div>
                )}

                {panelActivo === "terminal" && (
                  <div className="space-y-3">
                    <Card className="bg-white/80 border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Terminal
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dispositivoSeleccionado ? (
                          <div className="space-y-3">
                            {/* Terminal header */}
                            <div className="bg-gray-900 rounded-t-lg p-2 border-b border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                  <span className="text-gray-300 text-xs font-mono">
                                    {dispositivoSeleccionado.nombre}@nexus
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 text-xs">SSH</span>
                                </div>
                              </div>
                            </div>

                            {/* Terminal body */}
                            <div className="bg-black rounded-b-lg p-3 h-48 overflow-y-auto font-mono text-xs">
                              <div>
                                {historialComandos.map((comando, index) => (
                                  <div key={index} className="mb-1">
                                    {comando.includes("@nexus:~$") ? (
                                      <div className="text-green-400">
                                        <span className="text-cyan-400">{dispositivoSeleccionado.nombre}</span>
                                        <span className="text-blue-400">@nexus</span>
                                        <span className="text-purple-400">:~</span>
                                        <span className="text-green-400">$ </span>
                                        <span className="text-yellow-300">{comando.split("$ ")[1] || ""}</span>
                                      </div>
                                    ) : comando.includes("Ping") || comando.includes("ping") ? (
                                      <div className="text-cyan-300">{comando}</div>
                                    ) : comando.includes("error") || comando.includes("Error") ? (
                                      <div className="text-red-400">{comando}</div>
                                    ) : comando.includes("Respuesta") ? (
                                      <div className="text-green-300">{comando}</div>
                                    ) : comando.includes("IP") || comando.includes("Dirección") ? (
                                      <div className="text-blue-300">{comando}</div>
                                    ) : (
                                      <div className="text-gray-300">{comando}</div>
                                    )}
                                  </div>
                                ))}
                                {/* Prompt actual */}
                                <div className="flex items-center text-green-400">
                                  <span className="text-cyan-400">{dispositivoSeleccionado.nombre}</span>
                                  <span className="text-blue-400">@nexus</span>
                                  <span className="text-purple-400">:~</span>
                                  <span className="text-green-400">$ </span>
                                  <span className="animate-pulse text-white">|</span>
                                </div>
                              </div>
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                              <Input
                                value={comandoActual}
                                onChange={(e) => setComandoActual(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    ejecutarComando(comandoActual)
                                  }
                                }}
                                placeholder="Comando..."
                                className="bg-gray-900 border-gray-700 text-green-400 font-mono placeholder-gray-500 h-8 text-xs"
                              />
                              <Button
                                onClick={() => ejecutarComando(comandoActual)}
                                className="bg-green-500 hover:bg-green-600 h-8 px-3"
                              >
                                <Terminal className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Quick commands */}
                            <div className="flex flex-wrap gap-1">
                              {["ping 192.168.1.11", "ipconfig", "help", "clear"].map((cmd) => (
                                <Button
                                  key={cmd}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => ejecutarComando(cmd)}
                                  className="text-xs h-6 px-2"
                                >
                                  {cmd}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-semibold">Selecciona un dispositivo</p>
                            <p className="text-xs text-gray-400">para acceder a su terminal</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {panelActivo === "logs" && (
                  <div className="space-y-3">
                    <Card className="bg-white/80 border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Logs
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {logs.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {logs.length === 0 ? (
                              <div className="text-center text-gray-500 py-8">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-semibold">Sin eventos</p>
                              </div>
                            ) : (
                              logs.map((log) => (
                                <div key={log.id} className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      log.tipo === "success"
                                        ? "bg-green-500"
                                        : log.tipo === "error"
                                          ? "bg-red-500"
                                          : log.tipo === "warning"
                                            ? "bg-amber-500"
                                            : "bg-blue-500"
                                    }`}
                                  />
                                  <div className="text-xs text-gray-700">
                                    <span className="font-semibold">{log.dispositivo}</span>: {log.mensaje}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {panelActivo === "analytics" && (
                  <div className="space-y-3">
                    <Card className="bg-white/80 border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Estadísticas
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dispositivos en línea:</span>
                            <span className="font-mono">{estadisticas.dispositivosOnline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total de dispositivos:</span>
                            <span className="font-mono">{estadisticas.dispositivosTotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conexiones activas:</span>
                            <span className="font-mono">{estadisticas.conexionesActivas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total de conexiones:</span>
                            <span className="font-mono">{estadisticas.conexionesTotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paquetes en transito:</span>
                            <span className="font-mono">{estadisticas.paquetesEnTransito}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trafico promedio:</span>
                            <span className="font-mono">{estadisticas.traficoPromedio}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25px 25px, rgba(139, 92, 246, 0.1) 2px, transparent 0),
                  radial-gradient(circle at 75px 75px, rgba(139, 92, 246, 0.05) 1px, transparent 0)
                `,
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="w-full h-full relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={manejarDrop}
            onClick={() => {
              if (modoConexion.activo) {
                setModoConexion({ activo: false })
              }
            }}
          >
            {/* Render connections only if mostrarCables is true */}
            {mostrarCables &&
              conexiones.map((conexion) => <ComponenteConexion key={conexion.id} conexion={conexion} />)}

            {/* Render devices */}
            {dispositivos.map((dispositivo) => (
              <ComponenteDispositivo key={dispositivo.id} dispositivo={dispositivo} />
            ))}

            {/* Render packets */}
            {paquetes.map((paquete) => (
              <ComponentePaquete key={paquete.id} paquete={paquete} />
            ))}

            {/* Drop zone indicator */}
            {dispositivoArrastrado && (
              <div className="absolute inset-0 bg-violet-500/10 border-4 border-dashed border-violet-400 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-6xl mb-4">🖥️</div>
                  <div className="text-2xl font-bold text-violet-600 mb-2">Suelta aquí para agregar</div>
                  <div className="text-violet-500">
                    {tiposDispositivos.find((t) => t.tipo === dispositivoArrastrado)?.nombre}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {dispositivos.length === 0 && !dispositivoArrastrado && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
                      <Network className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Bienvenido a NEXUS</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Arrastra dispositivos desde el panel lateral para comenzar a construir tu red
                    </p>
                    <div className="flex items-center justify-center gap-2 text-violet-600">
                      <Network className="w-5 h-5" />
                      <span className="font-semibold">¡Comienza ahora!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
