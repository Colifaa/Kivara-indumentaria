import React from 'react'
import { motion, AnimatePresence } from "framer-motion";

function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl my-20">
    <div className="bg-gradient-to-r from-rosa-oscuro to-rosa-claro text-blanco p-10 md:p-16">
      <div className="max-w-lg">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Descubre nuestras ofertas especiales</h2>
        <p className="text-blanco/80 mb-6">
          Hasta 30% de descuento en productos seleccionados por tiempo limitado
        </p>
     
      </div>
    </div>
    <div className="absolute -right-16 -bottom-16 h-64 w-64 md:h-80 md:w-80 bg-blanco/10 rounded-full"></div>
    <div className="absolute right-20 -top-20 h-40 w-40 bg-blanco/10 rounded-full"></div>
  </div>
  )
}

export default Banner

       