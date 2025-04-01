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
  image: string;
  category: string;
  subcategory: string;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
}

interface SupabaseCartItem {
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    subcategory: string;
  };
}

export function Cart({ isOpen, onClose, userId }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [total, setTotal] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen && userId) {
      console.log('Cart abierto, cargando items...');
      loadCartItems();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    console.log('Carrito actualizado:', cartItems);
  }, [cartItems]);

  const loadCartItems = async () => {
    console.log('Cargando items del carrito para usuario:', userId);
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id,
          name,
          price,
          image_url,
          category,
          subcategory
        )
      `)
      .eq('user_id', userId);

    console.log('Datos recibidos:', data);
    console.log('Error si existe:', error);

    if (error) {
      console.error('Error al cargar el carrito:', error);
      return;
    }

    if (data) {
      setCartItems(data);
      calculateTotal(data);
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    setTotal(total);
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (!error) {
      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const removeItem = async (itemId: number) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Carrito de Compras</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Tu carrito está vacío</p>
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
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-600">${item.product.price}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 border rounded">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-medium">
                      ${item.product.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold">${total}</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                onClick={() => {
                  // Aquí puedes agregar la lógica para proceder al pago
                  alert('Proceder al pago...');
                }}
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
        />
      )}
    </div>
  );
} 