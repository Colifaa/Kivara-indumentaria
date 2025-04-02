"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
  subcategory_id: number;
  description: string;
  stock: number;
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

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Estado para manejar la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);

  useEffect(() => {
    loadCategories();
    if (product) {
      setSelectedCategoryId(product.category_id);
    }
  }, [product]);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = subcategories.filter((sub) => sub.category_id === selectedCategoryId);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategoryId, subcategories]);

  const loadCategories = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (categoriesData) setCategories(categoriesData);

      const { data: subcategoriesData } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
      if (subcategoriesData) setSubcategories(subcategoriesData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Previsualización local
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        image_url: imagePreview || "", // Usar la URL de previsualización o dejar vacío
        category_id: parseInt(formData.get("category_id") as string),
        subcategory_id: parseInt(formData.get("subcategory_id") as string),
        stock: parseInt(formData.get("stock") as string),
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={product?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imagen
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Seleccionar Imagen
                  </label>
                  {imagePreview && (
                    <div className="relative h-16 w-16">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  defaultValue={product?.stock}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  name="category_id"
                  value={selectedCategoryId || ""}
                  onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
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
                  name="subcategory_id"
                  defaultValue={product?.subcategory_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={!selectedCategoryId}
                >
                  <option value="">Selecciona una subcategoría</option>
                  {filteredSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={product?.description}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}