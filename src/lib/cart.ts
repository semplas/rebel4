import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types/product';

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
};

export async function getCartItems(): Promise<CartItem[]> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (*)
      `)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products as Product
    }));
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    return [];
  }
}

export async function addToCart(productId: string, quantity: number = 1): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { 
          user_id: session.user.id, 
          product_id: productId,
          quantity 
        },
        { 
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false 
        }
      );
    
    if (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return false;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return false;
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return false;
  }
}

export async function clearCart(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return false;
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const items = await getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Failed to get cart item count:', error);
    return 0;
  }
}