import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ParticlesBackground } from '@/components/ParticlesBackground';
import Wsp from '@/components/Wsp';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MODA - Tienda Virtual de Indumentaria',
  description: 'Descubre las últimas tendencias en moda y ropa de alta calidad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-rosa-claro`} suppressHydrationWarning>
        <Wsp/>
        <ParticlesBackground />
        {children}
      </body>
    </html>
  );
}