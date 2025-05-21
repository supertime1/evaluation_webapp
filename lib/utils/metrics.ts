import { RunEntity } from '@/lib/models';

/**
 * Define consistent colors for metrics with good visual differentiation
 */
export const metricColors = {
  accuracy: '#2563eb',     // Blue
  completeness: '#be185d', // Pink
  relevancy: '#047857',    // Green
  fluency: '#7c3aed',      // Purple
  factuality: '#b45309',   // Amber
  coherence: '#1e40af',    // Indigo
  // Add more metrics as needed
};

/**
 * Metric threshold values for minimum acceptable performance
 */
export const metricThresholds = {
  accuracy: 0.75,
  completeness: 0.70,
  relevancy: 0.80,
  fluency: 0.85,
  factuality: 0.90,
  coherence: 0.75,
};

/**
 * Metric descriptions for display purposes
 */
export const metricDescriptions = {
  accuracy: 'Measures how accurate the model responses are compared to reference answers',
  completeness: 'Evaluates whether the model response covers all required aspects of the question',
  relevancy: 'Assesses how relevant the model response is to the given prompt',
  fluency: 'Measures the linguistic quality and natural flow of the response',
  factuality: 'Evaluates whether the response contains only factual information',
  coherence: 'Assesses the logical consistency and structure of the response',
};

/**
 * Stable pseudorandom function based on string
 * Ensures the same input always produces the same output
 */
export const stableRandom = (str: string, min = 0, max = 1) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize between 0 and 1
  const normalized = (hash & 0x7fffffff) / 0x7fffffff;
  // Scale to the range
  return min + normalized * (max - min);
};

/**
 * Generate consistent metrics for a run based on its ID
 * In a real app, this would fetch actual metrics from the run data
 */
export const generateMetricsForRun = (run: RunEntity) => {
  // Use run ID to seed the random values - this ensures the same run always gets the same metrics
  const metrics = {
    accuracy: parseFloat((0.70 + stableRandom(`${run.id}_accuracy`, 0, 0.15)).toFixed(2)),
    completeness: parseFloat((0.65 + stableRandom(`${run.id}_completeness`, 0, 0.20)).toFixed(2)),
    relevancy: parseFloat((0.75 + stableRandom(`${run.id}_relevancy`, 0, 0.15)).toFixed(2)),
  };
  
  // Additional metrics can be added here as needed
  return metrics;
};

/**
 * Calculate an aggregate score across all metrics
 */
export const calculateAggregateScore = (metrics: Record<string, number>) => {
  const values = Object.values(metrics);
  return parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
};

/**
 * Get all metric names currently supported
 */
export const getAvailableMetrics = (): string[] => {
  return Object.keys(metricColors);
};

/**
 * Determine the trend between two sets of metrics
 */
export type TrendDirection = 'up' | 'down' | 'stable';

export const calculateTrend = (
  current: number,
  previous: number | null
): TrendDirection => {
  if (!previous) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
};

/**
 * Format a metric value as a percentage string
 */
export const formatMetricValue = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

/**
 * Calculate change between current and previous metric values
 */
export const calculateChange = (
  current: number,
  previous: number | null
): number | null => {
  if (previous === null) return null;
  return parseFloat((current - previous).toFixed(2));
}; 