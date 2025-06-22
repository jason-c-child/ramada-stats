# Solana TPS Implementation

This document explains how Solana TPS (Transactions Per Second) is calculated in the Namada Analytics Dashboard.

## Implementation Overview

The TPS calculation follows the official Solana documentation approach using the `getRecentPerformanceSamples` JSON-RPC method.

## Key Functions

### `getCurrentSolanaTPS(samples: number = 1)`

Fetches the current TPS using the most recent performance sample.

```typescript
const tps = await getCurrentSolanaTPS();
// Returns: number | null
```

**Calculation:**
```
TPS = numTransactions / samplePeriodSecs
```

### `getSolanaTimeSeries(metric: 'tps', points: number = 60)`

Fetches historical TPS data for charting.

```typescript
const timeSeriesData = await getSolanaTimeSeries('tps', 60);
// Returns: Array of { timestamp, tps, slot, ... }
```

## API Endpoints Used

The implementation uses multiple Solana RPC endpoints with fallback:

1. `https://api.mainnet-beta.solana.com` (Primary)
2. `https://solana-api.projectserum.com` (Fallback 1)
3. `https://rpc.ankr.com/solana` (Fallback 2)

## Error Handling

- **Invalid responses**: Returns `null` for TPS if response is malformed
- **Network errors**: Falls back to alternative RPC endpoints
- **Rate limiting**: Handled gracefully with retry logic
- **Validation**: TPS values are validated to be within reasonable bounds (0-100,000)

## Data Flow

1. **Client Request** → `/api/solana` (Next.js API route)
2. **RPC Proxy** → Tries multiple Solana RPC endpoints
3. **Performance Samples** → Fetches via `getRecentPerformanceSamples`
4. **TPS Calculation** → `numTransactions / samplePeriodSecs`
5. **Validation** → Ensures TPS is within valid range
6. **Response** → Returns calculated TPS to client

## Example Response

```json
{
  "result": [
    {
      "slot": 123456789,
      "numTransactions": 12345,
      "samplePeriodSecs": 60,
      "numSlots": 120
    }
  ]
}
```

**Calculated TPS:** `12345 / 60 = 205.75`

## Integration

The TPS data is integrated into:

- **Dashboard Stats**: Current TPS displayed in real-time
- **Time Series Charts**: Historical TPS trends
- **Network Health**: TPS as a key performance indicator

## Performance Considerations

- **Caching**: Consider implementing caching for TPS data
- **Rate Limiting**: Respect RPC endpoint rate limits
- **Fallback Strategy**: Multiple RPC endpoints ensure reliability
- **Validation**: Input validation prevents invalid calculations

## References

- [Solana JSON-RPC API Documentation](https://docs.solana.com/developing/clients/jsonrpc-api)
- [getRecentPerformanceSamples Method](https://docs.solana.com/developing/clients/jsonrpc-api#getrecentperformancesamples)
- [Solana Explorer TPS Implementation](https://explorer.solana.com) 