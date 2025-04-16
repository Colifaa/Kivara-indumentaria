"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [activeSection, setActiveSection] = useState("dama");
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdminStatus();
    loadCartItems();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!adminData) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error al verificar estado de admin:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartItemCount(totalItems);
    } catch (error) {
      console.error('Error al cargar items del carrito:', error);
    }
  };

  const handleSearch = (query: string) => {
    // Implementar búsqueda si es necesario
    console.log('Búsqueda:', query);
  };

  const handleCartClick = () => {
    // Implementar apertura del carrito
    console.log('Abrir carrito');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className=" min-h-screen bg-gray-50">
      <Navigation
        onSectionChange={setActiveSection}
        activeSection={activeSection}
        onSearch={handleSearch}
        onCartClick={handleCartClick}
        cartItemCount={cartItemCount}
      />
      <div className=" relative pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6">
          <div className="px-4 py-6 sm:px-0">
            <AdminDashboard />
          </div>
        </div>
      </div>
    </div>
  );
} 