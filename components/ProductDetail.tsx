import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  image_url: string;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-square">
              <Image
                src={product.image_url || '/placeholder-image.jpg'}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </h3>
                <div className="text-sm text-gray-500">
                  <p>{product.category?.name}</p>
                  {product.subcategory && <p>{product.subcategory.name}</p>}
                  {product.sub_subcategory && <p>{product.sub_subcategory.name}</p>}
                </div>
              </div>

              {product.description && (
                <div>
                  <h4 className="font-medium text-gray-900">Descripción</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.stock !== undefined && product.stock !== null && (
                <div>
                  <h4 className="font-medium text-gray-900">Stock disponible</h4>
                  <p className="text-gray-600">{product.stock} unidades</p>
                </div>
              )}

              {product.talla && (
                <div>
                  <h4 className="font-medium text-gray-900">Talla</h4>
                  <p className="text-gray-600">{product.talla}</p>
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