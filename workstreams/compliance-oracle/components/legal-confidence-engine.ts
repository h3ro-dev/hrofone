/**
 * Legal Confidence Engine for HR Compliance
 * Calculates confidence scores for various compliance areas
 */

export interface ComplianceArea {
  id: string;
  name: string;
  category: string;
  weight: number; // Importance weight for overall score
}

export interface ComplianceCheck {
  id: string;
  areaId: string;
  description: string;
  required: boolean;
  status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
  lastChecked: Date;
  evidence?: string;
}

export interface ConfidenceScore {
  area: ComplianceArea;
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  checks: ComplianceCheck[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface LegalConfidenceReport {
  overallScore: number;
  overallLevel: 'high' | 'medium' | 'low';
  areaScores: ConfidenceScore[];
  criticalIssues: ComplianceCheck[];
  generatedAt: Date;
  nextReviewDate: Date;
}

export class LegalConfidenceEngine {
  private complianceAreas: ComplianceArea[] = [
    { id: 'employment-law', name: 'Employment Law', category: 'legal', weight: 0.20 },
    { id: 'payroll-tax', name: 'Payroll & Tax Compliance', category: 'financial', weight: 0.25 },
    { id: 'benefits', name: 'Benefits Administration', category: 'benefits', weight: 0.15 },
    { id: 'workplace-safety', name: 'Workplace Safety (OSHA)', category: 'safety', weight: 0.15 },
    { id: 'eeo', name: 'Equal Employment Opportunity', category: 'legal', weight: 0.15 },
    { id: 'data-privacy', name: 'Data Privacy & Security', category: 'privacy', weight: 0.10 }
  ];

  /**
   * Calculate confidence score for a specific compliance area
   */
  calculateAreaConfidence(checks: ComplianceCheck[]): number {
    if (checks.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    checks.forEach(check => {
      const weight = check.required ? 2 : 1;
      totalWeight += weight;

      switch (check.status) {
        case 'compliant':
          totalScore += weight * 100;
          break;
        case 'partial':
          totalScore += weight * 70;
          break;
        case 'non-compliant':
          totalScore += weight * 0;
          break;
        case 'unknown':
          totalScore += weight * 50;
          break;
      }
    });

    return Math.round(totalScore / totalWeight);
  }

  /**
   * Determine confidence level based on score
   */
  getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on compliance checks
   */
  generateRecommendations(checks: ComplianceCheck[]): string[] {
    const recommendations: string[] = [];

    const nonCompliantChecks = checks.filter(c => c.status === 'non-compliant' && c.required);
    const partialChecks = checks.filter(c => c.status === 'partial');
    const unknownChecks = checks.filter(c => c.status === 'unknown');

    if (nonCompliantChecks.length > 0) {
      recommendations.push(
        `Address ${nonCompliantChecks.length} critical compliance issue(s) immediately`
      );
      nonCompliantChecks.slice(0, 3).forEach(check => {
        recommendations.push(`• ${check.description}`);
      });
    }

    if (partialChecks.length > 0) {
      recommendations.push(
        `Complete ${partialChecks.length} partially compliant item(s) to improve score`
      );
    }

    if (unknownChecks.length > 0) {
      recommendations.push(
        `Review and update ${unknownChecks.length} item(s) with unknown status`
      );
    }

    return recommendations;
  }

  /**
   * Generate a comprehensive legal confidence report
   */
  generateReport(complianceChecks: Map<string, ComplianceCheck[]>): LegalConfidenceReport {
    const areaScores: ConfidenceScore[] = [];
    const criticalIssues: ComplianceCheck[] = [];

    // Calculate scores for each area
    this.complianceAreas.forEach(area => {
      const checks = complianceChecks.get(area.id) || [];
      const score = this.calculateAreaConfidence(checks);
      const level = this.getConfidenceLevel(score);

      areaScores.push({
        area,
        score,
        level,
        checks,
        recommendations: this.generateRecommendations(checks),
        lastUpdated: new Date()
      });

      // Collect critical issues
      checks.forEach(check => {
        if (check.required && check.status === 'non-compliant') {
          criticalIssues.push(check);
        }
      });
    });

    // Calculate overall score
    const overallScore = Math.round(
      areaScores.reduce((sum, areaScore) => {
        return sum + (areaScore.score * areaScore.area.weight);
      }, 0)
    );

    const overallLevel = this.getConfidenceLevel(overallScore);

    return {
      overallScore,
      overallLevel,
      areaScores,
      criticalIssues,
      generatedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  /**
   * Get risk assessment for a compliance area
   */
  assessRisk(score: number, area: ComplianceArea): {
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
    likelihood: string;
  } {
    const confidenceLevel = this.getConfidenceLevel(score);
    
    let riskLevel: 'critical' | 'high' | 'medium' | 'low';
    let impact: string;
    let likelihood: string;

    switch (confidenceLevel) {
      case 'low':
        riskLevel = area.weight > 0.2 ? 'critical' : 'high';
        impact = 'Potential fines, legal action, or business disruption';
        likelihood = 'High probability of compliance issues';
        break;
      case 'medium':
        riskLevel = 'medium';
        impact = 'Possible penalties or operational inefficiencies';
        likelihood = 'Moderate probability of compliance gaps';
        break;
      case 'high':
        riskLevel = 'low';
        impact = 'Minimal risk of compliance-related issues';
        likelihood = 'Low probability of violations';
        break;
    }

    return { riskLevel, impact, likelihood };
  }
}