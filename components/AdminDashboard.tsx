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
  image_url: string;
  category_id: number;
  subcategory_id: number;
  description: string;
  stock: number;
  category?: string;
  subcategory?: string;
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

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar categorías
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (categoriesData) setCategories(categoriesData);

      // Cargar subcategorías
      const { data: subcategoriesData } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');
      if (subcategoriesData) setSubcategories(subcategoriesData);

      // Cargar productos con paginación
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: productsData, count } = await supabase
        .from('products')
        .select('*, categories(name), subcategories(name)', { count: 'exact' })
        .range(from, to)
        .order('id', { ascending: true });

      if (productsData && count) {
        const formattedProducts = productsData.map(product => ({
          ...product,
          category: product.categories?.name,
          subcategory: product.subcategories?.name
        }));
        setProducts(formattedProducts);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setSelectedCategoryId(null);
            setIsEditing(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {isEditing && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsEditing(false);
            setEditingProduct(null);
            setSelectedCategoryId(null);
          }}
          onSuccess={() => {
            setIsEditing(false);
            setEditingProduct(null);
            setSelectedCategoryId(null);
            loadData();
          }}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Subcategoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 relative rounded overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-gray-500">{product.subcategory}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="text-sm text-gray-500">{product.stock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setSelectedCategoryId(product.category_id);
                        setIsEditing(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, products.length)}
              </span>{" "}
              de <span className="font-medium">{totalPages * itemsPerPage}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}