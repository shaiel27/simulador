import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Network,
  Monitor,
  Router,
  Wifi,
  Laptop,
  Terminal,
  Activity,
  BarChart3,
  Zap,
  Users,
  Code,
  Play,
  ArrowRight,
  CheckCircle,
  Globe,
  Settings,
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Monitor,
      title: "Interfaz Drag & Drop",
      description: "Arrastra dispositivos al canvas para crear tu red de forma intuitiva",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Zap,
      title: "Simulación en Tiempo Real",
      description: "Visualiza el tráfico de paquetes y métricas de rendimiento en vivo",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Terminal,
      title: "Terminal Integrada",
      description: "Ejecuta comandos de red como ping, ipconfig desde cada dispositivo",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Settings,
      title: "Configuración Avanzada",
      description: "Configura IPs, máscaras de subred, gateways y estados de dispositivos",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Activity,
      title: "Logs del Sistema",
      description: "Monitorea eventos y actividad de la red en tiempo real",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Estadísticas Detalladas",
      description: "Visualiza métricas de CPU, RAM, tráfico y rendimiento",
      color: "from-indigo-500 to-purple-600",
    },
  ]

  const devices = [
    {
      icon: Laptop,
      name: "Laptops/PCs",
      description: "Dispositivos de usuario final con configuración IP completa",
      color: "from-violet-500 to-indigo-600",
    },
    {
      icon: Router,
      name: "Routers",
      description: "Dispositivos de enrutamiento L3 con múltiples interfaces",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Wifi,
      name: "Switches",
      description: "Dispositivos de conmutación L2 con 4 puertos FastEthernet",
      color: "from-amber-500 to-red-600",
    },
  ]

  const commands = [
    { cmd: "ping <ip>", desc: "Probar conectividad entre dispositivos" },
    { cmd: "ipconfig", desc: "Mostrar configuración de red del dispositivo" },
    { cmd: "help", desc: "Ver lista completa de comandos disponibles" },
    { cmd: "clear", desc: "Limpiar la terminal" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <Link href="/simulador">
              <Button className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold shadow-lg">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Simulador
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-4">
                🚀 Simulador Educativo Avanzado
              </Badge>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Aprende Redes de Computadoras
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  de Forma Interactiva
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Una plataforma completa para simular, configurar y monitorear redes de computadoras. Perfecta para
                estudiantes, profesores y profesionales de TI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/simulador">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold shadow-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar Simulación
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-violet-300 text-violet-600 hover:bg-violet-50 bg-transparent"
              >
                <Globe className="w-5 h-5 mr-2" />
                Ver Documentación
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600">3</div>
                <div className="text-gray-600 text-sm">Tipos de Dispositivos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">∞</div>
                <div className="text-gray-600 text-sm">Topologías Posibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">100%</div>
                <div className="text-gray-600 text-sm">Tiempo Real</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0€</div>
                <div className="text-gray-600 text-sm">Completamente Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Características Principales</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para aprender y enseñar redes de computadoras
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 shadow-lg`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Devices Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Dispositivos Disponibles</h3>
            <p className="text-gray-600 text-lg">Simula redes reales con dispositivos profesionales</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {devices.map((device, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${device.color} p-4 mb-4 shadow-lg`}>
                    <device.icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{device.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{device.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Commands Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Terminal Integrada</h3>
            <p className="text-gray-300 text-lg">Ejecuta comandos de red reales desde cada dispositivo</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 text-sm ml-4 font-mono">Laptop1@nexus:~$</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="space-y-3">
                  {commands.map((cmd, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-green-400">$</span>
                      <span className="text-yellow-300 font-semibold">{cmd.cmd}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-300">{cmd.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-cyan-300">
                  <div>$ ping 192.168.1.1</div>
                  <div className="text-green-300 mt-1">Ping a 192.168.1.1: Respuesta recibida (12ms)</div>
                  <div className="text-green-400 mt-2 animate-pulse">Laptop1@nexus:~$ |</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo Funciona?</h3>
            <p className="text-gray-600 text-lg">Crear una red es tan fácil como 1, 2, 3</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg">
                1
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Arrastra Dispositivos</h4>
              <p className="text-gray-600">
                Selecciona laptops, routers y switches desde el panel lateral y arrástralos al canvas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg">
                2
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Conecta y Configura</h4>
              <p className="text-gray-600">
                Conecta dispositivos con cables virtuales y configura IPs, máscaras y gateways
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg">
                3
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Simula y Aprende</h4>
              <p className="text-gray-600">
                Inicia la simulación, ejecuta comandos y observa el tráfico de red en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">¿Listo para Comenzar?</h3>
            <p className="text-xl text-violet-100 mb-8 leading-relaxed">
              Únete a miles de estudiantes y profesionales que ya están aprendiendo redes de computadoras con nuestro
              simulador interactivo.
            </p>
            <Link href="/simulador">
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 font-semibold shadow-xl">
                <Play className="w-5 h-5 mr-2" />
                Comenzar Ahora - Es Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">NEXUS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Simulador de redes educativo diseñado para facilitar el aprendizaje de conceptos de networking de forma
                práctica e interactiva.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Características</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Simulación en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Terminal integrada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Múltiples dispositivos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Completamente gratuito
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Desarrolladores</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-violet-400">
                  <Code className="w-4 h-4" />
                  <span className="font-semibold">Shaiel Becerra</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-400">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">Yoangel Godoy</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Simulador de Red NEXUS. Proyecto educativo de código abierto.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
