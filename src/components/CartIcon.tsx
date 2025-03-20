'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  // Mock cart data
  const cartItems = [
    { id: "1", name: "Custom Leather Oxford", price: 299.99, quantity: 1 },
    { id: "2", name: "Premium Leather Material Pack", price: 149.99, quantity: 1 }
  ];
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="relative">
      <button 
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Your Cart ({totalItems})</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
          
          {cartItems.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex justify-between mb-4">
                  <p>Subtotal</p>
                  <p className="font-medium">${subtotal.toFixed(2)}</p>
                </div>
                <Link 
                  href="/checkout"
                  className="block w-full bg-black text-white text-center py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Checkout
                </Link>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="mb-4">Your cart is empty</p>
              <Link 
                href="/shop"
                className="text-black underline"
                onClick={() => setIsOpen(false)}
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}