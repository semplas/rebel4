import { supabase } from '@/lib/supabase';
import { CartItem, clearCart } from '@/lib/cart';

export type Order = {
  id: string;
  user_id: string;
  customer_email: string; // Missing in your current type
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
};

// Create a new order from cart items
export async function createOrder(
  userId: string, 
  cartItems: CartItem[], 
  shippingAddress: string,
  customerEmail: string
): Promise<Order | null> {
  try {
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          user_id: userId, 
          status: 'pending', 
          total, 
          shipping_address: shippingAddress,
          customer_email: customerEmail
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    // Insert order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }
    
    // Clear the cart
    await clearCart(userId);
    
    return order;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
}

// Get all orders for a user
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return [];
  }
}

// Get a single order with its items
export async function getOrderWithItems(orderId: string): Promise<{ order: Order, items: OrderItem[] } | null> {
  try {
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error(`Error fetching order with ID ${orderId}:`, orderError);
      throw orderError;
    }
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error(`Error fetching items for order with ID ${orderId}:`, itemsError);
      throw itemsError;
    }
    
    return { order, items: items || [] };
  } catch (error) {
    console.error(`Failed to fetch order with ID ${orderId}:`, error);
    return null;
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating status for order with ID ${orderId}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to update status for order with ID ${orderId}:`, error);
    return null;
  }
}