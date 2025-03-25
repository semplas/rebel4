import type { Product } from '@/types/product';

export const getProductById = (id: string, productList: Product[]) => {
  return productList.find(product => product.id === id) || null;
};