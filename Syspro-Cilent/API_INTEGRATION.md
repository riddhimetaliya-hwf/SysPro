# API Integration Documentation

## Overview

The Visual Production Scheduler has been updated to use a real API instead of mock data. The application now fetches scheduling data from your backend API endpoints.

## API Endpoints

### Development
- **Base URL**: `http://localhost:5223/api/scheduling/job`
- **Method**: GET
- **Content-Type**: application/json

### Production
- **Base URL**: `http://SysproAPI.com/api/scheduling/job`
- **Method**: GET
- **Content-Type**: application/json

## API Response Format

The API returns an array of machine objects, each containing capacity information and associated jobs:

```json
[
  {
    "machine": "ABC_AS",
    "description": "Assembly for AB Costing",
    "capacity": {
      "18-07-2025": 9.000000,
      "19-07-2025": 9.000000,
      // ... more dates
    },
    "jobs": []
  },
  {
    "machine": "ASSE01",
    "description": "Assembly Bay",
    "capacity": {
      "18-07-2025": 9.000000,
      "19-07-2025": 9.000000,
      // ... more dates
    },
    "jobs": [
      {
        "JobId": "000000000000571",
        "JobDescription": "Green Garden Bench",
        "MachineId": "ASSE01",
        "MachineDescription": "Assembly Bay",
        "JobPriority": "Medium",
        "StartDate": "2023-04-18T00:00:00",
        "EndDate": "2023-04-19T00:00:00",
        "JobType": "Normal Job",
        "Status": "In Progress",
        "MasterStockCode": "GF100",
        "MasterStockDescription": "Green Garden Bench",
        "MasterStockInHand": 8,
        "MasterRemainingStockInHand": 8,
        "Materials": [
          {
            "StockCode": "A100",
            "StockDescription": "15 Speed Mountain Bike Boys",
            "UnitQtyReqd": 0.200000,
            "UnitCost": 350.00000,
            "StockInHand": 2298,
            "RemainingStockInHand": 1050
          }
        ]
      }
    ]
  }
]
```

## Data Transformation

The API service (`src/services/api.ts`) transforms the API response into the frontend format:

### Machine Transformation
- `machine` → `id` and `name`
- `description` → `description`
- `capacity` → `dailyCapacity` (preserved as object)
- Default `capacity` set to 9 (from API response)

### Job Transformation
- `JobId` → `id`
- `JobDescription` → `name` and `description`
- `MachineId` → `machineId`
- `StartDate`/`EndDate` → `startDate`/`endDate`
- `Status` → mapped to frontend status enum
- `JobPriority` → mapped to frontend priority enum
- `Materials` → transformed to frontend material format

### Material Transformation
- `StockCode` → `id`
- `StockDescription` → `name`
- `UnitQtyReqd` → `required`
- `StockInHand` → `available`
- `UnitCost` → `cost`
- Status calculated based on availability vs required quantity

## Features

### Automatic Conflict Detection
The system automatically detects:
- **Capacity Conflicts**: Overlapping jobs on the same machine
- **Material Conflicts**: Insufficient materials for job completion
- **Dependencies**: Jobs that depend on completion of other jobs

### Error Handling
- **Timeout**: 30-second request timeout
- **Network Errors**: Graceful error messages with retry functionality
- **API Errors**: HTTP status code handling
- **Data Validation**: Type checking and fallback values

### Loading States
- **Loading Indicator**: Shows while fetching data
- **Error Display**: Shows error messages with retry button
- **Toast Notifications**: Success/error feedback

## Configuration

Environment-specific configuration is handled in `src/config/environment.ts`:

```typescript
export const config = {
  api: {
    baseUrl: import.meta.env.PROD 
      ? 'http://SysproAPI.com/api/scheduling/job'
      : 'http://localhost:5223/api/scheduling/job',
    timeout: 30000,
  },
  // ... other config
};
```

## Usage

The API integration is automatically used when the application loads. The main data flow is:

1. **Component Mount**: `Index.tsx` calls `apiService.fetchSchedulingData()`
2. **Data Fetching**: API service makes HTTP request to backend
3. **Data Transformation**: API response is converted to frontend format
4. **State Update**: Jobs and machines are stored in React state
5. **UI Update**: Components re-render with real data

## Error Recovery

If the API is unavailable:
1. Error message is displayed
2. Retry button allows manual retry
3. Toast notification shows error details
4. Application remains functional with empty data

## Future Enhancements

- **WebSocket Integration**: Real-time updates
- **Caching**: Local storage for offline functionality
- **Pagination**: Large dataset handling
- **Filtering**: Server-side filtering
- **Optimistic Updates**: Immediate UI updates with API sync

## Testing

To test the API integration:

1. **Development**: Ensure your backend is running on `localhost:5223`
2. **Production**: Ensure the production API is accessible
3. **Network**: Check network connectivity and CORS settings
4. **Data**: Verify API response format matches expected schema

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from frontend origin
2. **Timeout Errors**: Check network connectivity and API response time
3. **Data Format Errors**: Verify API response matches expected schema
4. **Authentication**: Add authentication headers if required

### Debug Information

Enable browser developer tools to see:
- Network requests in Network tab
- Console errors in Console tab
- API response data in Network tab response 