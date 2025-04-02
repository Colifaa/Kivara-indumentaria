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

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  subcategory: string;
  stock: number;
}

interface FilterState {
  category: string | null;
  subcategory: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [filters, setFilters] = useState<Record<string, FilterState>>({
    dama: { category: null, subcategory: null },
    hombre: { category: null, subcategory: null },
    ninos: { category: null, subcategory: null },
    accesorios: { category: null, subcategory: null }
  });
  const [userId, setUserId] = useState<string | undefined>();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [openSubcategories, setOpenSubcategories] = useState<string | null>(null);

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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name),
        subcategory:subcategories(name)
      `);

    if (data) {
      const formattedProducts = data.map(product => ({
        ...product,
        category: product.category.name,
        subcategory: product.subcategory.name
      }));
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const getFilteredProductsForSection = (section: string) => {
    let sectionProducts = filteredProducts.filter(product => {
      switch (section) {
        case "dama":
          return product.category === "Dama";
        case "hombre":
          return product.category === "Hombre";
        case "ninos":
          return product.category === "Niños";
        case "accesorios":
          return product.category === "Accesorios";
        default:
          return true;
      }
    });

    const sectionFilters = filters[section];
    if (sectionFilters.category) {
      sectionProducts = sectionProducts.filter(product => {
        const matchesCategory = product.category === sectionFilters.category;
        if (sectionFilters.subcategory) {
          return matchesCategory && product.subcategory === sectionFilters.subcategory;
        }
        return matchesCategory;
      });
    }

    return sectionProducts;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    const sectionProducts = products.filter(product => {
      switch (section) {
        case "dama":
          return product.category === "Dama";
        case "hombre":
          return product.category === "Hombre";
        case "ninos":
          return product.category === "Niños";
        case "accesorios":
          return product.category === "Accesorios";
        default:
          return true;
      }
    });
    return Array.from(new Set(sectionProducts.map(product => product.category)));
  };

  const getUniqueSubcategories = (section: string, category: string) => {
    const sectionProducts = products.filter(product => {
      switch (section) {
        case "dama":
          return product.category === "Dama";
        case "hombre":
          return product.category === "Hombre";
        case "ninos":
          return product.category === "Niños";
        case "accesorios":
          return product.category === "Accesorios";
        default:
          return true;
      }
    });
    const categoryProducts = sectionProducts.filter(product => product.category === category);
    return Array.from(new Set(categoryProducts.map(product => product.subcategory)));
  };

  const handleCategoryClick = (category: string, section: string) => {
    if (filters[section].category === category) {
      // Si la categoría ya está seleccionada, la deseleccionamos
      setFilters(prev => ({
        ...prev,
        [section]: {
          category: null,
          subcategory: null
        }
      }));
      setOpenSubcategories(null);
    } else {
      // Si es una nueva categoría, la seleccionamos
      setFilters(prev => ({
        ...prev,
        [section]: {
          category: category,
          subcategory: null
        }
      }));
      setOpenSubcategories(`${section}-${category}`);
    }
  };

  const handleSubcategoryClick = (subcategory: string, section: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subcategory: prev[section].subcategory === subcategory ? null : subcategory
      }
    }));
    setOpenSubcategories(null);
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
          {["dama", "hombre", "ninos", "accesorios"].map((section) => (
            <section key={section} id={section} className="mb-16">
              <h2 className="text-2xl font-bold mb-6 capitalize">{section}</h2>
              
              {/* Filtros */}
              <div className="flex flex-wrap gap-4 mb-6">
                {getUniqueCategories(section).map((category) => (
                  <div key={category} className="relative">
                    <button
                      onClick={() => handleCategoryClick(category, section)}
                      className={`px-4 py-2 rounded-full ${
                        filters[section].category === category
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                    {openSubcategories === `${section}-${category}` && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-10">
                        {getUniqueSubcategories(section, category).map((subcategory) => (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategoryClick(subcategory, section)}
                            className={`block w-full text-left px-4 py-2 rounded ${
                              filters[section].subcategory === subcategory
                                ? "bg-blue-50 text-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid de productos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getFilteredProductsForSection(section).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userId={userId}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Cart isOpen={showCart} onClose={() => setShowCart(false)} userId={userId} />
    </div>
  );
}