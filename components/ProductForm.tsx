"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { X } from "lucide-react";

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

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: number; name: string; category_id: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    image: "",
    category: "",
    subcategory: "",
    description: "",
    stock: 0,
    sizes: [],
    colors: [],
    material: "",
    care_instructions: ""
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData(product);
      setSelectedCategory(product.category);
    }
  }, [product]);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading categories:", error);
      return;
    }

    setCategories(data);
  };

  const loadSubcategories = async (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return;

    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", category.id)
      .order("name");

    if (error) {
      console.error("Error loading subcategories:", error);
      return;
    }

    setSubcategories(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setFormData(prev => ({
      ...prev,
      category: value,
      subcategory: ""
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subcategoría
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                required
                disabled={!selectedCategory}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecciona una subcategoría</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instrucciones de cuidado
              </label>
              <textarea
                name="care_instructions"
                value={formData.care_instructions}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {product ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 