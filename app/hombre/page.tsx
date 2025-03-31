"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Search, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const menProducts: Product[] = [
  {
    id: 1,
    name: "Camisa Oxford Azul",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200",
    category: "Camisas"
  },
  {
    id: 2,
    name: "Jeans Slim Fit",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200",
    category: "Pantalones"
  },
  {
    id: 3,
    name: "Chaqueta de Cuero",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1200",
    category: "Chaquetas"
  },
  {
    id: 4,
    name: "Suéter de Lana",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1200",
    category: "Suéteres"
  }
];

export default function MenPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Menu className="h-6 w-6 mr-4 lg:hidden" />
              <Link href="/" className="text-2xl font-bold text-gray-900">MODA</Link>
            </div>
            <div className="hidden lg:flex space-x-8">
              <Link href="/mujer" className="text-gray-700 hover:text-gray-900">Mujer</Link>
              <Link href="/hombre" className="text-gray-900 font-semibold">Hombre</Link>
              <Link href="/accesorios" className="text-gray-700 hover:text-gray-900">Accesorios</Link>
              <Link href="/ofertas" className="text-gray-700 hover:text-gray-900">Ofertas</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="h-6 w-6 text-gray-600" />
              <Heart className="h-6 w-6 text-gray-600" />
              <div className="relative">
                <ShoppingCart 
                  className="h-6 w-6 text-gray-600 cursor-pointer" 
                  onClick={() => setShowCart(!showCart)}
                />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Header */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Moda Hombre</h1>
          <p className="mt-2 text-gray-600">Descubre nuestra colección para hombres</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">${product.price}</span>
                  <Button onClick={() => addToCart(product)}>
                    Añadir al carrito
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Carrito</h3>
                <Button variant="ghost" onClick={() => setShowCart(false)}>
                  ✕
                </Button>
              </div>
              {cart.length === 0 ? (
                <p className="text-gray-500">Tu carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-gray-600">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">
                        ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full">
                      Proceder al pago
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}