export interface DataQualityCheck {
  field: string;
  value: any;
  expectedType: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface DataQualityResult {
  isValid: boolean;
  score: number;
  issues: DataQualityIssue[];
  warnings: DataQualityWarning[];
}

export interface DataQualityIssue {
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface DataQualityWarning {
  field: string;
  message: string;
}

export function validateDataQuality(checks: DataQualityCheck[]): DataQualityResult {
  const issues: DataQualityIssue[] = [];
  const warnings: DataQualityWarning[] = [];

  checks.forEach((check) => {
    if (check.required && (check.value === null || check.value === undefined || check.value === '')) {
      issues.push({
        field: check.field,
        severity: 'critical',
        message: `${check.field} is required but missing`,
        suggestion: `Please provide a value for ${check.field}`,
      });
      return;
    }

    if (check.value === null || check.value === undefined || check.value === '') {
      return;
    }

    switch (check.expectedType) {
      case 'number': {
        const num = Number(check.value);
        if (isNaN(num)) {
          issues.push({
            field: check.field,
            severity: 'high',
            message: `${check.field} should be a number`,
            suggestion: 'Enter a valid numeric value',
          });
        } else {
          if (check.min !== undefined && num < check.min) {
            issues.push({
              field: check.field,
              severity: 'medium',
              message: `${check.field} is below minimum value of ${check.min}`,
              suggestion: `Value should be at least ${check.min}`,
            });
          }
          if (check.max !== undefined && num > check.max) {
            issues.push({
              field: check.field,
              severity: 'medium',
              message: `${check.field} exceeds maximum value of ${check.max}`,
              suggestion: `Value should not exceed ${check.max}`,
            });
          }
        }
        break;
      }

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(check.value))) {
          issues.push({
            field: check.field,
            severity: 'high',
            message: `${check.field} is not a valid email address`,
            suggestion: 'Enter a valid email address (e.g., user@example.com)',
          });
        }
        break;
      }

      case 'url': {
        try {
          new URL(String(check.value));
        } catch {
          issues.push({
            field: check.field,
            severity: 'medium',
            message: `${check.field} is not a valid URL`,
            suggestion: 'Enter a valid URL (e.g., https://example.com)',
          });
        }
        break;
      }

      case 'date': {
        const date = new Date(check.value);
        if (isNaN(date.getTime())) {
          issues.push({
            field: check.field,
            severity: 'high',
            message: `${check.field} is not a valid date`,
            suggestion: 'Enter a valid date',
          });
        }
        break;
      }

      case 'string': {
        const str = String(check.value);
        if (check.min !== undefined && str.length < check.min) {
          issues.push({
            field: check.field,
            severity: 'medium',
            message: `${check.field} is too short (minimum ${check.min} characters)`,
            suggestion: `Enter at least ${check.min} characters`,
          });
        }
        if (check.max !== undefined && str.length > check.max) {
          issues.push({
            field: check.field,
            severity: 'low',
            message: `${check.field} is too long (maximum ${check.max} characters)`,
            suggestion: `Keep it under ${check.max} characters`,
          });
        }
        if (check.pattern && !check.pattern.test(str)) {
          issues.push({
            field: check.field,
            severity: 'medium',
            message: `${check.field} format is invalid`,
            suggestion: 'Check the expected format',
          });
        }
        break;
      }
    }
  });

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;

  const totalFields = checks.length;
  const fieldsWithIssues = new Set(issues.map((i) => i.field)).size;
  const validFields = totalFields - fieldsWithIssues;

  const baseScore = (validFields / totalFields) * 100;
  const penaltyScore =
    criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2;

  const score = Math.max(0, Math.min(100, baseScore - penaltyScore));

  return {
    isValid: criticalCount === 0 && highCount === 0,
    score: Math.round(score),
    issues,
    warnings,
  };
}

export function detectAnomalies(
  data: number[],
  threshold = 2
): { hasAnomalies: boolean; anomalyIndices: number[] } {
  if (data.length < 3) {
    return { hasAnomalies: false, anomalyIndices: [] };
  }

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  const anomalyIndices: number[] = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      anomalyIndices.push(index);
    }
  });

  return {
    hasAnomalies: anomalyIndices.length > 0,
    anomalyIndices,
  };
}

export function calculateCompleteness(data: Record<string, any>): {
  score: number;
  missingFields: string[];
  totalFields: number;
  filledFields: number;
} {
  const fields = Object.keys(data);
  const totalFields = fields.length;
  const missingFields: string[] = [];

  fields.forEach((field) => {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push(field);
    }
  });

  const filledFields = totalFields - missingFields.length;
  const score = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  return {
    score: Math.round(score),
    missingFields,
    totalFields,
    filledFields,
  };
}

export function validateCrossfieldConsistency(
  data: Record<string, any>,
  rules: Array<{
    field1: string;
    field2: string;
    validator: (val1: any, val2: any) => boolean;
    message: string;
  }>
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  rules.forEach((rule) => {
    const val1 = data[rule.field1];
    const val2 = data[rule.field2];

    if (
      val1 !== null &&
      val1 !== undefined &&
      val2 !== null &&
      val2 !== undefined &&
      !rule.validator(val1, val2)
    ) {
      issues.push({
        field: `${rule.field1}, ${rule.field2}`,
        severity: 'high',
        message: rule.message,
        suggestion: 'Check for data inconsistencies',
      });
    }
  });

  return issues;
}

export function generateDataQualityReport(
  data: Record<string, any>,
  checks: DataQualityCheck[]
): {
  overallScore: number;
  validation: DataQualityResult;
  completeness: ReturnType<typeof calculateCompleteness>;
  summary: string;
} {
  const validation = validateDataQuality(checks);
  const completeness = calculateCompleteness(data);

  const overallScore = Math.round((validation.score + completeness.score) / 2);

  let summary = '';
  if (overallScore >= 90) {
    summary = 'Excellent data quality - ready for reporting';
  } else if (overallScore >= 75) {
    summary = 'Good data quality - minor improvements needed';
  } else if (overallScore >= 60) {
    summary = 'Fair data quality - several issues require attention';
  } else if (overallScore >= 40) {
    summary = 'Poor data quality - significant improvements required';
  } else {
    summary = 'Critical data quality issues - not suitable for reporting';
  }

  return {
    overallScore,
    validation,
    completeness,
    summary,
  };
}
