"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
  ToastClose,
} from "@/components/ui/toast";
import { CheckCircle, XCircle, Star } from "lucide-react";

interface CommentFormProps {
  user: string | null; // Acepta un string (ID del usuario) o null si no hay usuario autenticado
}

export function CommentForm({ user }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  const [toast, setToast] = useState({
    open: false,
    message: "",
    variant: "default" as "default" | "destructive",
  });

  // Función para mostrar notificaciones (toasts)
  const showToast = (message: string, variant: "default" | "destructive") => {
    setToast({ open: true, message, variant });
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000);
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Debes iniciar sesión para enviar un comentario.", "destructive");
      return;
    }

    if (!comment.trim()) {
      showToast("El comentario no puede estar vacío.", "destructive");
      return;
    }

    if (rating === 0) {
      showToast("Por favor, selecciona una calificación.", "destructive");
      return;
    }

    setIsSubmitting(true);

    // Agregar las comillas alrededor del comentario antes de guardarlo
    const formattedComment = `"${comment.trim()}"`;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          user_id: user,
          content: formattedComment,  // Guardar el comentario con comillas
          rating: rating,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setComment("");
      setRating(0);
      showToast("¡Gracias por tu comentario!", "default");
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      showToast("Ocurrió un error al enviar tu comentario.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejadores para el sistema de estrellas
  const handleStarClick = (index: number) => {
    setRating(index);
  };

  const handleStarHover = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="relative max-w-full mx-auto bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
        Deja tu comentario
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
        {/* Sistema de calificación por estrellas */}
        <div className="flex flex-col items-center mb-2">
          <p className="text-sm text-gray-700 mb-2">¿Cómo calificarías esta página?</p>
          <div
            className="flex items-center space-x-1"
            onMouseLeave={handleMouseLeave}
          >
            {[1, 2, 3, 4, 5].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                className="focus:outline-none"
                aria-label={`Calificar con ${index} estrella${index > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-8 h-8 ${
                    hoverRating !== 0 ? index <= hoverRating : index <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  } transition-colors duration-150`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-1">
            {rating > 0
              ? `Has seleccionado ${rating} ${rating === 1 ? "estrella" : "estrellas"}`
              : "Selecciona una calificación"}
          </p>
        </div>

        {/* Campo de texto para el comentario */}
        <div className="w-full max-w-md flex justify-center">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 text-sm focus:ring-2 focus:ring-rose-600 focus:border-transparent transition"
            rows={4}
            required
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!user || !comment.trim() || rating === 0 || isSubmitting}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Enviando..." : "Enviar comentario"}
        </button>

        {/* Mensaje para usuarios no autenticados */}
        {!user && (
          <p className="text-xs text-gray-600 italic text-center mt-2">
            Debes iniciar sesión para comentar.
          </p>
        )}
      </form>

      {/* Notificaciones (toasts) */}
      <ToastViewport className="fixed bottom-4 right-4 flex flex-col gap-2" />
      <Toast open={toast.open} variant={toast.variant} className="flex items-center">
        {toast.variant === "default" ? (
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500 mr-2" />
        )}
        <div className="flex flex-col">
          <ToastTitle>{toast.variant === "default" ? "Éxito" : "Error"}</ToastTitle>
          <ToastDescription>{toast.message}</ToastDescription>
        </div>
        <ToastClose className="ml-auto" />
      </Toast>
    </div>
  );
}
