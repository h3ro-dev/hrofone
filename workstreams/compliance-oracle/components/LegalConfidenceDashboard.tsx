import React from 'react';
import { LegalConfidenceReport, ConfidenceScore } from './legal-confidence-engine';

interface LegalConfidenceDashboardProps {
  report: LegalConfidenceReport | null;
  onRefresh: () => void;
}

const LegalConfidenceDashboard: React.FC<LegalConfidenceDashboardProps> = ({ report, onRefresh }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No compliance report available</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getLevelIcon = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high': return '✓';
      case 'medium': return '!';
      case 'low': return '✗';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Legal Confidence Dashboard</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Overall Score */}
      <div className={`mb-8 p-6 rounded-lg ${getScoreBgColor(report.overallScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Overall Compliance Confidence</h3>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {formatDate(report.generatedAt)}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
              {report.overallScore}%
            </div>
            <div className={`text-lg font-medium ${getScoreColor(report.overallScore)}`}>
              {report.overallLevel.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {report.criticalIssues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ Critical Compliance Issues ({report.criticalIssues.length})
          </h4>
          <ul className="space-y-1">
            {report.criticalIssues.slice(0, 3).map((issue, index) => (
              <li key={index} className="text-sm text-red-700">
                • {issue.description}
              </li>
            ))}
            {report.criticalIssues.length > 3 && (
              <li className="text-sm text-red-700 font-medium">
                • ...and {report.criticalIssues.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Area Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {report.areaScores.map((areaScore) => (
          <div
            key={areaScore.area.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{areaScore.area.name}</h4>
              <span
                className={`text-2xl ${getScoreColor(areaScore.score)}`}
                title={`${areaScore.level} confidence`}
              >
                {getLevelIcon(areaScore.level)}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-sm text-gray-600">
                {areaScore.checks.filter(c => c.status === 'compliant').length}/{areaScore.checks.length} compliant
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(areaScore.score)}`}>
                {areaScore.score}%
              </div>
            </div>
            {areaScore.recommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600">{areaScore.recommendations[0]}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Progress</h4>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              report.overallScore >= 90
                ? 'bg-green-600'
                : report.overallScore >= 70
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${report.overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0%</span>
          <span>Low (70%)</span>
          <span>High (90%)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Next Steps */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Recommended Next Steps</h4>
        <div className="space-y-2">
          {report.areaScores
            .filter(area => area.recommendations.length > 0)
            .slice(0, 3)
            .map((area, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">{index + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{area.area.name}</p>
                  <p className="text-sm text-gray-600">{area.recommendations[0]}</p>
                </div>
              </div>
            ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Next review scheduled: {formatDate(report.nextReviewDate)}
        </p>
      </div>
    </div>
  );
};

export default LegalConfidenceDashboard;