"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ProductForm } from "./ProductForm";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string[];
  category_id: number;
  subcategory_id: number;
  sub_subcategory_id: number | null;
  description: string;
  stock: number;
  category?: string;
  subcategory?: string;
  sub_subcategory?: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const supabase = createClientComponentClient();

  // Remove currentPage from dependency array
  useEffect(() => {
    loadData();
    loadCategories();
  }, []); // Only run once when component mounts

  useEffect(() => {
    let filtered = products;
    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.category_id === selectedCategoryId);
    }
    
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, products, selectedCategoryId]); // Remove setCurrentPage(1) from here

  // Add a separate effect for handling page reset
  useEffect(() => {
    if (searchTerm || selectedCategoryId) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedCategoryId]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name),
          subcategories(name),
          sub_subcategories(name)
        `)
        .order("name", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedProducts = data.map((product: any) => ({
          ...product,
          category: product.categories?.name,
          subcategory: product.subcategories?.name,
          sub_subcategory: product.sub_subcategories?.name
        }));
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        setTotalPages(Math.ceil(formattedProducts.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener los productos de la página actual
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  // Función para formatear el precio en ARS
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return "Precio no disponible";
    }
    return `$${price.toLocaleString("es-AR")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-blanco rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-negro">Panel de Administración</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-rosa-oscuro rounded-md focus:outline-none focus:ring-2 focus:ring-rosa-oscuro focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-rosa-oscuro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={selectedCategoryId || ""}
            onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-rosa-oscuro rounded-md focus:outline-none focus:ring-2 focus:ring-rosa-oscuro focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingProduct(null);
              setSelectedCategoryId(null);
              setIsEditing(true);
            }}
            className="bg-rosa-oscuro text-blanco px-4 py-2 rounded-md hover:bg-rosa-claro hover:text-negro flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {isEditing && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsEditing(false);
            setEditingProduct(null);
          }}
          onSuccess={(updatedProduct) => {
            setIsEditing(false);
            setEditingProduct(null);
            if (updatedProduct) {
              // Actualizamos el producto en el estado
              setProducts(prevProducts => 
                prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
              );
              setFilteredProducts(prevFiltered => 
                prevFiltered.map(p => p.id === updatedProduct.id ? updatedProduct : p)
              );
            }
          }}
        />
      )}

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getCurrentPageProducts().map((product) => (
            <div key={product.id} className="bg-blanco rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 w-full">
                {product.image_url && product.image_url[0] ? (
                  <Image
                    src={product.image_url[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gris-suave flex items-center justify-center">
                    <span className="text-rosa-oscuro">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-negro mb-2">{product.name}</h3>
                <p className="text-rosa-oscuro mb-2">{formatPrice(product.price)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-negro">
                    Stock: {product.stock}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditing(true);
                      }}
                      className="p-2 text-rosa-oscuro hover:text-rosa-claro"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-rosa-oscuro hover:text-rosa-claro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-gris-suave hover:bg-rosa-claro disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 text-negro" />
          </button>
          <span className="text-negro">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-gris-suave hover:bg-rosa-claro disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5 text-negro" />
          </button>
        </div>
      </div>
    </div>
  );
}