import { MetricDataEntity, TestResultEntity } from '@/lib/models';

/**
 * Interface for metric statistics
 */
export interface MetricStats {
  name: string;
  count: number;
  average: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
  successRate: number;
  evaluationModel?: string;
}

/**
 * Extract all unique metric names from test results
 */
export function extractUniqueMetricNames(testResults: TestResultEntity[]): string[] {
  const uniqueNames = new Set<string>();
  
  testResults.forEach(testResult => {
    testResult.metrics_data.forEach(metric => {
      uniqueNames.add(metric.name);
    });
  });
  
  return Array.from(uniqueNames).sort();
}

/**
 * Group metrics by name from test results
 */
export function groupMetricsByName(testResults: TestResultEntity[]): Record<string, MetricDataEntity[]> {
  const metricsByName: Record<string, MetricDataEntity[]> = {};
  
  testResults.forEach(testResult => {
    testResult.metrics_data.forEach(metric => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric);
    });
  });
  
  return metricsByName;
}

/**
 * Calculate average of an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function calculateStandardDeviation(values: number[], average?: number): number {
  if (values.length <= 1) return 0;
  
  const avg = average !== undefined ? average : calculateAverage(values);
  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sortedValues = [...values].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedValues.length / 2);
  
  if (sortedValues.length % 2 === 0) {
    // If even number of elements, average the two middle values
    return (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
  } else {
    // If odd number of elements, return the middle value
    return sortedValues[midIndex];
  }
}

/**
 * Calculate statistics for each metric across test results
 */
export function calculateMetricStats(testResults: TestResultEntity[]): MetricStats[] {
  const metricsByName = groupMetricsByName(testResults);
  
  return Object.entries(metricsByName).map(([name, metrics]) => {
    const scores = metrics.map(metric => metric.score);
    const average = calculateAverage(scores);
    const successes = metrics.filter(metric => metric.success).length;
    
    // Find most common evaluation model
    const modelCounts: Record<string, number> = {};
    metrics.forEach(metric => {
      if (metric.evaluation_model) {
        modelCounts[metric.evaluation_model] = (modelCounts[metric.evaluation_model] || 0) + 1;
      }
    });
    
    let mostCommonModel: string | undefined;
    let maxCount = 0;
    
    Object.entries(modelCounts).forEach(([model, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonModel = model;
      }
    });
    
    return {
      name,
      count: metrics.length,
      average,
      stdDev: calculateStandardDeviation(scores, average),
      min: Math.min(...scores),
      max: Math.max(...scores),
      median: calculateMedian(scores),
      successRate: metrics.length > 0 ? successes / metrics.length : 0,
      evaluationModel: mostCommonModel
    };
  });
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Calculate metric trends comparing the most recent runs to previous runs
 */
export function calculateMetricTrends(
  testResults: TestResultEntity[], 
  recentCount: number = 1,
  comparisonCount: number = 5
): Record<string, number> {
  // Group test results by run
  const testResultsByRunId: Record<string, TestResultEntity[]> = {};
  
  testResults.forEach(result => {
    if (!testResultsByRunId[result.run_id]) {
      testResultsByRunId[result.run_id] = [];
    }
    testResultsByRunId[result.run_id].push(result);
  });
  
  // Sort run IDs by date (assuming the most recent run has the highest run_id value)
  const sortedRunIds = Object.keys(testResultsByRunId).sort().reverse();
  
  // Get recent runs and comparison runs
  const recentRunIds = sortedRunIds.slice(0, recentCount);
  const comparisonRunIds = sortedRunIds.slice(recentCount, recentCount + comparisonCount);
  
  if (recentRunIds.length === 0 || comparisonRunIds.length === 0) {
    return {};
  }
  
  // Collect test results for both groups
  const recentResults: TestResultEntity[] = [];
  recentRunIds.forEach(runId => {
    recentResults.push(...testResultsByRunId[runId]);
  });
  
  const comparisonResults: TestResultEntity[] = [];
  comparisonRunIds.forEach(runId => {
    comparisonResults.push(...testResultsByRunId[runId]);
  });
  
  // Calculate stats for both groups
  const recentStats = calculateMetricStats(recentResults);
  const comparisonStats = calculateMetricStats(comparisonResults);
  
  // Create map of comparison stats by name for easier lookup
  const comparisonStatsByName = new Map<string, MetricStats>();
  comparisonStats.forEach(stat => {
    comparisonStatsByName.set(stat.name, stat);
  });
  
  // Calculate percentage changes
  const trends: Record<string, number> = {};
  
  recentStats.forEach(recentStat => {
    const comparisonStat = comparisonStatsByName.get(recentStat.name);
    
    if (comparisonStat) {
      trends[recentStat.name] = calculatePercentageChange(
        recentStat.average, 
        comparisonStat.average
      );
    }
  });
  
  return trends;
} 