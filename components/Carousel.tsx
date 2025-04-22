"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselImage {
  url: string;
  alt: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  collection?: string; // Para mostrar nombre de colección
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlayInterval?: number;
}

export function Carousel({ images, autoPlayInterval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  // Pausar autoplay cuando el usuario interactúa
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((current) => (current + 1) % images.length);
    setIsPaused(true);
    
    // Reanudar autoplay después de interacción
    setTimeout(() => setIsPaused(false), 5000);
  }, [images.length, isAnimating]);

  const goToPrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((current) => (current - 1 + images.length) % images.length);
    setIsPaused(true);
    
    // Reanudar autoplay después de interacción
    setTimeout(() => setIsPaused(false), 5000);
  }, [images.length, isAnimating]);

  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval, images.length, isPaused]);

  // Restablecer la animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 700); // Coincidir con la duración de la animación

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full h-[75vh] overflow-hidden bg-negro">
      {/* Imagen de fondo con blur para efecto de profundidad */}
      <div className="absolute inset-0">
        <Image
          src={images[currentIndex].url}
          alt="Background"
          fill
          className="object-cover blur-sm scale-110 brightness-50"
          priority
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-negro/70 via-negro/40 to-negro/70" />

      <div className="relative h-full max-w-7xl mx-auto flex flex-col md:flex-row items-center overflow-hidden">
        {/* Contenido a la izquierda */}
        <div className="w-full md:w-1/2 px-6 md:px-10 py-10 flex flex-col justify-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-left"
            >
              {images[currentIndex].collection && (
                <span className="inline-block px-3 py-1 bg-rosa-claro/20 text-blanco rounded-full text-xs font-medium tracking-wider mb-4">
                  {images[currentIndex].collection}
                </span>
              )}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blanco mb-4 leading-tight">
                {images[currentIndex].title}
              </h2>
              <p className="text-lg text-blanco/80 mb-8 max-w-lg">
                {images[currentIndex].subtitle}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(images[currentIndex].buttonLink)}
                className="group flex items-center bg-blanco text-negro px-8 py-3 rounded-full font-medium hover:bg-rosa-oscuro hover:text-blanco transition-colors duration-300"
              >
                <span>{images[currentIndex].buttonText}</span>
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Imagen principal a la derecha */}
        <div className="w-full md:w-1/2 h-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className="h-full relative"
            >
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt}
                fill
                className="object-cover object-center"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Línea decorativa vertical */}
        <div className="hidden md:block absolute top-1/4 bottom-1/4 left-1/2 w-px bg-blanco/20"></div>
      </div>

      {/* Controles de navegación */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center z-20">
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isAnimating) return;
                setIsAnimating(true);
                setCurrentIndex(index);
              }}
              className="group relative"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block w-8 h-1 ${
                  index === currentIndex ? "bg-rosa-claro" : "bg-blanco/30"
                } transition-all duration-300 group-hover:bg-blanco`}
              />
              {index === currentIndex && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute -bottom-3 left-0 w-1 h-1 bg-rosa-claro rounded-full"
                  transition={{ duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevious}
            className="w-10 h-10 rounded-full border border-blanco/30 flex items-center justify-center text-blanco hover:bg-blanco hover:text-negro transition-colors"
            disabled={isAnimating}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            className="w-10 h-10 rounded-full border border-blanco/30 flex items-center justify-center text-blanco hover:bg-blanco hover:text-negro transition-colors"
            disabled={isAnimating}
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}