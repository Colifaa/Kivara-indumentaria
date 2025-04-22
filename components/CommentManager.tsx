// components/CommentManager.tsx
"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Star, Loader2, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  is_approved: boolean;
  full_name?: string;
  avatar_url?: string | null;
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const commentsPerPage = 9; // 3x3 grid en pantallas grandes
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadComments();
  }, []);

  useEffect(() => {
    // Actualizar comentarios paginados cuando cambien allComments o la página
    paginateComments(currentPage);
  }, [allComments, currentPage]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      // Obtener comentarios
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // Obtener usuarios
      const response = await fetch("/api/get-users");
      const users: SupabaseUser[] = await response.json();

      // Enriquecer comentarios con datos del usuario
      const enrichedComments = commentsData.map((comment) => {
        const user = users.find((user) => user.id === comment.user_id);
        return {
          ...comment,
          full_name: user?.user_metadata?.full_name || user?.email || "Usuario anónimo",
          avatar_url: user?.user_metadata?.avatar_url || null,
        };
      });

      setAllComments(enrichedComments);
      // Calcular total de páginas
      setTotalPages(Math.ceil(enrichedComments.length / commentsPerPage));
      // La paginación se hará en el useEffect
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const paginateComments = (page: number) => {
    const startIndex = (page - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    setComments(allComments.slice(startIndex, endIndex));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ is_approved: true })
        .eq("id", commentId);
      if (error) throw error;
      
      // Actualizar localmente para evitar una recarga completa
      const updatedComments = allComments.map(comment => 
        comment.id === commentId ? {...comment, is_approved: true} : comment
      );
      setAllComments(updatedComments);
    } catch (error) {
      console.error("Error al aprobar comentario:", error);
      alert("Error al aprobar el comentario");
    }
  };

  const handleDisapproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ is_approved: false })
        .eq("id", commentId);
      if (error) throw error;
      
      // Actualizar localmente para evitar una recarga completa
      const updatedComments = allComments.map(comment => 
        comment.id === commentId ? {...comment, is_approved: false} : comment
      );
      setAllComments(updatedComments);
    } catch (error) {
      console.error("Error al desaprobar comentario:", error);
      alert("Error al desaprobar el comentario");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      
      // Eliminar de la lista local y recalcular páginas
      const updatedComments = allComments.filter(comment => comment.id !== commentId);
      setAllComments(updatedComments);
      setTotalPages(Math.ceil(updatedComments.length / commentsPerPage));
      
      // Si eliminamos el último elemento de la página actual y no es la primera página
      if (comments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("Error al eliminar el comentario");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generar array para paginación con límite de botones
  const getPaginationRange = () => {
    const maxVisibleButtons = 5;
    let startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
    let endPage = startPage + maxVisibleButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="p-2 md:p-4 lg:p-6 relative bg-gray-50 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
        Gestión de Comentarios
      </h2>
      
      {isLoadingComments ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : allComments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay comentarios disponibles
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.avatar_url || "https://via.placeholder.com/96"}
                      alt={comment.full_name || "Avatar"}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  <div className="ml-3 md:ml-4 overflow-hidden">
                    <h3 className="text-md md:text-lg font-semibold text-gray-900 truncate">
                      {comment.full_name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, index) => (
                    <Star 
                      key={index} 
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        index < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-4 max-h-32 overflow-y-auto">
                  <p className="text-gray-700 text-sm md:text-base">{comment.content}</p>
                </div>
                
                <div className="flex gap-2 justify-between items-center">
                  <div>
                    {comment.is_approved ? (
                      <button
                        onClick={() => handleDisapproveComment(comment.id)}
                        className="px-3 py-2 rounded-lg bg-white border border-red-500 text-red-500 hover:bg-red-50 flex items-center text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="hidden md:inline">Desaprobar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="px-3 py-2 rounded-lg bg-white border border-green-500 text-green-500 hover:bg-green-50 flex items-center text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="hidden md:inline">Aprobar</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      comment.is_approved 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {comment.is_approved ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Eliminar comentario"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 mb-4">
              <nav className="flex items-center space-x-1" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {getPaginationRange().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-label={`Página ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Mostrando {comments.length} de {allComments.length} comentarios • Página {currentPage} de {totalPages}
          </div>
        </>
      )}
    </div>
  );
}