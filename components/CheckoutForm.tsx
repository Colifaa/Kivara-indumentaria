"use client";

import { motion } from "framer-motion";
import { X, User, Mail, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { useState } from "react";

interface CheckoutFormProps {
  onClose: () => void;
  total: number;
  cartItems?: any[];
}

export function CheckoutForm({ onClose, total, cartItems }: CheckoutFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const orderData = {
      buyerName: formData.get("buyerName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      dni: formData.get("dni"),
      paymentMethod: formData.get("paymentMethod"),
      deliveryAddress: formData.get("deliveryAddress"),
      additionalNotes: formData.get("additionalNotes"),
      total: total
    };

    // Formatear el mensaje para WhatsApp
    const itemsList = cartItems?.map(item => 
      `• ${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}`
    ).join("\\n") || "";

    const message = encodeURIComponent(
      `🛍️ *¡Nuevo Pedido!*\n\n` +
      `*Datos del Cliente:*\n` +
      `👤 Nombre: ${orderData.buyerName}\n` +
      `📧 Email: ${orderData.email}\n` +
      `📱 Teléfono: ${orderData.phone}\n` +
      `🪪 DNI: ${orderData.dni}\n\n` +
      `*Productos:*\n${itemsList}\n\n` +
      `*Total: $${total}*\n\n` +
      `*Método de Pago:*\n` +
      `💳 ${orderData.paymentMethod}\n\n` +
      `*Dirección de Entrega:*\n` +
      `📍 ${orderData.deliveryAddress}\n\n` +
      `*Notas Adicionales:*\n` +
      `📝 ${orderData.additionalNotes || "-"}`
    );

    // Abrir WhatsApp con el mensaje formateado
    const whatsappUrl = `https://wa.me/+5493874862962?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto pt-16 sm:pt-24"
    >
      <div 
        className="fixed inset-0 bg-negro/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="min-h-screen py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl mx-auto px-4"
        >
          <div className="bg-gradient-to-b from-rosa-oscuro to-rosa-claro shadow-2xl rounded-xl p-6 text-blanco relative">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 bg-rosa-oscuro hover:bg-rosa-claro text-blanco p-2 rounded-full shadow-lg transition-all z-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">Finalizar Compra</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <User className="h-4 w-4 mr-2" />
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="buyerName"
                    className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                    required
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                    required
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Phone className="h-4 w-4 mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                    required
                    placeholder="Tu teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <FileText className="h-4 w-4 mr-2" />
                    DNI
                  </label>
                  <input
                    type="text"
                    name="dni"
                    className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                    required
                    placeholder="Tu DNI"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Método de Pago
                </label>
                <select
                  name="paymentMethod"
                  className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                  required
                >
                  <option value="" className="bg-rosa-oscuro">Selecciona un método de pago</option>
                  <option value="Mercado Pago" className="bg-rosa-oscuro">Mercado Pago</option>
                  <option value="Transferencia" className="bg-rosa-oscuro">Transferencia Bancaria</option>
                  <option value="Efectivo" className="bg-rosa-oscuro">Efectivo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2" />
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent"
                  required
                  placeholder="Tu dirección completa"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notas Adicionales
                </label>
                <textarea
                  name="additionalNotes"
                  className="w-full p-3 bg-blanco/20 border border-blanco/30 rounded-lg text-blanco placeholder-blanco/50 focus:ring-2 focus:ring-rosa-claro focus:border-transparent h-24"
                  placeholder="Instrucciones especiales para la entrega..."
                />
              </div>

              <div className="mt-6 border-t border-blanco/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total a Pagar:</span>
                  <span className="text-2xl font-bold">${total}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blanco hover:bg-rosa-claro text-rosa-oscuro font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  Confirmar Pedido
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-blanco/20 hover:bg-blanco/30 text-blanco font-semibold px-6 py-3 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 