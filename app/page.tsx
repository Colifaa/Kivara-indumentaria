"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, X, Tag, Layers, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Carousel } from "@/components/Carousel";
import { Product, Category, Subcategory, SubSubcategory } from '@/types/product';
import { motion, AnimatePresence } from "framer-motion";
import { ProductDetail } from "@/components/ProductDetail";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { CommentForm } from "@/components/CommentForm";

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProductIndex, setDetailProductIndex] = useState<number | null>(null);
  const [detailProductList, setDetailProductList] = useState<Product[]>([]);

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

      // Finalmente cargar los productos con todas sus relaciones, ordenados alfabéticamente
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*),
          sub_subcategory:sub_subcategories(*)
        `)
        .order('name', { ascending: true });

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

  // Componente de paginación moderno
  const Pagination = ({ section, totalPages }: { section: string, totalPages: number }) => {
    const currentPageNumber = currentPage[section];
    // Mostrar máximo 5 páginas a la vez
    const getPageNumbers = () => {
      const pages = [];
      let start = Math.max(1, currentPageNumber - 2);
      let end = Math.min(totalPages, currentPageNumber + 2);
      if (currentPageNumber <= 3) {
        end = Math.min(5, totalPages);
      }
      if (currentPageNumber > totalPages - 3) {
        start = Math.max(1, totalPages - 4);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };
    const pageNumbers = getPageNumbers();
    return (
      <motion.nav
        className="flex justify-center items-center gap-2 mt-8 select-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Paginación"
      >
        {/* Botón Anterior */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handlePageChange(section, currentPageNumber - 1)}
          disabled={currentPageNumber === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors duration-200
            ${currentPageNumber === 1
              ? "bg-gris-suave text-gris-400 border-gris-suave cursor-not-allowed"
              : "bg-blanco text-negro border-rosa-oscuro hover:bg-rosa-claro hover:text-rosa-oscuro"}
          `}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        {/* Números de página */}
        <AnimatePresence initial={false}>
          {pageNumbers.map((page) => (
            <motion.button
              key={page}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => handlePageChange(section, page)}
              className={`w-9 h-9 mx-1 flex items-center justify-center rounded-full border font-semibold text-sm transition-colors duration-200
                ${page === currentPageNumber
                  ? "bg-rosa-oscuro text-blanco border-rosa-oscuro shadow"
                  : "bg-blanco text-negro border-rosa-oscuro hover:bg-rosa-claro hover:text-rosa-oscuro"}
              `}
              aria-current={page === currentPageNumber ? "page" : undefined}
            >
              {page}
            </motion.button>
          ))}
        </AnimatePresence>
        {/* Botón Siguiente */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handlePageChange(section, currentPageNumber + 1)}
          disabled={currentPageNumber === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors duration-200
            ${currentPageNumber === totalPages
              ? "bg-gris-suave text-gris-400 border-gris-suave cursor-not-allowed"
              : "bg-blanco text-negro border-rosa-oscuro hover:bg-rosa-claro hover:text-rosa-oscuro"}
          `}
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.nav>
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
    const sectionToCategory: Record<string, string> = {
      "dama": "Damas",
      "hombre": "Hombres",
      "ninos": "Niños",
      "accesorios": "Accesorios"
    };

    // Filtrar productos por la sección actual
    const sectionProducts = products.filter(product => 
      product.category?.name === sectionToCategory[section]
    );

    // Obtener categorías únicas para esta sección
    const uniqueCategories = Array.from(
      new Set(sectionProducts.map(product => product.category?.name))
    ).filter(Boolean) as string[];

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
    
    // Encontrar la categoría correcta
    const categoryProducts = products.filter(product => 
      product.category?.name === categoryName
    );
    
    if (categoryProducts.length === 0) {
      console.log(`No se encontraron productos para la categoría ${categoryName}`);
      return [];
    }

    // Obtener subcategorías únicas que pertenezcan a esta categoría
    const uniqueSubcategoriesMap = new Map();
    
    categoryProducts.forEach(product => {
      if (product.subcategory && product.subcategory.category_id === product.category?.id) {
        uniqueSubcategoriesMap.set(product.subcategory.id, product.subcategory);
      }
    });

    const subcategories = Array.from(uniqueSubcategoriesMap.values());
    console.log(`Subcategorías para sección ${section}:`, subcategories);
    return subcategories;
  };

  const getUniqueSubcategories = (section: string, category: string) => {
    // Obtener solo los productos que pertenecen a esta sección y categoría
    const sectionProducts = products.filter(product => {
      const isCorrectCategory = product.category?.name === category;
      const belongsToSection = product.category?.name === (
        section === "dama" ? "Damas" :
        section === "hombre" ? "Hombres" :
        section === "ninos" ? "Niños" :
        section === "accesorios" ? "Accesorios" : ""
      );
      return isCorrectCategory && belongsToSection;
    });

    // Obtener subcategorías únicas
    const uniqueSubcategories = Array.from(
      new Set(sectionProducts.map(product => product.subcategory?.name))
    ).filter(Boolean) as string[];

    return uniqueSubcategories;
  };

  const getUniqueSubSubcategories = (section: string, subcategory: string) => {
    // Obtener solo los productos que pertenecen a esta subcategoría y sección
    const sectionProducts = products.filter(product => {
      const isCorrectSubcategory = product.subcategory?.name === subcategory;
      const belongsToSection = product.category?.name === (
        section === "dama" ? "Damas" :
        section === "hombre" ? "Hombres" :
        section === "ninos" ? "Niños" :
        section === "accesorios" ? "Accesorios" : ""
      );
      return isCorrectSubcategory && belongsToSection;
    });

    // Obtener sub-subcategorías únicas
    const uniqueSubSubcategories = Array.from(
      new Set(sectionProducts.map(product => product.sub_subcategory?.name))
    ).filter(Boolean) as string[];

    return uniqueSubSubcategories;
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

  // Función para abrir el modal de detalle
  const openProductDetail = (product: Product, idx: number, list: Product[]) => {
    setDetailProductList(list);
    setDetailProductIndex(idx);
    setDetailModalOpen(true);
  };

  // Funciones para navegar entre productos
  const handleNextProduct = () => {
    if (detailProductIndex !== null && detailProductIndex < detailProductList.length - 1) {
      setDetailProductIndex(detailProductIndex + 1);
    }
  };
  const handlePrevProduct = () => {
    if (detailProductIndex !== null && detailProductIndex > 0) {
      setDetailProductIndex(detailProductIndex - 1);
    }
  };
  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setDetailProductIndex(null);
    setDetailProductList([]);
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
          {/* Sección de Categorías Destacadas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-negro text-center mb-8">Categorías Destacadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: "dama",
                  title: "Dama",
                  image: "/categories/Hombre.jpeg",
                  description: "Encuentra las últimas tendencias en moda femenina"
                },
                {
                  id: "hombre",
                  title: "Hombre",
                  image: "/categories/Dama.jpeg",
                  description: "Estilo y comodidad para el hombre moderno"
                },
                {
                  id: "ninos",
                  title: "Niños",
                  image: "/categories/Niños.jpeg",
                  description: "Ropa divertida y cómoda para los más pequeños"
                },
                {
                  id: "accesorios",
                  title: "Accesorios",
                  image: "/categories/Accesorios.jpg",
                  description: "Complementa tu look con nuestros accesorios"
                }
              ].map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg"
                  onClick={() => scrollToSection(category.id)}
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-negro/40 to-transparent opacity-80 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-bold text-blanco mb-2">{category.title}</h3>
                      <p className="text-sm text-blanco/90 mb-4">{category.description}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-rosa-oscuro text-blanco px-6 py-2 rounded-full text-sm font-medium hover:bg-rosa-claro transition-colors duration-300"
                      >
                        Explorar
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Secciones de productos */}
          {["dama", "hombre", "ninos", "accesorios"].map((section) => {
            const { products: paginatedProducts, totalPages } = getPaginatedProducts(section);
            
            return (
              <section  key={section} id={section} className="relative mb-16">
                <h2 className="relative text-2xl font-bold mb-6 capitalize">{section}</h2>
                
                {/* Botón para mostrar/ocultar el panel de filtros */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleFilterPanel(section)}
                    className=" px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors relative"
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
                  <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                      className="fixed inset-0 bg-black/50"
                      onClick={() => setShowFilterPanel(prev => ({ ...prev, [section]: false }))}
                    />
                    
                    {/* Panel de filtros */}
                    <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-blanco shadow-lg transform transition-transform duration-300 ease-in-out">
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gris-suave">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-negro">Filtros</h3>
                            <button 
                              onClick={() => setShowFilterPanel(prev => ({ ...prev, [section]: false }))}
                              className="text-negro hover:text-rosa-oscuro p-2"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contenido con scroll */}
                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="space-y-6">
                            {/* Categorías */}
                            <div className="space-y-2">
                              <h4 className="text-lg font-medium text-negro flex items-center">
                                <Tag className="h-5 w-5 mr-2" />
                                Categorías
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {getUniqueCategories(section).map((category) => (
                                  <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category, section)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                      filters[section].category === category
                                        ? 'bg-rosa-oscuro text-blanco'
                                        : 'bg-gris-suave text-negro hover:bg-rosa-claro'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Subcategorías */}
                            {filters[section].category && (
                              <div className="space-y-2">
                                <h4 className="text-lg font-medium text-negro flex items-center">
                                  <Layers className="h-5 w-5 mr-2" />
                                  Subcategorías
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {getUniqueSubcategories(section, filters[section].category!).map((subcategory) => (
                                    <button
                                      key={subcategory}
                                      onClick={() => handleSubcategoryClick(subcategory, section)}
                                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        filters[section].subcategory === subcategory
                                          ? 'bg-rosa-oscuro text-blanco'
                                          : 'bg-gris-suave text-negro hover:bg-rosa-claro'
                                      }`}
                                    >
                                      {subcategory}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sub-subcategorías */}
                            {filters[section].subcategory && (
                              <div className="space-y-2">
                                <h4 className="text-lg font-medium text-negro flex items-center">
                                  <Filter className="h-5 w-5 mr-2" />
                                  Tipos
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {getUniqueSubSubcategories(section, filters[section].subcategory!).map((subSubcategory) => (
                                    <button
                                      key={subSubcategory}
                                      onClick={() => handleSubSubcategoryClick(subSubcategory, section)}
                                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        filters[section].subSubcategory === subSubcategory
                                          ? 'bg-rosa-oscuro text-blanco'
                                          : 'bg-gris-suave text-negro hover:bg-rosa-claro'
                                      }`}
                                    >
                                      {subSubcategory}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gris-suave">
                          <button
                            onClick={() => resetFilters(section)}
                            className="w-full border border-rosa-oscuro text-rosa-oscuro py-3 rounded-lg font-medium hover:bg-rosa-claro transition-colors duration-200"
                          >
                            Limpiar Filtros
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {paginatedProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="group relative bg-blanco rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <div 
                        className="relative aspect-square overflow-hidden cursor-pointer"
                        onClick={() => openProductDetail(product, idx, paginatedProducts)}
                      >
                        {product.image_url ? (
                          <Image
                            src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            priority={idx < 4}
                          />
                        ) : (
                          <div className="w-full h-full bg-gris-suave flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-rosa-oscuro" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-negro/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 sm:pb-6">
                          <span className="text-blanco text-sm sm:text-base font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-rosa-oscuro/90 rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            Ver detalles
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-rosa-oscuro text-blanco p-2 sm:p-2.5 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rosa-claro shadow-lg"
                          aria-label="Agregar al carrito"
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.button>
                      </div>
                      
                      <div className="p-3 sm:p-4 lg:p-5">
                        <h3 className="text-base sm:text-lg font-semibold text-negro mb-1 sm:mb-2 line-clamp-2 group-hover:text-rosa-oscuro transition-colors duration-300">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xl sm:text-2xl font-bold text-rosa-oscuro">
                            ${typeof product.price === 'number' ? product.price.toLocaleString("es-AR") : '0'}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openProductDetail(product, idx, paginatedProducts)}
                            className="text-rosa-oscuro hover:text-rosa-claro transition-colors duration-200 font-medium text-sm sm:text-base"
                          >
                            Ver detalles
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
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

      {showCart && (
        <Cart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          userId={userId}
          onUpdateCartCount={setCartItemCount}
        />
      )}

      <AnimatePresence>
        {detailModalOpen && detailProductIndex !== null && detailProductList.length > 0 && (
          <motion.div
            key={detailProductList[detailProductIndex].id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <ProductDetail
              product={detailProductList[detailProductIndex]}
              isOpen={detailModalOpen}
              onClose={handleCloseDetail}
              onAddToCart={addToCart}
              userId={userId}
              onNext={handleNextProduct}
              onPrev={handlePrevProduct}
              hasNext={detailProductIndex < detailProductList.length - 1}
              hasPrev={detailProductIndex > 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección de Testimonios */}
      <Testimonials />

      <CommentForm user={userId ?? null} />

      {/* Footer */}
      <Footer />
    </div>
  );
}