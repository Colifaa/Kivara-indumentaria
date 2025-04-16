"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CarouselImage {
  url: string;
  alt: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlayInterval?: number;
}

export function Carousel({ images, autoPlayInterval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (autoPlayInterval <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval, images.length]);

  const goToNext = () => {
    setCurrentIndex((current) => (current + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((current) => (current - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Imagen actual */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          fill
          className="object-cover"
          priority
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Contenido superpuesto */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            {images[currentIndex].title}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl animate-fade-in">
            {images[currentIndex].subtitle}
          </p>
          <button
            onClick={() => router.push(images[currentIndex].buttonLink)}
            className="bg-[#BB6A8C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#a25a7a] transition-colors animate-fade-in"
          >
            {images[currentIndex].buttonText}
          </button>
        </div>
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#FAD4D8] text-black p-2 rounded-full hover:bg-[#BB6A8C] hover:text-white transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FAD4D8] text-black p-2 rounded-full hover:bg-[#BB6A8C] hover:text-white transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-[#BB6A8C]" : "bg-[#FAD4D8]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Agregar estos estilos al archivo globals.css
/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
*/