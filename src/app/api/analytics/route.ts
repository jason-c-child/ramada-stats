import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // All endpoints require real data sources that are not currently configured
  return NextResponse.json(
    {
      success: false,
      error: 'Real data endpoints not configured',
      message: 'This dashboard only shows real data from configured APIs. Mock data has been removed.',
      availableEndpoints: [
        'network-stats',
        'validator-stats', 
        'time-series',
        'privacy-metrics',
        'governance',
        'cross-chain',
        'all',
        'transfer-flows',
        'network-nodes',
        'flow-metrics',
        'flow-details'
      ],
    },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'test-webhook':
        // Test webhook endpoint
        try {
          const { webhookUrl, alertData } = data;
          
          if (!webhookUrl) {
            return NextResponse.json(
              {
                success: false,
                error: 'Webhook URL is required',
              },
              { status: 400 }
            );
          }

          const testPayload = {
            alert: {
              id: 'test-alert',
              name: alertData?.name || 'Test Alert',
              description: alertData?.description || 'Test alert for webhook verification',
              type: alertData?.type || 'block-height',
              condition: alertData?.condition || 'above',
              threshold: alertData?.threshold || 0
            },
            trigger: {
              id: `test-${Date.now()}`,
              message: 'Test webhook notification from Namada Analytics Dashboard',
              value: alertData?.threshold || 0,
              timestamp: Date.now()
            },
            network: {
              timestamp: new Date().toISOString(),
              source: 'Namada Analytics Dashboard'
            }
          };

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Namada-Analytics-Dashboard/1.0'
            },
            body: JSON.stringify(testPayload)
          });

          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: 'Webhook test successful',
              statusCode: response.status,
              statusText: response.statusText
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Webhook test failed',
              statusCode: response.status,
              statusText: response.statusText
            }, { status: 400 });
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Webhook test failed: ' + (error as Error).message
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            availableActions: ['test-webhook'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
} 