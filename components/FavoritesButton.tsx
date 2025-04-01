"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface FavoritesButtonProps {
  productId: number;
  userId?: string;
}

export function FavoritesButton({ productId, userId }: FavoritesButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (userId) {
      checkIfFavorite();
    }
  }, [userId, productId]);

  const checkIfFavorite = async () => {
    const { data } = await supabase
      .from("favorites")
      .select()
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: userId, product_id: productId }]);
    }

    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
        isFavorite ? "text-red-500" : "text-gray-500"
      }`}
    >
      <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
} 