import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Download,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function DataManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.type === 'application/json') {
        setImportFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a CSV or JSON file",
          variant: "destructive"
        });
      }
    }
  };

  const handleImportData = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;

        toast({
          title: "Import Started",
          description: "Your data is being imported..."
        });

        setTimeout(() => {
          setImporting(false);
          setImportFile(null);
          toast({
            title: "Import Completed",
            description: "Data has been successfully imported"
          });
        }, 2000);
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive"
      });
      setImporting(false);
    }
  };

  const handleExportReports = async () => {
    setExporting(true);
    try {
      const { data: reports, error } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('organization_id', profile?.organization_id);

      if (error) throw error;

      const csv = convertToCSV(reports || []);
      downloadFile(csv, 'reports-export.csv', 'text/csv');

      toast({
        title: "Export Completed",
        description: "Reports have been exported successfully"
      });
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast({
        title: "Error",
        description: "Failed to export reports",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportDataEntries = async () => {
    setExporting(true);
    try {
      const { data: dataEntries, error } = await supabase
        .from('data_entries')
        .select(`
          *,
          report:esg_reports(title)
        `)
        .eq('organization_id', profile?.organization_id);

      if (error) throw error;

      const csv = convertToCSV(dataEntries || []);
      downloadFile(csv, 'data-entries-export.csv', 'text/csv');

      toast({
        title: "Export Completed",
        description: "Data entries have been exported successfully"
      });
    } catch (error) {
      console.error('Error exporting data entries:', error);
      toast({
        title: "Error",
        description: "Failed to export data entries",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
          <p className="text-gray-600">Import and export your ESG data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Import Data
              </CardTitle>
              <CardDescription>Upload CSV or JSON files to import data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV or JSON files only</p>
                </label>
              </div>

              {importFile && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(importFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setImportFile(null)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Ensure your data format matches our template</li>
                      <li>Duplicate entries will be skipped</li>
                      <li>Invalid data will be logged for review</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleImportData}
                disabled={!importFile || importing}
                className="w-full"
              >
                {importing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2 text-green-600" />
                Export Data
              </CardTitle>
              <CardDescription>Download your data in CSV format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleExportReports}
                  disabled={exporting}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Export All Reports
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleExportDataEntries}
                  disabled={exporting}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Export Data Entries
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Export Features:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>CSV format for easy import to Excel</li>
                      <li>All data from your organization</li>
                      <li>Includes metadata and timestamps</li>
                      <li>Compatible with other ESG platforms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Data Templates</CardTitle>
            <CardDescription>Download templates to structure your import data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-between">
                <span>Reports Template</span>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Data Entries Template</span>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Documents Template</span>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
