import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { useLocation } from "wouter";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  FileSpreadsheet,
  FileJson
} from "lucide-react";

type ImportRow = {
  metric_name: string;
  value: number;
  unit: string;
  category?: string;
  notes?: string;
  status?: 'pending' | 'success' | 'error';
  error?: string;
};

export default function DataImport() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setValidationErrors([]);

    try {
      const text = await uploadedFile.text();
      let data: ImportRow[] = [];

      if (uploadedFile.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else if (uploadedFile.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or JSON files.');
      }

      const errors = validateData(data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Validation Errors",
          description: `Found ${errors.length} error(s) in the file`,
          variant: "destructive"
        });
      }

      setImportData(data.map(row => ({ ...row, status: 'pending' })));
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to read file",
        variant: "destructive"
      });
    }
  };

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['metric_name', 'value', 'unit'];
    const hasRequired = requiredHeaders.every(h => headers.includes(h));

    if (!hasRequired) {
      throw new Error(`CSV must contain headers: ${requiredHeaders.join(', ')}`);
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      return {
        metric_name: row.metric_name,
        value: parseFloat(row.value),
        unit: row.unit,
        category: row.category,
        notes: row.notes
      };
    });
  };

  const validateData = (data: ImportRow[]): string[] => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (!row.metric_name) {
        errors.push(`Row ${index + 1}: Missing metric_name`);
      }
      if (isNaN(row.value)) {
        errors.push(`Row ${index + 1}: Invalid value (must be a number)`);
      }
      if (!row.unit) {
        errors.push(`Row ${index + 1}: Missing unit`);
      }
    });

    return errors;
  };

  const handleImport = async () => {
    if (!selectedReportId) {
      toast({
        title: "No report selected",
        description: "Please select a report to import data into",
        variant: "destructive"
      });
      return;
    }

    if (importData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please upload a file first",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const updatedData = [...importData];

      for (let i = 0; i < importData.length; i++) {
        const row = importData[i];
        try {
          const { error } = await supabase
            .from('data_entries')
            .insert({
              report_id: selectedReportId,
              organization_id: profile?.organization_id,
              metric_name: row.metric_name,
              value: row.value,
              unit: row.unit,
              category: row.category || 'General',
              notes: row.notes
            });

          if (error) throw error;

          updatedData[i].status = 'success';
          successCount++;
        } catch (error) {
          console.error(`Error importing row ${i + 1}:`, error);
          updatedData[i].status = 'error';
          updatedData[i].error = error instanceof Error ? error.message : 'Unknown error';
          errorCount++;
        }
      }

      setImportData(updatedData);

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} rows. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      if (errorCount === 0) {
        await supabase.from('activity_logs').insert({
          organization_id: profile?.organization_id,
          user_id: profile?.id,
          action: 'data_imported',
          entity_type: 'data_entry',
          entity_id: selectedReportId,
          details: { count: successCount }
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    const template = [
      {
        metric_name: 'Total Energy Consumption',
        value: 50000,
        unit: 'kWh',
        category: 'Environmental',
        notes: 'Annual total for 2024'
      },
      {
        metric_name: 'Water Usage',
        value: 10000,
        unit: 'm³',
        category: 'Environmental',
        notes: 'Annual total for 2024'
      },
      {
        metric_name: 'Employee Turnover Rate',
        value: 12.5,
        unit: '%',
        category: 'Social',
        notes: 'Annual average'
      }
    ];

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = ['metric_name', 'value', 'unit', 'category', 'notes'];
      const csvContent = [
        headers.join(','),
        ...template.map(row =>
          headers.map(h => row[h as keyof typeof row] || '').join(',')
        )
      ].join('\n');

      content = csvContent;
      filename = 'data_import_template.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(template, null, 2);
      filename = 'data_import_template.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearImport = () => {
    setFile(null);
    setImportData([]);
    setValidationErrors([]);
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Data Import</h1>
          <p className="text-gray-600">Import multiple data entries at once using CSV or JSON files</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Select a CSV or JSON file containing your ESG data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span className="cursor-pointer">Choose File</span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Supported formats: CSV, JSON (Max 10MB)
                  </p>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={clearImport}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {validationErrors.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-2">Validation Errors</h4>
                          <ul className="space-y-1 text-sm text-red-700">
                            {validationErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {importData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Preview ({importData.length} rows)
                      </h3>
                      <div className="flex gap-2">
                        <Button onClick={clearImport} variant="outline" size="sm">
                          Clear
                        </Button>
                        <Button
                          onClick={handleImport}
                          disabled={importing || validationErrors.length > 0}
                          size="sm"
                        >
                          {importing ? 'Importing...' : 'Import Data'}
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b sticky top-0">
                            <tr>
                              <th className="text-left py-2 px-3 font-semibold">Status</th>
                              <th className="text-left py-2 px-3 font-semibold">Metric Name</th>
                              <th className="text-left py-2 px-3 font-semibold">Value</th>
                              <th className="text-left py-2 px-3 font-semibold">Unit</th>
                              <th className="text-left py-2 px-3 font-semibold">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importData.map((row, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">
                                  {row.status === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {row.status === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  {row.status === 'pending' && (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                  )}
                                </td>
                                <td className="py-2 px-3">{row.metric_name}</td>
                                <td className="py-2 px-3">{row.value}</td>
                                <td className="py-2 px-3">{row.unit}</td>
                                <td className="py-2 px-3">{row.category || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Templates
                </CardTitle>
                <CardDescription>
                  Download sample templates to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => downloadTemplate('csv')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <Button
                  onClick={() => downloadTemplate('json')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Download JSON Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  File Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Required Fields:</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• metric_name</li>
                      <li>• value (number)</li>
                      <li>• unit</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Optional Fields:</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• category</li>
                      <li>• notes</li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Download a template to see the correct format and example data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Pro Tip</p>
                    <p>
                      You can import hundreds of data points at once. Make sure your data is validated before importing to avoid errors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
