"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function Testimonials() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // En la función fetchComments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq('is_approved', true)  // Solo traer comentarios aprobados
          .not("rating", "is", null)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;

        const response = await fetch("/api/get-users");
        const users: SupabaseUser[] = await response.json();

        const enrichedComments = commentsData.map((comment) => {
          const user = users.find((u) => u.id === comment.user_id);

          return {
            ...comment,
            full_name: user?.user_metadata?.full_name || user?.email || "Usuario",
            avatar_url: user?.user_metadata?.avatar_url || null,
          };
        });

        setComments(enrichedComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("No se pudieron cargar los comentarios");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserInitial = (userId: string) => {
    return userId.charAt(0).toUpperCase();
  };

  const getColorForUser = (userId: string) => {
    const colors = [
      "bg-pink-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    const sum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  return (
    <section className="relative py-16 bg-gris-suave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-negro mb-4">Tu outfit, nuestra inspiración</h2>
          <p className="text-negro/60 max-w-2xl mx-auto">
            Nos enorgullece brindar la mejor experiencia de compra a nuestros clientes. Aquí algunos
            comentarios de personas que confían en nosotros.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-rosa-oscuro animate-spin" />
            <span className="ml-2 text-negro">Cargando comentarios...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-negro/60 py-8">
            Aún no hay comentarios. ¡Sé el primero en compartir tu experiencia!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={comment.avatar_url || "https://via.placeholder.com/96"}
                    alt={comment.full_name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{comment.full_name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{comment.content}</p>
                <div className="flex items-center">
                  {[...Array(comment.rating)].map((_, index) => (
                    <Star key={index} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
