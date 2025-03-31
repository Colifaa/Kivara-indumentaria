"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Search, Menu } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
}

interface FilterState {
  category: string | null;
  subcategory: string | null;
}

const womenProducts: Product[] = [
  {
    id: 1,
    name: "Conjunto de Encaje",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200",
    category: "Lencería",
    subcategory: "Corsetería"
  },
  {
    id: 2,
    name: "Conjunto Deportivo",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1630189498786-8c00d8b24ca8?q=80&w=1200",
    category: "Lencería",
    subcategory: "Conjuntos deportivos"
  },
  {
    id: 3,
    name: "Remera Manga Corta",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
    category: "Remeras",
    subcategory: "Mangas cortas"
  },
  {
    id: 4,
    name: "Remera Manga Larga",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1200",
    category: "Remeras",
    subcategory: "Mangas largas"
  },
  {
    id: 5,
    name: "Jean Skinny",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200",
    category: "Jeans",
    subcategory: "Jeans"
  },
  {
    id: 6,
    name: "Campera de Jean",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1200",
    category: "Camperas",
    subcategory: "Camperas"
  },
  {
    id: 7,
    name: "Conjunto Deportivo",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200",
    category: "Ropa deportiva",
    subcategory: "Conjuntos"
  },
  {
    id: 8,
    name: "Calza Deportiva",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200",
    category: "Ropa deportiva",
    subcategory: "Calzas"
  }
];

const menProducts: Product[] = [
  {
    id: 9,
    name: "Bóxer Premium",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200",
    category: "Ropa interior",
    subcategory: "Bóxer"
  },
  {
    id: 10,
    name: "Pack Medias Deportivas",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=1200",
    category: "Ropa interior",
    subcategory: "Medias"
  },
  {
    id: 11,
    name: "Remera Básica",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
    category: "Remeras",
    subcategory: "Mangas cortas"
  },
  {
    id: 12,
    name: "Remera Manga Larga",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1200",
    category: "Remeras",
    subcategory: "Mangas largas"
  },
  {
    id: 13,
    name: "Conjunto Deportivo",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200",
    category: "Ropa deportiva",
    subcategory: "Conjuntos"
  },
  {
    id: 14,
    name: "Jogging Deportivo",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200",
    category: "Ropa deportiva",
    subcategory: "Jogging"
  }
];

const kidsProducts: Product[] = [
  {
    id: 15,
    name: "Conjunto Infantil",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200",
    category: "Niños",
    subcategory: "Conjuntos"
  },
  {
    id: 16,
    name: "Remera Infantil",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200",
    category: "Niños",
    subcategory: "Remeras"
  }
];

const accessoryProducts: Product[] = [
  {
    id: 17,
    name: "Cinturón de Cuero",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200",
    category: "Accesorios",
    subcategory: "Cinturones"
  },
  {
    id: 18,
    name: "Gorra Deportiva",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200",
    category: "Accesorios",
    subcategory: "Gorras"
  }
];

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [filters, setFilters] = useState<Record<string, FilterState>>({
    dama: { category: null, subcategory: null },
    hombre: { category: null, subcategory: null },
    ninos: { category: null, subcategory: null },
    accesorios: { category: null, subcategory: null }
  });

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const filterProducts = (products: Product[], section: string) => {
    const sectionFilters = filters[section];
    let filteredProducts = products;
    
    if (sectionFilters.category) {
      filteredProducts = filteredProducts.filter(product => product.category === sectionFilters.category);
    }
    
    if (sectionFilters.subcategory) {
      filteredProducts = filteredProducts.filter(product => product.subcategory === sectionFilters.subcategory);
    }
    
    return filteredProducts;
  };

  const getUniqueSubcategories = (products: Product[], category: string) => {
    const filteredProducts = products.filter(product => product.category === category);
    return [...new Set(filteredProducts.map(product => product.subcategory))];
  };

  const handleCategoryClick = (category: string, section: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        category: prev[section].category === category ? null : category,
        subcategory: null
      }
    }));
  };

  const handleSubcategoryClick = (subcategory: string, section: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subcategory: prev[section].subcategory === subcategory ? null : subcategory
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Menu className="h-6 w-6 mr-4 lg:hidden" />
              <span className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => scrollToSection('inicio')}>MODA</span>
            </div>
            <div className="hidden lg:flex space-x-8">
              <button 
                onClick={() => scrollToSection('dama')}
                className={`${activeSection === 'dama' ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:text-gray-900`}
              >
                Dama
              </button>
              <button 
                onClick={() => scrollToSection('hombre')}
                className={`${activeSection === 'hombre' ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:text-gray-900`}
              >
                Hombre
              </button>
              <button 
                onClick={() => scrollToSection('ninos')}
                className={`${activeSection === 'ninos' ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:text-gray-900`}
              >
                Niños
              </button>
              <button 
                onClick={() => scrollToSection('accesorios')}
                className={`${activeSection === 'accesorios' ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:text-gray-900`}
              >
                Accesorios
              </button>
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

      <div id="inicio" className="relative pt-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200')" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">Nueva Colección</h2>
              <p className="text-xl md:text-2xl mb-8">Descubre las últimas tendencias en moda</p>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" onClick={() => scrollToSection('dama')}>
                Comprar Ahora
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="dama" className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Moda Dama</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {['Lencería', 'Remeras', 'Jeans', 'Camperas', 'Ropa deportiva'].map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category, 'dama')}
                variant={filters.dama.category === category ? "default" : "outline"}
              >
                {category}
              </Button>
            ))}
          </div>
          {filters.dama.category && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Subcategorías</h3>
              <div className="flex flex-wrap gap-4">
                {getUniqueSubcategories(womenProducts, filters.dama.category).map((subcategory) => (
                  <Button
                    key={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory, 'dama')}
                    variant={filters.dama.subcategory === subcategory ? "default" : "outline"}
                    size="sm"
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterProducts(womenProducts, 'dama').map((product) => (
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
                  <p className="text-gray-600 mb-4">{product.subcategory}</p>
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
      </div>

      <div id="hombre" className="bg-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Moda Hombre</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {['Ropa interior', 'Remeras', 'Ropa deportiva'].map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category, 'hombre')}
                variant={filters.hombre.category === category ? "default" : "outline"}
              >
                {category}
              </Button>
            ))}
          </div>
          {filters.hombre.category && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Subcategorías</h3>
              <div className="flex flex-wrap gap-4">
                {getUniqueSubcategories(menProducts, filters.hombre.category).map((subcategory) => (
                  <Button
                    key={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory, 'hombre')}
                    variant={filters.hombre.subcategory === subcategory ? "default" : "outline"}
                    size="sm"
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterProducts(menProducts, 'hombre').map((product) => (
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
                  <p className="text-gray-600 mb-4">{product.subcategory}</p>
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
      </div>

      <div id="ninos" className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Moda Niños</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kidsProducts.map((product) => (
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
                  <p className="text-gray-600 mb-4">{product.subcategory}</p>
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
      </div>

      <div id="accesorios" className="bg-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Accesorios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessoryProducts.map((product) => (
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
                  <p className="text-gray-600 mb-4">{product.subcategory}</p>
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
      </div>

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