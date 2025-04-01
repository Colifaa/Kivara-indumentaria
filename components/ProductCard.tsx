"use client";

import { Card } from "@/components/ui/card";
import { FavoritesButton } from "./FavoritesButton";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductDetail } from "./ProductDetail";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  subcategory: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  userId?: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, userId, onAddToCart }: ProductCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();

  const handleAddToCart = () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="relative aspect-square cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{product.category}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ProductDetail
        product={product}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onAddToCart={handleAddToCart}
        userId={userId}
      />
    </div>
  );
} 