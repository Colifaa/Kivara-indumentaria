"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { X, Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string[];
  stock: number;
  category_id: number;
  subcategory_id: number;
  sub_subcategory_id: number | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  created_at: string;
}

interface SubSubcategory {
  id: number;
  name: string;
  slug: string;
  subcategory_id: number;
  created_at: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subSubcategories, setSubSubcategories] = useState<SubSubcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubSubcategories, setFilteredSubSubcategories] = useState<SubSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(false);
  const [showNewSubSubcategoryForm, setShowNewSubSubcategoryForm] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubSubcategoryName, setNewSubSubcategoryName] = useState("");
  const supabase = createClientComponentClient();

  // Estado para manejar múltiples imágenes
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product?.image_url || []
  );

  const [selectedSubSubcategoryId, setSelectedSubSubcategoryId] = useState<number | null>(null);
  const [isSubSubcategoryModalOpen, setIsSubSubcategoryModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    if (product) {
      setSelectedCategoryId(product.category_id);
      setSelectedSubcategoryId(product.subcategory_id);
      setSelectedSubSubcategoryId(product.sub_subcategory_id);
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

  useEffect(() => {
    if (selectedSubcategoryId) {
      const filtered = subSubcategories.filter((sub) => sub.subcategory_id === selectedSubcategoryId);
      setFilteredSubSubcategories(filtered);
    } else {
      setFilteredSubSubcategories([]);
    }
  }, [selectedSubcategoryId, subSubcategories]);

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

      const { data: subSubcategoriesData } = await supabase
        .from("sub_subcategories")
        .select("*")
        .order("name");
      if (subSubcategoriesData) setSubSubcategories(subSubcategoriesData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const uploadImagesToStorage = async (files: File[], subcategoryName: string): Promise<string[]> => {
    try {
      // Verificar que el usuario esté autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Debes estar autenticado para subir imágenes');
      }

      // Sanitizar el nombre de la carpeta
      const folderName = subcategoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      const uploadPromises = files.map(async (file) => {
        try {
          // Validar el archivo
          if (!file || file.size > 5 * 1024 * 1024) {
            throw new Error('Archivo demasiado grande o inválido');
          }

          // Crear un nombre único para el archivo
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Asegurarnos de que la ruta del archivo sea correcta
          const filePath = `${folderName}/${fileName}`;

          console.log('Intentando subir archivo:', {
            bucket: 'products-images',
            filePath,
            fileSize: file.size,
            fileType: file.type
          });

          // Subir el archivo al bucket
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('products-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Error al subir archivo:', uploadError);
            throw uploadError;
          }

          console.log('Archivo subido exitosamente:', uploadData);

          // Obtener la URL pública del bucket
          const { data } = supabase
            .storage
            .from('products-images')
            .getPublicUrl(filePath);

          console.log('URL pública generada:', data.publicUrl);

          return data.publicUrl;
        } catch (error) {
          console.error('Error al procesar archivo:', error);
          throw error;
        }
      });

      // Esperar a que todas las imágenes se suban y manejar errores individuales
      const results = await Promise.allSettled(uploadPromises);
      
      // Filtrar solo las URLs de las subidas exitosas
      const urls = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);

      // Mostrar errores específicos para las subidas fallidas
      results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .forEach(result => {
          console.error('Error en subida individual:', result.reason);
        });

      if (urls.length === 0) {
        throw new Error('No se pudo subir ninguna imagen');
      }

      console.log('URLs de imágenes subidas:', urls);

      return urls;
    } catch (error) {
      console.error('Error en uploadImagesToStorage:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Obtener la subcategoría seleccionada
      const subcategoryId = parseInt(formData.get("subcategory_id") as string);
      const selectedSubcategory = subcategories.find(sub => sub.id === subcategoryId);
      
      if (!selectedSubcategory) {
        throw new Error("Subcategoría no encontrada");
      }

      // Subir imágenes nuevas si hay
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          imageUrls = await uploadImagesToStorage(selectedImages, selectedSubcategory.slug);
          console.log('URLs de imágenes subidas:', imageUrls);
        } catch (uploadError) {
          console.error('Error al subir imágenes:', uploadError);
          alert('Error al subir las imágenes. Por favor, inténtalo de nuevo.');
          return;
        }
      }

      // Mantener las URLs existentes que no fueron eliminadas
      const existingUrls = product?.image_url || [];
      const finalImageUrls = Array.isArray(existingUrls) 
        ? [...existingUrls.filter(url => imagePreviews.includes(url)), ...imageUrls]
        : imageUrls;

      if (finalImageUrls.length === 0) {
        alert('Debes agregar al menos una imagen al producto');
        return;
      }

      // Obtener el ID de la sub-subcategoría
      const subSubcategoryId = formData.get("sub_subcategory_id") 
        ? parseInt(formData.get("sub_subcategory_id") as string)
        : null;

      console.log('Sub-subcategoría seleccionada:', subSubcategoryId);

      // Asegurarnos de que las URLs se guarden como un array de strings sin comillas adicionales
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        image_url: finalImageUrls.map(url => url.trim()), // Asegurarnos de que no haya espacios
        category_id: parseInt(formData.get("category_id") as string),
        subcategory_id: subcategoryId,
        sub_subcategory_id: subSubcategoryId,
        stock: parseInt(formData.get("stock") as string),
      };

      console.log('Datos del producto a guardar:', productData);

      if (product) {
        // Si estamos editando, primero eliminamos las imágenes que ya no están en uso
        if (Array.isArray(product.image_url)) {
          const imagesToDelete = product.image_url.filter(url => !finalImageUrls.includes(url));
          for (const url of imagesToDelete) {
            try {
              // Extraer el path relativo de la URL completa
              const path = url.split('products-images/')[1];
              if (path) {
                await supabase.storage
                  .from('products-images')
                  .remove([path]);
              }
            } catch (deleteError) {
              console.error('Error al eliminar imagen antigua:', deleteError);
            }
          }
        }

        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) {
          console.error('Error al actualizar producto:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert([productData]);
        
        if (insertError) {
          console.error('Error al insertar producto:', insertError);
          throw insertError;
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto. Por favor, verifica los datos e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Validar tamaño y tipo de archivo
      const validFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB máximo
        return isValidType && isValidSize;
      });

      if (validFiles.length !== newFiles.length) {
        alert('Algunos archivos fueron ignorados. Solo se permiten imágenes JPG, PNG o WebP de hasta 5MB.');
      }

      setSelectedImages(prev => [...prev, ...validFiles]);
      
      // Crear URLs de previsualización temporales
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // Liberar la URL de previsualización
    if (imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateUniqueSlug = (name: string) => {
    const baseSlug = name.toLowerCase().replace(/ /g, "-");
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
  };

  const createNewSubcategory = async () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) return;

    try {
      setIsLoading(true);
      const slug = generateUniqueSlug(newSubcategoryName);
      
      const { data: newSubcategory, error } = await supabase
        .from("subcategories")
        .insert([{
          name: newSubcategoryName,
          category_id: selectedCategoryId,
          slug: slug
        }])
        .select()
        .single();

      if (error) throw error;

      if (newSubcategory) {
        setSubcategories([...subcategories, newSubcategory]);
        setSelectedSubcategoryId(newSubcategory.id);
        setNewSubcategoryName("");
        setShowNewSubcategoryForm(false);
      }
    } catch (error) {
      console.error("Error al crear subcategoría:", error);
      alert("Error al crear la subcategoría");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSubSubcategory = async () => {
    if (!selectedSubcategoryId || !newSubSubcategoryName.trim()) return;

    try {
      setIsLoading(true);
      const slug = generateUniqueSlug(newSubSubcategoryName);
      
      const { data: newSubSubcategory, error } = await supabase
        .from("sub_subcategories")
        .insert([{
          name: newSubSubcategoryName,
          subcategory_id: selectedSubcategoryId,
          slug: slug
        }])
        .select()
        .single();

      if (error) throw error;

      if (newSubSubcategory) {
        setSubSubcategories([...subSubcategories, newSubSubcategory]);
        setNewSubSubcategoryName("");
        setShowNewSubSubcategoryForm(false);
      }
    } catch (error) {
      console.error("Error al crear sub-subcategoría:", error);
      alert("Error al crear la sub-subcategoría");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubSubcategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;

    if (!selectedSubcategoryId) {
      alert("Por favor, selecciona una subcategoría primero");
      return;
    }

    try {
      // Generar slug único
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existing } = await supabase
          .from("sub_subcategories")
          .select("id")
          .eq("slug", slug)
          .single();

        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const { data, error } = await supabase
        .from("sub_subcategories")
        .insert([
          {
            name,
            slug,
            subcategory_id: selectedSubcategoryId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Actualizar la lista de sub-subcategorías
        const updatedSubSubcategories = [...subSubcategories, data];
        setSubSubcategories(updatedSubSubcategories);
        
        // Seleccionar la nueva sub-subcategoría
        setSelectedSubSubcategoryId(data.id);
        
        // Cerrar el modal
        setIsSubSubcategoryModalOpen(false);
        
        // Limpiar el formulario
        form.reset();
      }
    } catch (error) {
      console.error("Error al crear sub-subcategoría:", error);
      alert("Error al crear la sub-subcategoría");
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
                  Descripción
                </label>
                <textarea
                  name="description"
                  defaultValue={product?.description}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
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
                  onChange={(e) => {
                    setSelectedCategoryId(parseInt(e.target.value));
                    setSelectedSubcategoryId(null);
                  }}
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
                <div className="mt-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      name="subcategory_id"
                      value={selectedSubcategoryId || ""}
                      onChange={(e) => setSelectedSubcategoryId(parseInt(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    <button
                      type="button"
                      onClick={() => setShowNewSubcategoryForm(!showNewSubcategoryForm)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                      disabled={!selectedCategoryId}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {showNewSubcategoryForm && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Nombre de la nueva subcategoría"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={createNewSubcategory}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        Crear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sub-subcategoría
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      name="sub_subcategory_id"
                      value={selectedSubSubcategoryId || ""}
                      onChange={(e) => setSelectedSubSubcategoryId(parseInt(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={!selectedSubcategoryId}
                    >
                      <option value="">Selecciona una sub-subcategoría (opcional)</option>
                      {filteredSubSubcategories.map((subSubcategory) => (
                        <option key={subSubcategory.id} value={subSubcategory.id}>
                          {subSubcategory.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewSubSubcategoryForm(!showNewSubSubcategoryForm)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                      disabled={!selectedSubcategoryId}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {showNewSubSubcategoryForm && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSubSubcategoryName}
                        onChange={(e) => setNewSubSubcategoryName(e.target.value)}
                        placeholder="Nombre de la nueva sub-subcategoría"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={createNewSubSubcategory}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        Crear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imágenes
                </label>
                <div className="mt-1 space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      multiple
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Seleccionar Imágenes
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
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