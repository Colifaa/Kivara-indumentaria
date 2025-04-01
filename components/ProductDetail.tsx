import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  description?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  material?: string;
  care_instructions?: string;
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

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    onAddToCart(product);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Información del producto */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.category} - {product.subcategory}
                </p>
              </div>

              {product.description && (
                <div>
                  <h4 className="font-medium text-gray-900">Descripción</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.stock !== undefined && (
                <div>
                  <h4 className="font-medium text-gray-900">Stock disponible</h4>
                  <p className="text-gray-600">{product.stock} unidades</p>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Tallas disponibles</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Colores disponibles</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.material && (
                <div>
                  <h4 className="font-medium text-gray-900">Material</h4>
                  <p className="text-gray-600">{product.material}</p>
                </div>
              )}

              {product.care_instructions && (
                <div>
                  <h4 className="font-medium text-gray-900">Instrucciones de cuidado</h4>
                  <p className="text-gray-600">{product.care_instructions}</p>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700"
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