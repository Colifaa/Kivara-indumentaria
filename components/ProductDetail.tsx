import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | string[];
  category_id: number;
  subcategory_id: number;
  sub_subcategory_id: number;
  stock: number;
  talla: string;
  category: Category;
  subcategory: Subcategory;
  sub_subcategory: SubSubcategory;
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  userId?: string;
}

export function ProductDetail({
  product,
  isOpen,
  onClose,
  onAddToCart,
  userId
}: ProductDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImages = () => {
    if (typeof product.image_url === 'string') {
      try {
        // Limpiar el string de corchetes y espacios
        const cleanString = product.image_url.replace(/[\[\]]/g, '');
        // Dividir por comas y limpiar cada URL
        const urls = cleanString.split(',').map(url => url.trim());
        return urls;
      } catch (e) {
        // Si hay algún error, retornar el string original como único elemento
        return [product.image_url];
      }
    }
    return product.image_url;
  };

  const images = getImages();

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return "Precio no disponible";
    }
    return `$${price.toFixed(2)}`;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <div className="relative aspect-square">
                <Image
                  src={images[currentImageIndex] || '/placeholder-image.jpg'}
                  alt={product.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <button
                    onClick={prevImage}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </h3>
                <div className="text-sm text-gray-500 mt-2">
                  <p>{product.category?.name}</p>
                  {product.subcategory && <p>{product.subcategory.name}</p>}
                  {product.sub_subcategory && <p>{product.sub_subcategory.name}</p>}
                </div>
              </div>

              {product.description && (
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">Descripción</h4>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                </div>
              )}

              {product.stock !== undefined && product.stock !== null && (
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">Stock disponible</h4>
                  <p className="text-gray-600 mt-2">{product.stock} unidades</p>
                </div>
              )}

              {product.talla && (
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">Talla</h4>
                  <p className="text-gray-600 mt-2">{product.talla}</p>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 text-lg"
              >
                {userId ? "Agregar al carrito" : "Inicia sesión para comprar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 