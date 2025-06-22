import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for development)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// List of Solana RPC endpoints to try (with fallback)
// Using more reliable endpoints and adding rate limiting considerations
const SOLANA_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://solana.public-rpc.com',
];

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute
  
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Simple rate limiting based on IP or user-agent
    let clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    if (!clientId) {
      clientId = request.headers.get('user-agent') || 'unknown';
    }
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Handle specific actions
    if (body.action === 'getTimeSeries') {
      try {
        // Import the function dynamically to avoid circular dependencies
        const { getSolanaTimeSeries } = await import('../../lib/solana-client');
        const data = await getSolanaTimeSeries('tps', 60);
        
        return NextResponse.json({
          success: true,
          data: data
        });
      } catch (error) {
        console.error('Failed to get time series:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch time series data'
        }, { status: 500 });
      }
    }
    
    // For other requests, proxy to Solana RPC
    const bodyText = JSON.stringify(body);
    
    let lastError: Error | null = null;
    
    // Try each RPC endpoint until one works
    for (const url of SOLANA_RPC_URLS) {
      try {
        console.log(`Trying Solana RPC endpoint: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds
        
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Namada-Analytics-Dashboard/1.0'
          },
          body: bodyText,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.text();
        
        // Check if the response contains an RPC error
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            throw new Error(`RPC Error: ${jsonData.error.message}`);
          }
        } catch {
          // If we can't parse as JSON, it might be a different error
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        }
        
        console.log(`Successfully connected to Solana RPC endpoint: ${url}`);
        
        // If we get here, this endpoint worked
        return new NextResponse(data, { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          } 
        });
        
      } catch (error) {
        console.warn(`Solana RPC call failed for ${url}:`, error);
        lastError = error as Error;
        continue; // Try the next endpoint
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All Solana RPC endpoints failed');
    
    // Provide more specific error message based on the last error
    let errorMessage = 'All Solana RPC endpoints are unavailable';
    if (lastError) {
      if (lastError.name === 'AbortError') {
        errorMessage = 'All Solana RPC endpoints timed out. Please try again later.';
      } else if (lastError.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to Solana RPC endpoints. Please check your internet connection.';
      } else if (lastError.message.includes('429')) {
        errorMessage = 'Rate limit exceeded: Too many requests to Solana RPC endpoints. Please wait a moment and try again.';
      } else if (lastError.message.includes('403')) {
        errorMessage = 'Access denied: Solana RPC endpoints are blocking requests. Please try again later.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: lastError?.message 
      }, 
      { status: 503 }
    );
    
  } catch (error) {
    console.error('Solana proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 