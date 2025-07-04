import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simulador de Red NEXUS - Plataforma Educativa Interactiva",
  description:
    "Aprende redes de computadoras de forma interactiva. Simula dispositivos, configura IPs, ejecuta comandos y visualiza tráfico en tiempo real. Perfecto para estudiantes y profesionales de TI.",
  keywords: "simulador de red, redes de computadoras, networking, educación, IT, cisco, router, switch, ping, ipconfig",
  authors: [{ name: "Shaiel Becerra" }, { name: "Yoangel Godoy" }],
  openGraph: {
    title: "Simulador de Red NEXUS",
    description: "Plataforma educativa interactiva para aprender redes de computadoras",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
