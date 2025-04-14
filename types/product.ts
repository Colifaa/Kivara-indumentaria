export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

export interface SubSubcategory {
  id: number;
  name: string;
  slug: string;
  subcategory_id: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | string[];
  category_id: number;
  subcategory_id: number;
  sub_subcategory_id: number;
  stock: number;
  talla: string;
  category: Category;
  subcategory: Subcategory;
  sub_subcategory: SubSubcategory;
} 