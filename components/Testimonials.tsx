"use client";

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Cliente Frecuente",
    image: "/testimonials/maria.jpg",
    content: "Excelente calidad en todas las prendas. El servicio al cliente es excepcional y los envíos son muy rápidos.",
    rating: 5
  },
  {
    id: 2,
    name: "Juan Pérez",
    role: "Cliente Verificado",
    image: "/testimonials/juan.jpg",
    content: "Me encanta la variedad de productos y los precios son muy competitivos. Definitivamente mi tienda favorita.",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Cliente VIP",
    image: "/testimonials/ana.jpg",
    content: "La calidad de la ropa es increíble y el proceso de compra es muy sencillo. ¡Altamente recomendado!",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="relative py-16 bg-gris-suave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-negro mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-negro/60 max-w-2xl mx-auto">
            Nos enorgullece brindar la mejor experiencia de compra a nuestros clientes. 
            Aquí algunos testimonios de personas que confían en nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-blanco p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <div className="w-full h-full bg-rosa-claro flex items-center justify-center text-blanco text-lg font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-negro">{testimonial.name}</h3>
                  <p className="text-sm text-negro/60">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              <p className="text-negro/80 italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 