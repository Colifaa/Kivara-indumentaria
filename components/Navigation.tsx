"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface NavigationProps {
  onSectionChange: (section: string) => void;
  activeSection: string;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  cartItemCount: number;
}

export function Navigation({
  onSectionChange,
  activeSection,
  onSearch,
  onCartClick,
  cartItemCount
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      setUserEmail(user.email || null);
      const avatarUrl = user.user_metadata?.avatar_url;
      setUserAvatar(typeof avatarUrl === 'string' ? avatarUrl : null);
      
      const { data, error } = await supabase.rpc('is_admin', { 
        email_param: user.email 
      });
      
      if (error) {
        console.error("Error al verificar admin:", error);
      } else {
        setIsAdmin(!!data);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setUserAvatar(null);
    setIsAdmin(false);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Dama", value: "dama" },
    { name: "Hombre", value: "hombre" },
    { name: "Niños", value: "ninos" },
    { name: "Accesorios", value: "accesorios" }
  ];

  return (
    <nav 
    className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
      scrolled ? "bg-[#e8b2bb]/95 backdrop-blur-md shadow-sm" : "bg-[#e8b2bb]"
    }`}
  >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Contenedor principal con altura fija */}
        <div className="flex justify-between items-center h-16 sm:h-20 w-full">
          {/* Logo con tamaño fijo para evitar que se contraiga */}
          <div className="flex-shrink-0 w-32 sm:w-48">
            <Link href="/" className="flex items-center">
              <div className="relative mb-4 h-12 sm:h-16 w-full flex items-center justify-center">
                <Image
                  src="/Logo.png"
                  alt="Logo Kivara"
                  width={560}
                  height={160}
                  priority
                  className="transition-transform duration-300 hover:scale-105"
                  style={{
                    objectFit: "contain",
                    objectPosition: "center"
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Enlaces de navegación - Desktop */}
          <div className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onSectionChange(item.value)}
                className={`text-sm font-medium relative px-1 py-1 transition-colors duration-300 ease-in-out
                  ${activeSection === item.value
                    ? "text-[#9E4244]"
                    : "text-[#4A3034] hover:text-[#9E4244]"}
                `}
              >
                {item.name}
                {activeSection === item.value && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9E4244]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Botones de acción (Carrito y Login) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!userId ? (
              <Button
                variant="outline"
                className="hidden sm:inline-flex border-[#9E4244] text-[#9E4244] hover:bg-[#9E4244] hover:text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full transition-colors duration-300 shadow-sm"
                onClick={() => router.push('/login')}
              >
                Iniciar Sesión
              </Button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 focus:outline-none group"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {userAvatar ? (
                    <div className="relative w-7 h-7 sm:w-9 sm:h-9 overflow-hidden rounded-full border-2 border-transparent transition-colors group-hover:border-[#E294A2]">
                      <Image
                        src={userAvatar}
                        alt="User avatar"
                        fill
                        sizes="(max-width: 640px) 28px, 36px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#E294A2]/30 flex items-center justify-center transition-colors group-hover:bg-[#E294A2]/50">
                      <span className="text-[#9E4244] text-xs sm:text-sm font-medium">
                        {userEmail?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-[#4A3034] transition-transform group-hover:text-[#9E4244]" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg py-1 z-50 overflow-hidden border border-[#FBD1D8]"
                  >
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push('/admin');
                        }}
                        className="w-full text-left px-4 py-3 text-xs sm:text-sm text-[#4A3034] hover:bg-[#FBD1D8]/20 flex items-center transition-colors"
                      >
                        <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-[#9E4244]" />
                        Panel de Admin
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-xs sm:text-sm text-[#4A3034] hover:bg-[#FBD1D8]/20 flex items-center transition-colors"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-[#9E4244]" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onCartClick}
              className="relative p-1 sm:p-2 rounded-full transition-colors hover:bg-[#E294A2]/20 focus:outline-none"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[#4A3034]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9E4244] text-white text-xs font-medium rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-[#E294A2]/20 focus:outline-none"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 flex flex-col items-center justify-center gap-1.5">
                <div className={`h-0.5 w-6 bg-[#4A3034] rounded-full transition-all duration-300 ${isMenuOpen ? "transform rotate-45 translate-y-2" : ""}`} />
                <div className={`h-0.5 w-6 bg-[#4A3034] rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                <div className={`h-0.5 w-6 bg-[#4A3034] rounded-full transition-all duration-300 ${isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Menú móvil en un contenedor separado para no afectar al logo */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 py-3 space-y-2 flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onSectionChange(item.value);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 ${
                  activeSection === item.value
                    ? "bg-[#E294A2]/30 text-[#9E4244]"
                    : "text-[#4A3034] hover:bg-[#E294A2]/20"
                }`}
              >
                {item.name}
              </button>
            ))}
            {!userId && (
              <button
                onClick={() => {
                  router.push('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 text-[#9E4244] hover:bg-[#E294A2]/20"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}