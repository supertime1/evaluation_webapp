# Metrics Components

This directory contains components for visualizing and displaying metrics in the FortiEval application.

## Components Overview

### 1. MetricTrendsV2

Enhanced version of MetricTrends that supports many metrics with interactive filtering:
- User-selectable metrics via toggleable badges
- Maximum number of visible metrics can be configured
- Consistent color scheme across all metric visualizations
- Threshold reference lines for each metric
- Better legend placement at the bottom of the chart

**Usage:**
```tsx
<MetricTrendsV2 
  runs={runs} 
  experimentId={experimentId} 
  initialMetrics={['accuracy', 'completeness', 'relevancy']}
  maxVisibleMetrics={5}
/>
```

### 2. MetricBreakdown

Displays individual metric cards with detailed information for each metric:
- Current value and comparison to previous run
- Trend indicators (improving/declining/stable)
- Description of what each metric measures
- Visual bar representation of values

**Usage:**
```tsx
<MetricBreakdown runs={runs} />
```

### 3. MiniMetricsChart

A compact area chart for displaying metric trends in smaller UI elements:
- Space-efficient design for cards and list items
- Simplified visualization focusing on aggregate trends
- Interactive tooltips
- Smooth gradient fill

**Usage:**
```tsx
<MiniMetricsChart runs={runs} />
```

### 4. MetricTrends (Legacy)

The original metrics chart component. Consider using MetricTrendsV2 instead which provides enhanced features.

### 5. ExperimentHealth (Unused)

Component that shows the overall health of an experiment based on metrics. Currently not in use but available if needed.

## Centralized Metrics Utilities

All metric-related utilities are centralized in `lib/utils/metrics.ts`:

- **Consistent Colors**: Colors for each metric are defined once and reused across components
- **Threshold Values**: Reference lines showing minimum acceptable values
- **Metric Descriptions**: Standard descriptions of what each metric measures
- **Consistent Calculation**: Functions for generating/calculating metrics consistently

## Implementation Notes

- All components use Recharts for visualization
- For demo purposes, metrics are generated using a stable pseudorandom function based on run ID
- In a production environment, these would use actual metrics data from runs
- Components are responsive and work well on different screen sizes

## Handling Multiple Metrics

The MetricTrendsV2 component provides a solution for displaying potentially many metrics:

1. **User Selection**: Allows users to select which metrics they want to see
2. **Maximum Limit**: Enforces a maximum limit on the number of visible metrics
3. **Cycling Behavior**: When adding a new metric after reaching the maximum, the oldest one is removed
4. **Visual Differentiation**: Uses a distinct color palette to ensure each metric is visually distinct

## Future Improvements

- Implement comparison view between different experiments
- Add export functionality for metrics data
- Add custom threshold configuration
- Enable grouping of related metrics
- Provide metric value transformations (e.g., percentages, log scale) 