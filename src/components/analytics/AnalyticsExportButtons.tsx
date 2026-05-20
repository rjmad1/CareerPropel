'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  AnalyticsMetrics,
  exportAnalyticsToCSV,
  exportAnalyticsToJSON,
  generateAnalyticsHTML,
  downloadFile,
} from '@/lib/analytics/export';

interface AnalyticsExportButtonsProps {
  metrics: AnalyticsMetrics;
  disabled?: boolean;
}

export const AnalyticsExportButtons: React.FC<
  AnalyticsExportButtonsProps
> = ({ metrics, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timestamp = new Date().toISOString().split('T')[0];

  const handleExportCSV = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const csvContent = exportAnalyticsToCSV(metrics);
      downloadFile(
        csvContent,
        `career-propel-analytics-${timestamp}.csv`,
        'text/csv'
      );
    } catch (err) {
      setError('Failed to export CSV');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const jsonContent = exportAnalyticsToJSON(metrics);
      downloadFile(
        jsonContent,
        `career-propel-analytics-${timestamp}.json`,
        'application/json'
      );
    } catch (err) {
      setError('Failed to export JSON');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportHTML = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const htmlContent = generateAnalyticsHTML(metrics);
      downloadFile(
        htmlContent,
        `career-propel-analytics-${timestamp}.html`,
        'text/html'
      );
    } catch (err) {
      setError('Failed to export HTML');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For PDF export, we'd typically use a library like html2pdf or jsPDF
      // This is a placeholder for PDF functionality
      const htmlContent = generateAnalyticsHTML(metrics);
      
      // In production, you'd use: html2pdf().set(opt).from(htmlContent).save()
      // For now, we export as HTML which can be printed to PDF
      downloadFile(
        htmlContent,
        `career-propel-analytics-${timestamp}.html`,
        'text/html'
      );
    } catch (err) {
      setError('Failed to export PDF');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleExportCSV}
          disabled={disabled || isLoading}
          variant="secondary"
          size="sm"
          title="Export analytics data in CSV format"
        >
          {isLoading ? 'Exporting...' : 'Export CSV'}
        </Button>

        <Button
          onClick={handleExportJSON}
          disabled={disabled || isLoading}
          variant="secondary"
          size="sm"
          title="Export analytics data in JSON format"
        >
          {isLoading ? 'Exporting...' : 'Export JSON'}
        </Button>

        <Button
          onClick={handleExportHTML}
          disabled={disabled || isLoading}
          variant="secondary"
          size="sm"
          title="Export analytics data as HTML report"
        >
          {isLoading ? 'Exporting...' : 'Export HTML'}
        </Button>

        <Button
          onClick={handleExportPDF}
          disabled={disabled || isLoading}
          variant="secondary"
          size="sm"
          title="Export analytics data as PDF (via HTML)"
        >
          {isLoading ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default AnalyticsExportButtons;
