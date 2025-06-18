
import React, { useState } from 'react';
import { JsonInput } from '@/components/JsonInput';
import { OptionsPanel } from '@/components/OptionsPanel';
import { ConversionResult } from '@/components/ConversionResult';
import { jsonToShopifyCsv } from '@/utils/jsonToShopifyCsv';
import { downloadCsv } from '@/utils/downloadCsv';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [options, setOptions] = useState({
    handle: "custom-product",
    title: "Custom Product",
    tags: "custom-product",
    vendor: "Delta's Integration",
    productCategory: "Furniture > Office Furniture > Workspace Tables"
  });
  const [csvOutput, setCsvOutput] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data to convert');
      return;
    }

    setIsConverting(true);
    
    try {
      const parsedJson = JSON.parse(jsonInput);
      const csvContent = jsonToShopifyCsv(parsedJson, options);
      setCsvOutput(csvContent);
      toast.success('JSON converted to CSV successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Error converting JSON: ' + error.message);
      setCsvOutput('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!csvOutput) {
      toast.error('No CSV data to download');
      return;
    }
    
    const fileName = `${options.handle}_products_export.csv`;
    downloadCsv(csvOutput, fileName);
    toast.success('CSV file downloaded successfully!');
  };

  const handleReset = () => {
    setJsonInput('');
    setCsvOutput('');
    setIsValid(false);
    toast.info('Form reset successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JSON to Shopify CSV Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert your menuUI JSON format to Shopify-compatible CSV with customizable options
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* JSON Input */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <JsonInput
                value={jsonInput}
                onChange={setJsonInput}
                onValidityChange={setIsValid}
              />
            </Card>
          </div>

          {/* Options Panel */}
          <div>
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
              <OptionsPanel
                options={options}
                onChange={setOptions}
              />
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConvert}
                disabled={!isValid || isConverting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                {isConverting ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  "Convert to CSV"
                )}
              </Button>

              <Button
                onClick={handleDownload}
                disabled={!csvOutput}
                variant="outline"
                className="w-full py-3 text-lg font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CSV
              </Button>

              <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full py-3 text-lg font-medium text-gray-600 hover:text-gray-800"
              >
                Reset Form
              </Button>
            </div>
          </div>
        </div>

        {/* Conversion Result */}
        {csvOutput && (
          <div className="mt-8">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <ConversionResult csvContent={csvOutput} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
