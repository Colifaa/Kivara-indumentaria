"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { ShoppingCart, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Carousel } from "@/components/Carousel";

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

interface FilterState {
  category: string | null;
  subcategory: string | null;
  subSubcategory: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [filters, setFilters] = useState<Record<string, FilterState>>({
    dama: { category: null, subcategory: null, subSubcategory: null },
    hombre: { category: null, subcategory: null, subSubcategory: null },
    ninos: { category: null, subcategory: null, subSubcategory: null },
    accesorios: { category: null, subcategory: null, subSubcategory: null }
  });
  const [tempFilters, setTempFilters] = useState<Record<string, FilterState>>({
    dama: { category: null, subcategory: null, subSubcategory: null },
    hombre: { category: null, subcategory: null, subSubcategory: null },
    ninos: { category: null, subcategory: null, subSubcategory: null },
    accesorios: { category: null, subcategory: null, subSubcategory: null }
  });
  const [showFilterPanel, setShowFilterPanel] = useState<Record<string, boolean>>({
    dama: false,
    hombre: false,
    ninos: false,
    accesorios: false
  });
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    dama: 1,
    hombre: 1,
    ninos: 1,
    accesorios: 1
  });
  const productsPerPage = 8;
  const [userId, setUserId] = useState<string | undefined>();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const carouselImages = [
    {
      url: "/carousel/imagen1.png",
      alt: "Nuevas colecciones de moda",
      title: "Nueva Colección Primavera 2024",
      subtitle: "Descubre las últimas tendencias en moda con nuestra nueva colección exclusiva",
      buttonText: "Comprar Ahora",
      buttonLink: "#dama"
    },
    {
      url: "/carousel/imagen2.png",
      alt: "Ofertas especiales",
      title: "Ofertas Especiales",
      subtitle: "Hasta 50% de descuento en selección de prendas",
      buttonText: "Ver Ofertas",
      buttonLink: "#ofertas"
    },
    {
      url: "/carousel/imagen3.png",
      alt: "Tendencias de temporada",
      title: "Tendencias de Temporada",
      subtitle: "Encuentra tu estilo único con nuestras últimas novedades",
      buttonText: "Explorar",
      buttonLink: "#tendencias"
    }
  ];

  useEffect(() => {
    loadProducts();
    checkUser();
    loadCartItems();
  }, [userId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filters, activeSection]);

  // Asegurarnos de que los filtros estén inicializados para todas las secciones
  useEffect(() => {
    const sections = ["dama", "hombre", "ninos", "accesorios"];
    setFilters(prev => {
      const newFilters = { ...prev };
      sections.forEach(section => {
        if (!newFilters[section]) {
          newFilters[section] = { category: null, subcategory: null, subSubcategory: null };
        }
      });
      return newFilters;
    });
  }, []);

  // Agregar manejador de eventos para la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Solo cerramos los menús desplegables, no los filtros
        setShowFilterPanel({
          dama: false,
          hombre: false,
          ninos: false,
          accesorios: false
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id);
  };

  const loadProducts = async () => {
    try {
      // Primero cargar todas las categorías
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      if (categoriesError) {
        console.error('Error al cargar categorías:', categoriesError);
        return;
      }

      // Luego cargar todas las subcategorías
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("*, category:categories(*)");

      if (subcategoriesError) {
        console.error('Error al cargar subcategorías:', subcategoriesError);
        return;
      }

      // Luego cargar todas las sub-subcategorías
      const { data: subSubcategories, error: subSubcategoriesError } = await supabase
        .from("sub_subcategories")
        .select("*, subcategory:subcategories(*)");

      if (subSubcategoriesError) {
        console.error('Error al cargar sub-subcategorías:', subSubcategoriesError);
        return;
      }

      // Finalmente cargar los productos con todas sus relaciones
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*),
          sub_subcategory:sub_subcategories(*)
        `)
        .order('id', { ascending: true });

      if (productsError) {
        console.error('Error al cargar productos:', productsError);
        return;
      }

      if (productsData) {
        console.log('Productos cargados:', productsData);
        setProducts(productsData);
        setFilteredProducts(productsData);
      }
    } catch (error) {
      console.error('Error inesperado al cargar productos:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query) ||
        product.subcategory?.name?.toLowerCase().includes(query)
      );
    }

    // Aplicar filtros por sección
    if (activeSection !== "inicio") {
      filtered = getFilteredProductsForSection(activeSection);
    }

    setFilteredProducts(filtered);
  };

  const getFilteredProductsForSection = (section: string) => {
    let sectionProducts = [...products];
    console.log('Productos iniciales:', sectionProducts.length);

    // Mapear secciones a nombres de categorías
    const sectionToCategory: Record<string, string> = {
      "dama": "Damas",
      "hombre": "Hombres",
      "ninos": "Niños",
      "accesorios": "Accesorios"
    };

    // Filtrar por sección (categoría principal)
    sectionProducts = sectionProducts.filter(product => {
      return product.category?.name === sectionToCategory[section];
    });
    console.log(`Productos después de filtrar por sección ${section}:`, sectionProducts.length);

    // Aplicar filtros adicionales si existen
    const sectionFilters = filters[section];
    
    if (sectionFilters) {
      // Filtro por categoría
      if (sectionFilters.category) {
        sectionProducts = sectionProducts.filter(product => 
          product.category?.name === sectionFilters.category
        );
        console.log(`Productos después de filtrar por categoría ${sectionFilters.category}:`, sectionProducts.length);
      }
      
      // Filtro por subcategoría
      if (sectionFilters.subcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.subcategory?.name === sectionFilters.subcategory
        );
        console.log(`Productos después de filtrar por subcategoría ${sectionFilters.subcategory}:`, sectionProducts.length);
      }
      
      // Filtro por sub-subcategoría
      if (sectionFilters.subSubcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.sub_subcategory?.name === sectionFilters.subSubcategory
        );
        console.log(`Productos después de filtrar por sub-subcategoría ${sectionFilters.subSubcategory}:`, sectionProducts.length);
      }
    }

    return sectionProducts;
  };

  // Asegurarnos de que los productos se filtren cuando cambien los filtros
  useEffect(() => {
    console.log('Filtros actualizados:', filters);
    const filtered = getFilteredProductsForSection(activeSection);
    console.log('Productos filtrados después de actualizar filtros:', filtered.length);
    setFilteredProducts(filtered);
  }, [filters, activeSection]);

  const getPaginatedProducts = (section: string) => {
    const sectionProducts = getFilteredProductsForSection(section);
    const indexOfLastProduct = currentPage[section] * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return {
      products: sectionProducts.slice(indexOfFirstProduct, indexOfLastProduct),
      totalPages: Math.ceil(sectionProducts.length / productsPerPage)
    };
  };

  const handlePageChange = (section: string, pageNumber: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [section]: pageNumber
    }));
  };

  // Componente de paginación
  const Pagination = ({ section, totalPages }: { section: string, totalPages: number }) => {
    const currentPageNumber = currentPage[section];
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => handlePageChange(section, currentPageNumber - 1)}
          disabled={currentPageNumber === 1}
          className={`px-3 py-1 rounded ${
            currentPageNumber === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Anterior
        </button>
        
        <span className="text-gray-600">
          Página {currentPageNumber} de {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(section, currentPageNumber + 1)}
          disabled={currentPageNumber === totalPages}
          className={`px-3 py-1 rounded ${
            currentPageNumber === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Siguiente
        </button>
      </div>
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reiniciar todas las páginas cuando se realiza una búsqueda
    setCurrentPage({
      dama: 1,
      hombre: 1,
      ninos: 1,
      accesorios: 1
    });
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

  const getUniqueCategories = (section: string) => {
    // Mapear secciones a nombres de categorías
    const sectionToCategory: Record<string, string> = {
      "dama": "Damas",
      "hombre": "Hombres",
      "ninos": "Niños",
      "accesorios": "Accesorios"
    };

    const categoryName = sectionToCategory[section];
    
    // Filtrar productos por la categoría correspondiente a la sección
    const sectionProducts = products.filter(product => 
      product.category?.name === categoryName
    );

    console.log(`Productos encontrados para sección ${section}:`, sectionProducts.length);

    // Obtener categorías únicas
    const uniqueCategories = Array.from(
      new Set(sectionProducts.map(product => product.category?.name))
    ).filter(Boolean);

    console.log(`Categorías únicas para ${section}:`, uniqueCategories);
    return uniqueCategories;
  };

  const getSubcategoriesForSection = (section: string) => {
    // Mapear secciones a nombres de categorías
    const sectionToCategory: Record<string, string> = {
      "dama": "Damas",
      "hombre": "Hombres",
      "ninos": "Niños",
      "accesorios": "Accesorios"
    };

    const categoryName = sectionToCategory[section];
    
    // Primero encontrar la categoría correcta
    const category = products.find(product => 
      product.category?.name === categoryName
    )?.category;

    if (!category) {
      console.log(`No se encontró la categoría para la sección ${section}`);
      return [];
    }

    // Filtrar productos por la categoría correspondiente a la sección
    const sectionProducts = products.filter(product => 
      product.category?.id === category.id
    );

    // Obtener subcategorías únicas que pertenezcan a esta categoría
    const uniqueSubcategoriesMap = new Map();
    
    sectionProducts.forEach(product => {
      if (product.subcategory && product.subcategory.category_id === category.id) {
        uniqueSubcategoriesMap.set(product.subcategory.id, product.subcategory);
      }
    });

    const subcategories = Array.from(uniqueSubcategoriesMap.values());
    console.log(`Subcategorías para sección ${section}:`, subcategories);
    return subcategories;
  };

  const getUniqueSubcategories = (section: string, category: string) => {
    // Filtrar productos por categoría
    const categoryProducts = products.filter(product => 
      product.category?.name === category
    );

    console.log(`Productos encontrados para categoría ${category}:`, categoryProducts.length);

    // Obtener subcategorías únicas
    const uniqueSubcategoriesMap = new Map();
    
    categoryProducts.forEach(product => {
      if (product.subcategory) {
        uniqueSubcategoriesMap.set(product.subcategory.id, product.subcategory);
      }
    });

    const subcategories = Array.from(uniqueSubcategoriesMap.values());
    console.log(`Subcategorías para ${category}:`, subcategories);
    return subcategories;
  };

  const getUniqueSubSubcategories = (section: string, subcategory: string) => {
    // Filtrar productos por subcategoría
    const filteredProducts = products.filter(product => 
      product.subcategory?.name === subcategory
    );

    console.log(`Productos encontrados para subcategoría ${subcategory}:`, filteredProducts.length);

    // Obtener sub-subcategorías únicas
    const uniqueSubSubcategoriesMap = new Map();
    
    filteredProducts.forEach(product => {
      if (product.sub_subcategory) {
        uniqueSubSubcategoriesMap.set(product.sub_subcategory.id, product.sub_subcategory);
      }
    });

    const subSubcategories = Array.from(uniqueSubSubcategoriesMap.values());
    console.log(`Sub-subcategorías para ${subcategory}:`, subSubcategories);
    return subSubcategories;
  };

  const handleCategoryClick = (category: string, section: string) => {
    // Si ya está seleccionada, solo cerramos el menú
    if (filters[section].category === category) {
      setShowFilterPanel(prev => ({
        ...prev,
        [section]: false
      }));
      return;
    }
    
    // Si es una nueva categoría, actualizamos el filtro y abrimos el menú
    setFilters(prev => ({
      ...prev,
      [section]: {
        category: category,
        subcategory: null,
        subSubcategory: null
      }
    }));
    
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: true
    }));
    
    // Reiniciar la página cuando se cambia el filtro
    setCurrentPage(prev => ({
      ...prev,
      [section]: 1
    }));
  };

  const handleSubcategoryClick = (subcategory: string, section: string) => {
    // Si ya está seleccionada, solo cerramos el menú
    if (filters[section].subcategory === subcategory) {
      setShowFilterPanel(prev => ({
        ...prev,
        [section]: false
      }));
      return;
    }
    
    // Si es una nueva subcategoría, actualizamos el filtro y abrimos el menú
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subcategory: subcategory,
        subSubcategory: null
      }
    }));
    
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: true
    }));
    
    // Reiniciar la página cuando se cambia el filtro
    setCurrentPage(prev => ({
      ...prev,
      [section]: 1
    }));
  };

  const handleSubSubcategoryClick = (subSubcategory: string, section: string) => {
    // Actualizamos el filtro y cerramos el menú
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subSubcategory: prev[section].subSubcategory === subSubcategory ? null : subSubcategory
      }
    }));
    
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: false
    }));
    
    // Reiniciar la página cuando se cambia el filtro
    setCurrentPage(prev => ({
      ...prev,
      [section]: 1
    }));
  };

  const loadCartItems = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", userId);

    if (data) {
      const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    }
  };

  const addToCart = async (product: Product) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      console.log('Agregando producto al carrito:', product);
      
      const { data: existingItem, error: searchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", product.id)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      let error;
      if (existingItem) {
        console.log('Producto existente, actualizando cantidad:', existingItem);
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("user_id", userId)
          .eq("product_id", product.id);
        error = updateError;
      } else {
        console.log('Nuevo producto, insertando en el carrito');
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert([{ 
            user_id: userId, 
            product_id: product.id, 
            quantity: 1 
          }]);
        error = insertError;
      }

      if (error) throw error;
      
      console.log('Producto agregado exitosamente');
      
      // Actualizamos el contador y recargamos los items del carrito
      await loadCartItems();
      
      // Si el carrito está abierto, lo actualizamos
      if (showCart) {
        setShowCart(false);
        setTimeout(() => {
          setShowCart(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar el producto al carrito');
    }
  };

  const handleSectionChange = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  // Función para mostrar/ocultar el panel de filtros
  const toggleFilterPanel = (section: string) => {
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Inicializar los filtros temporales con los filtros actuales
    if (!showFilterPanel[section]) {
      setTempFilters(prev => ({
        ...prev,
        [section]: { ...filters[section] }
      }));
    }
  };

  // Función para aplicar los filtros
  const applyFilters = (section: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: { ...tempFilters[section] }
    }));
    
    // Reiniciar la página cuando se aplican los filtros
    setCurrentPage(prev => ({
      ...prev,
      [section]: 1
    }));
    
    // Cerrar el panel de filtros
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: false
    }));
  };
  
  // Función para resetear los filtros
  const resetFilters = (section: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: { category: null, subcategory: null, subSubcategory: null }
    }));
    
    setTempFilters(prev => ({
      ...prev,
      [section]: { category: null, subcategory: null, subSubcategory: null }
    }));
    
    // Reiniciar la página cuando se resetean los filtros
    setCurrentPage(prev => ({
      ...prev,
      [section]: 1
    }));
    
    // Cerrar el panel de filtros
    setShowFilterPanel(prev => ({
      ...prev,
      [section]: false
    }));
  };
  
  // Función para seleccionar una categoría en los filtros temporales
  const selectCategory = (category: string, section: string) => {
    setTempFilters(prev => ({
      ...prev,
      [section]: {
        category: category,
        subcategory: null,
        subSubcategory: null
      }
    }));
  };
  
  // Función para seleccionar una subcategoría en los filtros temporales
  const selectSubcategory = (subcategory: string, section: string) => {
    setTempFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subcategory: subcategory,
        subSubcategory: null
      }
    }));
  };
  
  // Función para seleccionar una sub-subcategoría en los filtros temporales
  const selectSubSubcategory = (subSubcategory: string, section: string) => {
    setTempFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subSubcategory: subSubcategory
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
        onSearch={handleSearch}
        onCartClick={handleCartClick}
        cartItemCount={cartItemCount}
      />
      
      <div className="pt-16">
        {/* Carrusel */}
        <div className="mb-8">
          <Carousel images={carouselImages} autoPlayInterval={5000} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Secciones de productos */}
          {["dama", "hombre", "ninos", "accesorios"].map((section) => {
            const { products: paginatedProducts, totalPages } = getPaginatedProducts(section);
            
            return (
              <section key={section} id={section} className="mb-16">
                <h2 className="text-2xl font-bold mb-6 capitalize">{section}</h2>
                
                {/* Botón para mostrar/ocultar el panel de filtros */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleFilterPanel(section)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {showFilterPanel[section] ? "Ocultar Filtros" : "Mostrar Filtros"}
                  </button>
                  
                  {/* Mostrar filtros activos */}
                  {(filters[section].subcategory || filters[section].subSubcategory) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filters[section].subcategory && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {filters[section].subcategory}
                        </span>
                      )}
                      {filters[section].subSubcategory && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {filters[section].subSubcategory}
                        </span>
                      )}
                      <button
                        onClick={() => resetFilters(section)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Panel de filtros */}
                {showFilterPanel[section] && (
                  <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3">Filtros</h3>
                    
                    {/* Subcategorías */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Subcategorías</h4>
                      <div className="flex flex-wrap gap-2">
                        {getSubcategoriesForSection(section).map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={() => selectSubcategory(subcategory.name, section)}
                            className={`px-3 py-1 rounded-full ${
                              tempFilters[section].subcategory === subcategory.name
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sub-subcategorías */}
                    {tempFilters[section].subcategory && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Sub-subcategorías</h4>
                        <div className="flex flex-wrap gap-2">
                          {getUniqueSubSubcategories(
                            section,
                            tempFilters[section].subcategory!
                          ).map((subSubcategory) => (
                            <button
                              key={subSubcategory.id}
                              onClick={() => selectSubSubcategory(subSubcategory.name, section)}
                              className={`px-3 py-1 rounded-full ${
                                tempFilters[section].subSubcategory === subSubcategory.name
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              }`}
                            >
                              {subSubcategory.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => applyFilters(section)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Aplicar Filtros
                      </button>
                      <button
                        onClick={() => resetFilters(section)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Resetear Filtros
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      userId={userId}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <Pagination section={section} totalPages={totalPages} />
                )}
              </section>
            );
          })}
        </div>
      </div>

      <Cart isOpen={showCart} onClose={() => setShowCart(false)} userId={userId} />
    </div>
  );
}