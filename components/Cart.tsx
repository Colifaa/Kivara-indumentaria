"use client";

import { Card } from "@/components/ui/card";
import { X, Trash2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { CheckoutForm } from "./CheckoutForm";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
  subcategory_id: number; // Cambiado a subcategory_id
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  onUpdateCartCount?: (count: number) => void;
}

export function Cart({ isOpen, onClose, userId, onUpdateCartCount }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [total, setTotal] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen && userId) {
      console.log("Cart abierto, cargando items...");
      console.log("UserId:", userId);
      loadCartItems();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    console.log("Carrito actualizado:", cartItems);
  }, [cartItems]);

  const loadCartItems = async () => {
    console.log("Cargando items del carrito para usuario:", userId);
  
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products (
          id,
          name,
          price,
          image_url,
          category_id,
          subcategory_id
        )
      `)
      .eq("user_id", userId);
  
    console.log("Datos recibidos:", data);
    console.log("Error si existe:", error);
  
    if (error) {
      console.error("Error al cargar el carrito:", error);
      setCartItems([]);
      onUpdateCartCount?.(0);
      return;
    }
  
    if (data && !error) {
      console.log("Datos del carrito:", data);
      const items = data as CartItem[];
      setCartItems(items);
      calculateTotal(items);
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      onUpdateCartCount?.(totalItems);
    }
  };
  
  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      // Redondea el resultado de cada multiplicación y suma
      return parseFloat((sum + item.product.price * item.quantity).toFixed(2));
    }, 0);
  
    setTotal(total);
  };
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
  
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId);
  
    if (!error) {
      const updatedItems = cartItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity }; // ✅ NO toques el precio
        }
        return item;
      });
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      onUpdateCartCount?.(totalItems);
    }
  };
  

  const removeItem = async (itemId: number) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

    if (!error) {
      const updatedItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      onUpdateCartCount?.(totalItems);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blanco p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-negro">Carrito de Compras</h2>
          <button onClick={onClose} className="p-2 hover:bg-gris-suave rounded-full">
            <X className="h-6 w-6 text-negro" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-negro text-center py-4">Tu carrito está vacío</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-negro">{item.product.name}</h3>
                      <p className="text-negro">${item.product.price}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border rounded hover:bg-rosa-claro"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 border rounded text-negro">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border rounded hover:bg-rosa-claro"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-medium text-negro">${item.product.price * item.quantity}</p>
                    <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-rosa-claro rounded-full">
                      <Trash2 className="h-5 w-5 text-rosa-oscuro" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-negro">Total:</span>
                <span className="text-xl font-bold text-negro">${total}</span>
              </div>
              <button
                className="w-full bg-rosa-oscuro text-blanco py-2 rounded-md hover:bg-rosa-oscuro/90"
                onClick={() => setShowCheckout(true)}
              >
                Proceder al Pago
              </button>
            </div>
          </>
        )}
      </div>

      {showCheckout && (
        <CheckoutForm 
          onClose={() => setShowCheckout(false)} 
          total={total} 
          cartItems={cartItems}
        />
      )}
    </div>
  );
}