export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export interface SubSubcategory {
  id: number;
  name: string;
  subcategory_id: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | string[];
  category: Category | null;
  subcategory: Subcategory | null;
  sub_subcategory: SubSubcategory | null;
  sub_subcategory_id: number | null;
  category_id: number | null;
  subcategory_id: number | null;
  stock: number;
  talla: string;
  created_at?: string;
} 