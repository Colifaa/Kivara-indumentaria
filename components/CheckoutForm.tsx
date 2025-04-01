"use client";

import { useState } from "react";

interface CheckoutFormProps {
  onClose: () => void;
  total: number;
}

export function CheckoutForm({ onClose, total }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    metodoPago: "efectivo",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear el mensaje para WhatsApp
    const mensaje = `
¡Nuevo pedido!

Cliente: ${formData.nombre} ${formData.apellido}
Email: ${formData.email}
Método de pago: ${formData.metodoPago}
Total: $${total}

Productos:
${JSON.stringify(localStorage.getItem("cartItems"), null, 2)}
    `;

    // Encode el mensaje para la URL de WhatsApp
    const mensajeEncoded = encodeURIComponent(mensaje);
    
    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/TUNUMERO?text=${mensajeEncoded}`, "_blank");
    
    // Limpiar el carrito
    localStorage.removeItem("cartItems");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Información de pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({ ...formData, apellido: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Método de pago
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.metodoPago}
              onChange={(e) =>
                setFormData({ ...formData, metodoPago: e.target.value })
              }
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div className="mt-6">
            <div className="text-lg font-semibold mb-4">
              Total a pagar: ${total}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 