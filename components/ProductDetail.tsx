import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from '@/types/product';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

interface SubSubcategory {
  id: number;
  name: string;
  slug: string;
  subcategory_id: number;
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  userId: string | undefined;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ProductDetail({
  product,
  isOpen,
  onClose,
  onAddToCart,
  userId,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}: ProductDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Función optimizada para obtener imágenes
  const getImages = () => {
    if (typeof product.image_url === 'string') {
      try {
        return product.image_url
          .replace(/\[|\]/g, '')
          .split(',')
          .map(url => url.trim())
          .filter(Boolean); // Filtrar URLs vacías
      } catch {
        return [product.image_url];
      }
    }
    return Array.isArray(product.image_url) ? product.image_url : [];
  };

  const images = getImages();

  const formatPrice = (price: number | null) => {
    return price != null ? `$${price.toLocaleString("es-AR")}` : "Precio no disponible";
  };

  const handleAddToCart = () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    onAddToCart(product);
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Flechas de navegación entre productos */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-blanco/80 hover:bg-rosa-claro p-2 rounded-full shadow-lg transition-colors z-10"
          aria-label="Producto anterior"
        >
          <ChevronLeft className="h-6 w-6 text-negro" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blanco/80 hover:bg-rosa-claro p-2 rounded-full shadow-lg transition-colors z-10"
          aria-label="Producto siguiente"
        >
          <ChevronRight className="h-6 w-6 text-negro" />
        </button>
      )}
      <div className="bg-pink-200 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto relative">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-negro">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-negro/50 hover:text-rosa-oscuro transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative flex flex-col items-center">
              {/* Imagen principal animada */}
              <div className="relative aspect-square bg-gris-suave/20 rounded-lg w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Image
                      src={images[currentImageIndex] || '/placeholder-image.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg p-2"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Flechas para navegar imágenes */}
                {images.length > 1 && (
                  <div className="absolute inset-0 hidden md:flex items-center justify-between p-4 z-10">
                    <button
                      onClick={prevImage}
                      className="bg-blanco/80 hover:bg-rosa-claro p-2 rounded-full shadow-lg transition-colors"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-5 w-5 text-negro" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="bg-blanco/80 hover:bg-rosa-claro p-2 rounded-full shadow-lg transition-colors"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-5 w-5 text-negro" />
                    </button>
                  </div>
                )}
              </div>
              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 w-full">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center transition-all duration-200
                        ${index === currentImageIndex ? 'border-rosa-oscuro scale-105' : 'border-gris-suave opacity-70 hover:opacity-100'}`}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image
                        src={url || '/placeholder-image.jpg'}
                        alt={product.name + ' miniatura ' + (index + 1)}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-rosa-oscuro">
                  {formatPrice(product.price)}
                </h3>
                <div className="text-sm text-negro/70 mt-2 flex flex-wrap gap-2">
                  {product.category?.name && (
                    <span className="inline-block bg-rosa-claro/30 px-2 py-1 rounded-full text-negro/80">
                      {product.category.name}
                    </span>
                  )}
                  {product.subcategory && (
                    <span className="inline-block bg-rosa-claro/30 px-2 py-1 rounded-full text-negro/80">
                      {product.subcategory.name}
                    </span>
                  )}
                  {product.sub_subcategory && (
                    <span className="inline-block bg-rosa-claro/30 px-2 py-1 rounded-full text-negro/80">
                      {product.sub_subcategory.name}
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="border-t border-gris-suave pt-4">
                  <h4 className="font-medium text-negro text-lg">Descripción</h4>
                  <p className="text-negro/70 mt-2">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gris-suave pt-4">
                {product.stock !== undefined && product.stock !== null && (
                  <div>
                    <h4 className="font-medium text-negro">Stock disponible</h4>
                    <p className="text-negro/70 mt-1">{product.stock} unidades</p>
                  </div>
                )}

                {product.talla && (
                  <div>
                    <h4 className="font-medium text-negro">Talla</h4>
                    <p className="text-negro/70 mt-1">{product.talla}</p>
                  </div>
                )}
              </div>

              <motion.button
                onClick={handleAddToCart}
                className="w-full py-3 px-6 rounded-lg text-blanco font-medium bg-rosa-oscuro hover:bg-rosa-oscuro/90 text-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {userId ? "Agregar al carrito" : "Inicia sesión para comprar"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}