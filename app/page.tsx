"use client";

import { useState, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, Filter } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { Cart } from "@/components/Cart";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, X, Tag, Layers } from "lucide-react";
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
import Banner from "@/components/Banner";

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
  const [filters, setFilters] = useState<Record<string, FilterState>>({});
  const [tempFilters, setTempFilters] = useState<Record<string, FilterState>>({});
  const [showFilterPanel, setShowFilterPanel] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const productsPerPage = 8;
  const [userId, setUserId] = useState<string | undefined>();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProductIndex, setDetailProductIndex] = useState<number | null>(null);
  const [detailProductList, setDetailProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const carouselImages = [
    {
      url: "/Logo Kivara.jpeg",
      alt: "Nuevas colecciones de moda",
      title: "Nueva Colección Primavera 2025",
      subtitle: "Descubre las últimas tendencias en moda con nuestra nueva colección exclusiva",
      buttonText: "Comprar Ahora",
      buttonLink: "#dama"
    },

    {
      url: "/carousel/aa.jpeg",
      alt: "Ofertas especiales",
      title: "Ofertas Especiales",
      subtitle: "Hasta 50% de descuento en selección de prendas",
      buttonText: "Comprar Ahora",
      buttonLink: "#dama"
    },

    {
      url: "/carousel/b.jpeg",
      alt: "Tendencias de temporada",
      title: "Tendencias de Temporada",
      subtitle: "Encuentra tu estilo único con nuestras últimas novedades",
      buttonText: "Comprar Ahora",
      buttonLink: "#hombre"
    },

    {
      url: "/carousel/c.jpeg",
      alt: "Tendencias de temporada",
      title: "Tendencias de Temporada",
      subtitle: "Encuentra tu estilo único con nuestras últimas novedades",
      buttonText: "Comprar Ahora",
      buttonLink: "#hombre"
    },

   
    {
      url: "/carousel/e.jpeg",
      alt: "Tendencias de temporada",
      title: "Tendencias de Temporada",
      subtitle: "Encuentra tu estilo único con nuestras últimas novedades",
      buttonText: "Comprar Ahora",
      buttonLink: "#hombre"
    },
   
  ];

  const defaultCategoryImages: Record<string, string> = {
    damas: "/categories/Hombre.jpeg",
    hombres: "/categories/Dama.jpeg",
    accesorios: "/categories/Accesorios.jpg",
    ninos: "/categories/Niños.jpeg"
  };

  function getCategoryCollectionImage(category: Category) {
    console.log('Categoría actual:', category);
    console.log('Slug de la categoría:', category.slug);
    console.log('Imágenes predefinidas:', defaultCategoryImages);
    
    // Primero verificar si es una de las categorías con imágenes predefinidas
    if (defaultCategoryImages[category.slug]) {
      console.log('Usando imagen predefinida:', defaultCategoryImages[category.slug]);
      return defaultCategoryImages[category.slug];
    }

    // Si no es una categoría predefinida, buscar en los productos
    const prod = products.find(p => {
      if (p.category?.slug) return p.category.slug === category.slug;
      if (p.category_id) return p.category_id === category.id;
      return p.category?.name === category.name;
    });

    if (prod && prod.image_url) {
      console.log('Usando imagen del producto:', prod.image_url);
      if (Array.isArray(prod.image_url)) return prod.image_url[0];
      return prod.image_url;
    }

    console.log('Usando imagen por defecto');
    return "/categories/default.jpg";
  }

  useEffect(() => {
    loadProducts();
    checkUser();
    loadCartItems();
  }, [userId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filters, activeSection]);

  // Inicializar filtros dinámicamente según las categorías
  useEffect(() => {
    if (!categories.length) return;
    setFilters((prev) => {
      const newFilters = { ...prev };
      categories.forEach((cat) => {
        if (!newFilters[cat.slug]) {
          newFilters[cat.slug] = { category: cat.name, subcategory: null, subSubcategory: null };
        }
      });
      // Eliminar filtros de categorías que ya no existen
      Object.keys(newFilters).forEach((key) => {
        if (!categories.find((cat) => cat.slug === key)) {
          delete newFilters[key];
        }
      });
      return newFilters;
    });
    setTempFilters((prev) => {
      const newTemp = { ...prev };
      categories.forEach((cat) => {
        if (!newTemp[cat.slug]) {
          newTemp[cat.slug] = { category: cat.name, subcategory: null, subSubcategory: null };
        }
      });
      Object.keys(newTemp).forEach((key) => {
        if (!categories.find((cat) => cat.slug === key)) {
          delete newTemp[key];
        }
      });
      return newTemp;
    });
    setShowFilterPanel((prev) => {
      const newShow = { ...prev };
      categories.forEach((cat) => {
        if (!(cat.slug in newShow)) {
          newShow[cat.slug] = false;
        }
      });
      Object.keys(newShow).forEach((key) => {
        if (!categories.find((cat) => cat.slug === key)) {
          delete newShow[key];
        }
      });
      return newShow;
    });
    setCurrentPage((prev) => {
      const newPage = { ...prev };
      categories.forEach((cat) => {
        if (!(cat.slug in newPage)) {
          newPage[cat.slug] = 1;
        }
      });
      Object.keys(newPage).forEach((key) => {
        if (!categories.find((cat) => cat.slug === key)) {
          delete newPage[key];
        }
      });
      return newPage;
    });
  }, [categories]);

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
      const { data: categoriesData, error: categoriesError } = await supabase
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
        (product.category?.name || '').toLowerCase().includes(query) ||
        (product.subcategory?.name || '').toLowerCase().includes(query)
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
    // Buscar la categoría correspondiente por slug
    const categoryObj = categories.find(cat => cat.slug === section);
    if (!categoryObj) return [];
    // Filtrar por sección (categoría principal)
    sectionProducts = sectionProducts.filter(product => {
      // Preferimos comparar por slug si existe, si no por id, si no por nombre
      if (product.category?.slug) return product.category.slug === section;
      if (product.category_id) return product.category_id === categoryObj.id;
      return product.category?.name === categoryObj.name;
    });
    // Aplicar filtros adicionales si existen
    const sectionFilters = filters[section];
    if (sectionFilters) {
      // Filtro por categoría (nombre)
      if (sectionFilters.category) {
        sectionProducts = sectionProducts.filter(product => 
          product.category?.name === sectionFilters.category
        );
      }
      // Filtro por subcategoría
      if (sectionFilters.subcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.subcategory?.name === sectionFilters.subcategory
        );
      }
      // Filtro por sub-subcategoría
      if (sectionFilters.subSubcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.sub_subcategory?.name === sectionFilters.subSubcategory
        );
      }
    }
    return sectionProducts;
  };

  // Asegurarnos de que los productos se filtren cuando cambien los filtros
  useEffect(() => {
  
    const filtered = getFilteredProductsForSection(activeSection);
  
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
    const categoryObj = categories.find(cat => cat.slug === section);
    if (!categoryObj) return [];
    const sectionProducts = products.filter(product => {
      if (product.category?.slug) return product.category.slug === section;
      if (product.category_id) return product.category_id === categoryObj.id;
      return product.category?.name === categoryObj.name;
    });
    const uniqueCategories = Array.from(
      new Set(sectionProducts.map(product => product.category?.name))
    ).filter(Boolean) as string[];
    return uniqueCategories;
  };

  const getSubcategoriesForSection = (section: string) => {
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
    
      return [];
    }

    // Obtener subcategorías únicas que pertenezcan a esta categoría
    const uniqueSubcategoriesMap = new Map<number, Subcategory>();
    
    categoryProducts.forEach(product => {
      if (product.subcategory && product.category) {
        uniqueSubcategoriesMap.set(product.subcategory.id, product.subcategory);
      }
    });

    return Array.from(uniqueSubcategoriesMap.values());
  };

  const getUniqueSubcategories = (section: string, category: string) => {
    const categoryObj = categories.find(cat => cat.slug === section);
    if (!categoryObj) return [];
    const sectionProducts = products.filter(product => {
      const isCorrectCategory = product.category?.name === category;
      if (product.category?.slug) return product.category.slug === section && isCorrectCategory;
      if (product.category_id) return product.category_id === categoryObj.id && isCorrectCategory;
      return isCorrectCategory;
    });
    const uniqueSubcategories = Array.from(
      new Set(sectionProducts.map(product => product.subcategory?.name))
    ).filter(Boolean) as string[];
    return uniqueSubcategories;
  };

  const getUniqueSubSubcategories = (section: string, subcategory: string) => {
    const categoryObj = categories.find(cat => cat.slug === section);
    if (!categoryObj) return [];
    const sectionProducts = products.filter(product => {
      const isCorrectSubcategory = product.subcategory?.name === subcategory;
      if (product.category?.slug) return product.category.slug === section && isCorrectSubcategory;
      if (product.category_id) return product.category_id === categoryObj.id && isCorrectSubcategory;
      return isCorrectSubcategory;
    });
    const uniqueSubSubcategories = Array.from(
      new Set(sectionProducts.map(product => product.sub_subcategory?.name))
    ).filter(Boolean) as string[];
    return uniqueSubSubcategories;
  };

  const handleCategoryClick = (category: string, section: string) => {
    // Si ya está seleccionada, solo cerramos el menú
    if (tempFilters[section].category === category) {
      setShowFilterPanel(prev => ({
        ...prev,
        [section]: false
      }));
      return;
    }
    
    // Si es una nueva categoría, actualizamos el filtro temporal y abrimos el menú
    setTempFilters(prev => ({
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
  };

  const handleSubcategoryClick = (subcategory: string, section: string) => {
    // Si ya está seleccionada, solo cerramos el menú
    if (tempFilters[section].subcategory === subcategory) {
      setShowFilterPanel(prev => ({
        ...prev,
        [section]: false
      }));
      return;
    }
    
    // Si es una nueva subcategoría, actualizamos el filtro temporal y abrimos el menú
    setTempFilters(prev => ({
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
  };

  const handleSubSubcategoryClick = (subSubcategory: string, section: string) => {
    // Actualizamos el filtro temporal pero NO cerramos el menú
    setTempFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subSubcategory: prev[section].subSubcategory === subSubcategory ? null : subSubcategory
      }
    }));
    
    // Ya no cerramos el panel aquí para permitir que el usuario haga clic en "Aplicar Filtros"
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
       
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("user_id", userId)
          .eq("product_id", product.id);
        error = updateError;
      } else {
       
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
    // Aplicar los filtros temporales a los filtros permanentes
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
    
    // Filtrar los productos inmediatamente usando los filtros temporales
    let sectionProducts = [...products];
    
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

    // Aplicar filtros adicionales si existen
    const sectionFilters = tempFilters[section];
    
    if (sectionFilters) {
      // Filtro por categoría
      if (sectionFilters.category) {
        sectionProducts = sectionProducts.filter(product => 
          product.category?.name === sectionFilters.category
        );
      }
      
      // Filtro por subcategoría
      if (sectionFilters.subcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.subcategory?.name === sectionFilters.subcategory
        );
      }
      
      // Filtro por sub-subcategoría
      if (sectionFilters.subSubcategory) {
        sectionProducts = sectionProducts.filter(product => 
          product.sub_subcategory?.name === sectionFilters.subSubcategory
        );
      }
    }

    setFilteredProducts(sectionProducts);
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

  // Cargar categorías principales dinámicamente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        if (error) throw error;
        if (data) setCategories(data);
      } catch (err) {
        console.error("Error al cargar categorías principales:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
        onSearch={handleSearch}
        onCartClick={handleCartClick}
        cartItemCount={cartItemCount}
        getUniqueSubcategories={getUniqueSubcategories}
        getUniqueSubSubcategories={getUniqueSubSubcategories}
        onNavbarFilter={(section, subcategory, subSubcategory) => {
          setFilters(prev => ({
            ...prev,
            [section]: {
              category: categories.find(c => c.slug === section)?.name || section,
              subcategory: subcategory || null,
              subSubcategory: subSubcategory || null
            }
          }));
          setCurrentPage(prev => ({ ...prev, [section]: 1 }));
          scrollToSection(section);
        }}
        categories={categories}
      />
      
      {/* Hero Section con Carrusel */}
      <div className="pt-16">
        <div className="relative mb-12 ">
          <Carousel 
            images={carouselImages} 
            autoPlayInterval={5000} 
          />
         
        </div>
  
        {/* Contenedor principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sección de Categorías Destacadas */}
          <div className="mb-24 relative ">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-rosa-claro/20 text-rosa-oscuro rounded-full text-sm font-medium mb-3">
                COLECCIONES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-negro">Categorías Destacadas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer"
                  onClick={() => scrollToSection(category.slug)}
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={getCategoryCollectionImage(category)}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-negro/90 via-negro/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-bold text-blanco mb-1">{category.name}</h3>
                      <p className="text-sm text-blanco/80 mb-4">{category.description || "Colección especial"}</p>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center text-rosa-claro font-medium"
                      >
                        <span>Explorar</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
  
          {/* Secciones de productos */}
          {categories.map((category) => {
            const section = category.slug;
            const { products: paginatedProducts, totalPages } = getPaginatedProducts(section);
            
            return (
              <section key={section} id={section} className="relative mb-24">
               <div className="mb-12">
  <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg">
    {/* Imagen de fondo según la categoría */}
    <div className="absolute inset-0">
      <Image
        src={getCategoryCollectionImage(category)}
        alt={category.name}
        fill
        className="object-cover"
      />
      {/* Overlay con gradiente para mejorar legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-negro/80 via-negro/60 to-transparent"></div>
    </div>
    
    {/* Contenido del encabezado */}
    <div className="relative h-full flex items-center justify-between px-8">
      <div className="max-w-lg">
        <span className="inline-block px-3 py-1 bg-rosa-claro/20 backdrop-blur-sm text-blanco rounded-full text-xs font-bold mb-2 border border-rosa-claro/30">
          COLECCIÓN
        </span>
        <h2 className="text-3xl md:text-4xl font-bold capitalize text-blanco mb-1">
          {category.name}
        </h2>
        <p className="text-blanco/80 text-sm md:text-base">
          {category.description || "Descubre nuestra colección"}
        </p>
      </div>
      
      {/* Botón para mostrar/ocultar el panel de filtros */}
      <button
        onClick={() => toggleFilterPanel(section)}
        className="px-5 py-2.5 bg-rosa-oscuro/80 backdrop-blur-sm border border-rosa-claro/50 text-blanco rounded-full hover:bg-rosa-oscuro hover:border-rosa-claro transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Filter className="h-5 w-5" />
        <span className="font-medium">{showFilterPanel[section] ? "Ocultar Filtros" : "Filtrar"}</span>
      </button>
    </div>
    
    {/* Detalle decorativo */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rosa-oscuro via-rosa-claro to-transparent"></div>
  </div>
  
  {/* Filtros activos (movidos fuera del banner para mejor organización) */}
  {filters[section] && (filters[section].subcategory || filters[section].subSubcategory) && (
    <div className="mt-4 flex flex-wrap gap-2">
      {filters[section].subcategory && (
        <span className="px-4 py-1 bg-rosa-claro/10 text-rosa-oscuro rounded-full text-sm flex items-center">
          {filters[section].subcategory}
          <button 
            onClick={() => {
              const newFilters = {...filters};
              newFilters[section].subcategory = null;
              newFilters[section].subSubcategory = null;
              setFilters(newFilters);
            }}
            className="ml-2 hover:text-rosa-claro"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      )}
      {filters[section].subSubcategory && (
        <span className="px-4 py-1 bg-rosa-claro/10 text-rosa-oscuro rounded-full text-sm flex items-center">
          {filters[section].subSubcategory}
          <button 
            onClick={() => {
              const newFilters = {...filters};
              newFilters[section].subSubcategory = null;
              setFilters(newFilters);
            }}
            className="ml-2 hover:text-rosa-claro"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      )}
      <button
        onClick={() => resetFilters(section)}
        className="px-4 py-1 text-rosa-oscuro rounded-full text-sm hover:underline flex items-center"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Limpiar todo
      </button>
    </div>
  )}
</div>
                
                {/* Panel de filtros */}
                {showFilterPanel[section] && (
                  <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                      className="fixed inset-0 bg-negro/60 backdrop-blur-sm"
                      onClick={() => setShowFilterPanel(prev => ({ ...prev, [section]: false }))}
                    />
                    
                    {/* Panel de filtros */}
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 30 }}
                      className="fixed top-0 right-0 h-full w-full sm:w-96 bg-blanco shadow-xl overflow-hidden"
                    >
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gris-suave">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-negro">Filtros</h3>
                            <button 
                              onClick={() => setShowFilterPanel(prev => ({ ...prev, [section]: false }))}
                              className="text-negro hover:text-rosa-oscuro rounded-full p-2 hover:bg-rosa-claro/10 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contenido con scroll */}
                        <div className="flex-1 overflow-y-auto p-6">
                          <div className="space-y-8">
                            {/* Categorías */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-negro flex items-center">
                                <Tag className="h-5 w-5 mr-2 text-rosa-oscuro" />
                                Categorías
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {getUniqueCategories(section).map((category) => (
                                  <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category, section)}
                                    className={`px-4 py-3 rounded-xl transition-all duration-200 border ${
                                      tempFilters[section].category === category
                                        ? 'bg-rosa-oscuro text-blanco border-rosa-oscuro'
                                        : 'bg-white text-negro border-gris-suave hover:border-rosa-claro'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </div>
  
                            {/* Subcategorías */}
                            {tempFilters[section].category && (
                              <div className="space-y-4">
                                <h4 className="text-lg font-medium text-negro flex items-center">
                                  <Layers className="h-5 w-5 mr-2 text-rosa-oscuro" />
                                  Subcategorías
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {getUniqueSubcategories(section, tempFilters[section].category!).map((subcategory) => (
                                    <button
                                      key={subcategory}
                                      onClick={() => handleSubcategoryClick(subcategory, section)}
                                      className={`px-4 py-3 rounded-xl transition-all duration-200 border ${
                                        tempFilters[section].subcategory === subcategory
                                          ? 'bg-rosa-oscuro text-blanco border-rosa-oscuro'
                                          : 'bg-white text-negro border-gris-suave hover:border-rosa-claro'
                                      }`}
                                    >
                                      {subcategory}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
  
                            {/* Sub-subcategorías */}
                            {tempFilters[section].subcategory && (
                              <div className="space-y-4">
                                <h4 className="text-lg font-medium text-negro flex items-center">
                                  <Filter className="h-5 w-5 mr-2 text-rosa-oscuro" />
                                  Tipos
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {getUniqueSubSubcategories(section, tempFilters[section].subcategory!).map((subSubcategory) => (
                                    <button
                                      key={subSubcategory}
                                      onClick={() => handleSubSubcategoryClick(subSubcategory, section)}
                                      className={`px-4 py-3 rounded-xl transition-all duration-200 border ${
                                        tempFilters[section].subSubcategory === subSubcategory
                                          ? 'bg-rosa-oscuro text-blanco border-rosa-oscuro'
                                          : 'bg-white text-negro border-gris-suave hover:border-rosa-claro'
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
                        <div className="p-6 border-t border-gris-suave space-y-3">
                          <button
                            onClick={() => applyFilters(section)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-rosa-oscuro text-blanco hover:bg-rosa-claro hover:text-rosa-oscuro transition-colors shadow-md"
                          >
                            <Check className="h-4 w-4" />
                            Aplicar Filtros
                          </button>
                          <button
                            onClick={() => resetFilters(section)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium border border-gris-suave text-negro hover:bg-gris-suave/10 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Limpiar Filtros
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
  
                {/* Grid de productos */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {paginatedProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group relative bg-pink-300 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
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
                            className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                            priority={idx < 4}
                          />
                        ) : (
                          <div className="w-full h-full bg-gris-suave flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-rosa-oscuro/50" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-negro/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="absolute top-3 right-3 bg-blanco text-rosa-oscuro p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rosa-claro hover:text-blanco shadow-md"
                          aria-label="Agregar al carrito"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </motion.button>
                      </div>
                      
                      <div className="p-4">
                     
                        <h4 className="text-base font-semibold text-negro mb-2 line-clamp-1 group-hover:text-rosa-oscuro transition-colors duration-300">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-rosa-oscuro">
                            ${typeof product.price === 'number' ? product.price.toLocaleString("es-AR") : '0'}
                          </p>
                          <motion.button
                            whileHover={{ x: 3 }}
                            onClick={() => openProductDetail(product, idx, paginatedProducts)}
                            className="text-negro/60 hover:text-rosa-oscuro transition-colors duration-200 flex items-center"
                          >
                            <span className="text-xs font-medium">Ver</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
  
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination section={section} totalPages={totalPages} />
                  </div>
                )}
              </section>
            );
          })}
          
        </div>
        <Banner/>
        {/* Sección de Testimonios con diseño mejorado */}
        <div className="relative bg-gris-suave/30 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className=" relative inline-block px-4 py-1 bg-rosa-claro/20 text-rosa-oscuro rounded-full text-sm font-medium mb-3">
                TESTIMONIOS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-negro">Lo que opinan nuestros clientes</h2>
            </div>
            <Testimonials />
          </div>
        </div>
  
        {/* Sección de comentarios */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-blanco rounded-2xl shadow-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-negro mb-2">Déjanos tu comentario</h2>
              <p className="text-negro/60">Nos encantaría saber tu opinión sobre nuestros productos</p>
            </div>
            <CommentForm user={userId ?? null} />
          </div>
        </div>
  
        {/* Footer con diseño mejorado */}
        <Footer />
      </div>
  
      {/* Carrito */}
      {showCart && (
        <Cart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          userId={userId}
          onUpdateCartCount={setCartItemCount}
        />
      )}
  
      {/* Modal de detalles de producto */}
      <AnimatePresence>
        {detailModalOpen && detailProductIndex !== null && detailProductList.length > 0 && (
          <motion.div
            key={detailProductList[detailProductIndex].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-negro/50 backdrop-blur-sm"
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
    </div>
  );
}