"use client";

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className=" relative bg-gradient-to-b from-rosa-oscuro to-negro text-blanco">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre Nosotros */}
          <div>
            <h3 className="text-xl font-bold mb-4">Sobre Nosotros</h3>
            <p className="text-blanco/80 mb-4">
              Somos tu destino de moda favorito, ofreciendo las últimas tendencias en ropa y accesorios para toda la familia.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Política de Envíos
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-rosa-claro" />
                <span className="text-blanco/80">+54 9 260 422-4940</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-rosa-claro" />
                <a href="mailto:info@inndumentaria.com" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                  info@inndumentaria.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={20} className="text-rosa-claro" />
                <span className="text-blanco/80">San Rafael, Mendoza</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blanco/10">
          <p className="text-center text-blanco/60">
            © {new Date().getFullYear()} Inndumentaria. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
} 