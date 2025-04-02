'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';

// Component that uses useSearchParams and other client hooks
function CheckoutPageContent() {
  // Original component code
  // 


  const [step, setStep] = useState(1);
  
  // Mock cart data
  const cartItems = [
    { id: "1", name: "Rebel Classic Oxford", price: 249.99, quantity: 1 },
    { id: "2", name: "Premium Leather Care Kit", price: 49.99, quantity: 1 }
  ];
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const tax = subtotal * 0.20; // UK VAT rate
  const total = subtotal + shipping + tax;
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold uppercase tracking-wider mb-8">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 flex items-center justify-center ${
                  step >= stepNumber ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              <span className="mt-2 text-sm uppercase tracking-wider">
                {stepNumber === 1 ? 'Information' : stepNumber === 2 ? 'Shipping' : 'Payment'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Step 1: Information */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Contact Information</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-1">Phone</label>
                  <input type="tel" className="w-full border border-gray-300 px-3 py-2" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm uppercase tracking-wider mb-1">First Name</label>
                    <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-wider mb-1">Last Name</label>
                    <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-1">Address</label>
                  <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-1">Apartment, suite, etc.</label>
                  <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm uppercase tracking-wider mb-1">City</label>
                    <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-wider mb-1">Postal Code</label>
                    <input type="text" className="w-full border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-wider mb-1">Country</label>
                    <select className="w-full border border-gray-300 px-3 py-2">
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Canada</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  className="bg-black text-white px-8 py-3 uppercase tracking-wider font-bold"
                  onClick={() => setStep(2)}
                >
                  Continue to Shipping
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Shipping */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Shipping Method</h2>
              <div className="space-y-4">
                <div className="border p-4 flex justify-between items-center">
                  <div>
                    <input type="radio" id="standard" name="shipping" className="mr-2" defaultChecked />
                    <label htmlFor="standard" className="uppercase tracking-wider text-sm">Standard Shipping (3-5 business days)</label>
                  </div>
                  <p className="font-medium">£15.00</p>
                </div>
                <div className="border p-4 flex justify-between items-center">
                  <div>
                    <input type="radio" id="express" name="shipping" className="mr-2" />
                    <label htmlFor="express" className="uppercase tracking-wider text-sm">Express Shipping (1-2 business days)</label>
                  </div>
                  <p className="font-medium">£25.00</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button 
                  className="border border-black px-6 py-3 uppercase tracking-wider font-bold"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  className="bg-black text-white px-8 py-3 uppercase tracking-wider font-bold"
                  onClick={() => setStep(3)}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Payment Method</h2>
              <div className="space-y-4">
                <div className="border p-4">
                  <div className="mb-4">
                    <input type="radio" id="credit" name="payment" className="mr-2" defaultChecked />
                    <label htmlFor="credit" className="uppercase tracking-wider text-sm">Credit Card</label>
                  </div>
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm uppercase tracking-wider mb-1">Card Number</label>
                      <input type="text" className="w-full border border-gray-300 px-3 py-2" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm uppercase tracking-wider mb-1">Expiration Date</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-sm uppercase tracking-wider mb-1">CVV</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border p-4">
                  <input type="radio" id="paypal" name="payment" className="mr-2" />
                  <label htmlFor="paypal" className="uppercase tracking-wider text-sm">PayPal</label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button 
                  className="border border-black px-6 py-3 uppercase tracking-wider font-bold"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button 
                  className="bg-black text-white px-8 py-3 uppercase tracking-wider font-bold"
                  onClick={() => alert('Order placed successfully!')}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-100 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Order Summary</h2>
          
          <div className="divide-y">
            {cartItems.map((item) => (
              <div key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-medium">£{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping</p>
              <p className="font-medium">£{shipping.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>VAT (20%)</p>
              <p className="font-medium">£{tax.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <p className="font-bold uppercase tracking-wider">Total</p>
              <p className="font-bold">£{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Main page component with Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
