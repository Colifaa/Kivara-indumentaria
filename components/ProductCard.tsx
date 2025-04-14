"use client";

import { Card } from "@/components/ui/card";
import { FavoritesButton } from "./FavoritesButton";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductDetail } from "./ProductDetail";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface ProductCardProps {
  product: Product;
  userId?: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, userId, onAddToCart }: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const router = useRouter();

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

  const handleAddToCart = () => {
    if (userId) {
      onAddToCart(product);
    } else {
      setShowLoginAlert(true);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginAlert(false);
    router.push('/login');
  };

  // Función para formatear el precio
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return "Precio no disponible";
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-square cursor-pointer" onClick={() => setIsDetailOpen(true)}>
          <Image
            src={images[0] || '/placeholder-image.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <div className="mt-1 text-sm text-gray-500">
            <p>{product.category?.name}</p>
            {product.subcategory && <p>{product.subcategory.name}</p>}
            {product.sub_subcategory && <p>{product.sub_subcategory.name}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold">{formatPrice(product.price)}</span>
            <Button onClick={handleAddToCart}>
              Agregar al carrito
            </Button>
          </div>
        </div>
      </Card>

      <ProductDetail
        product={product}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={onAddToCart}
        userId={userId}
      />

      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar sesión requerido</AlertDialogTitle>
            <AlertDialogDescription>
              Para agregar productos al carrito debes iniciar sesión
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLoginRedirect}>
              Ir a login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 