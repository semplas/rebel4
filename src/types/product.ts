export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  features?: string[];
  color?: string;
  isNew?: boolean;
  stock: number;
  created_at?: string;
  type?: string;
};
