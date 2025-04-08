"use client";

import { Card } from "@/components/ui/card";
import { FavoritesButton } from "./FavoritesButton";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductDetail } from "./ProductDetail";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

interface ProductCardProps {
  product: Product;
  userId?: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, userId, onAddToCart }: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
            src={product.image_url || '/placeholder-image.jpg'}
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
            <Button onClick={() => onAddToCart(product)}>
              {userId ? "Agregar al carrito" : "Iniciar sesión"}
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
    </>
  );
} 