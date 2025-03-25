import { NextResponse } from 'next/server';

// For static export, we need to use force-static
export const dynamic = "force-static";

// Modified function that doesn't depend on request.url
export async function GET() {
  // Use a mock session ID for static export
  const mockSessionId = "demo_session_12345";
  
  try {
    // Return mock session data
    const mockSession = {
      id: mockSessionId,
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

    return NextResponse.json(mockSession);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}
