"use client";

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-rosa-oscuro to-negro text-blanco">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Logo centrado */}
        <div className="w-full flex justify-center mb-8">
          <Image 
            src="/Logo.png" 
            alt="Inndumentaria Logo" 
            width={360} 
            height={67}
          />
        </div>
        
        {/* Columnas: Redes sociales (izquierda) y Contacto (derecha) */}
        <div className="flex flex-col md:flex-row justify-between">
          {/* Columna izquierda - Redes sociales */}
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            {/* Descripción arriba de "Síguenos" */}
            <p className="text-blanco/80 mb-8 text-center md:text-left max-w-md">
              Somos tu destino de moda favorito, ofreciendo las últimas tendencias en ropa y accesorios para toda la familia.
            </p>
            
            <h3 className="text-xl font-bold mr-44 mb-6">Síguenos</h3>
            <div className="flex space-x-6 mr-28">
              <motion.a
                href="https://www.facebook.com/share/14HGgAX8GN/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Facebook size={24} />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/kivara.ind?igsh=MW9ocnlzbng1N2t4MQ=="
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Instagram size={24} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-blanco hover:text-rosa-claro transition-colors"
              >
                <Twitter size={24} />
              </motion.a>
            </div>
          </div>

          {/* Columna derecha - Contacto */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-xl font-bold items-center mr-44 mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-rosa-claro flex-shrink-0" />
                <span className="text-blanco/80">+54 9 3874 86-2962</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-rosa-claro flex-shrink-0" />
                <a href="mailto:info@inndumentaria.com" className="text-blanco/80 hover:text-rosa-claro transition-colors">
                kivara.indumentaria1@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={20} className="text-rosa-claro flex-shrink-0" />
                <span className="text-blanco/80">Salta, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-blanco/10">
        <p className="text-center text-blanco/60 text-sm">
  © {new Date().getFullYear()} -{" "}
  <a
    href="https://portfolioo-eta-three.vercel.app/"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-blanco/80 transition"
  >
   Kivara. Todos los derechos reservados.
  </a>
</p>
        </div>
      </div>
    </footer>
  );
}