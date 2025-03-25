// Type for line items
type LineItem = {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
      description?: string;
    };
    unit_amount: number;
  };
  quantity: number;
};

/**
 * Creates a mock checkout session and returns the URL
 * @param lineItems Array of line items to include in the checkout
 * @returns Object containing the checkout URL or an error
 */
export const createCheckoutSession = async (lineItems: LineItem[]) => {
  console.log('Creating mock checkout session with items:', lineItems);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random order number for demo purposes
  const demoOrderNumber = `demo_session_${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
  
  // For demo purposes, return success with a structured demo session ID
  return {
    url: `/checkout/success?session_id=${demoOrderNumber}`,
    // Alternatively, uncomment to simulate an error:
    // error: 'This is a simulated error message'
  };
};

/**
 * Retrieves a mock checkout session
 * @param sessionId The session ID to retrieve
 * @returns Mock session data
 */
export const getCheckoutSession = async (sessionId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: sessionId,
    amount_total: 9900, // $99.00
    line_items: {
      data: [
        {
          description: "Demo Product",
          quantity: 1,
          amount_total: 9900
        }
      ]
    },
    customer_details: {
      email: "customer@example.com",
      name: "Demo Customer"
    },
    shipping_details: {
      address: {
        line1: "123 Demo Street",
        city: "Demo City",
        postal_code: "12345",
        country: "US"
      }
    }
  };
};
