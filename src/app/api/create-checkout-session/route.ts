import { NextResponse } from 'next/server';

// Add this line to make the route compatible with static export
export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const { lineItems } = await request.json();

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Invalid line items provided' },
        { status: 400 }
      );
    }

    // Generate a random order number for demo purposes
    const demoOrderNumber = `demo_session_${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
    
    // Return mock checkout URL
    return NextResponse.json({
      url: `/checkout/success?session_id=${demoOrderNumber}`
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
