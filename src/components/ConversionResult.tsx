
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionResultProps {
  csvContent: string;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({ csvContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csvContent);
      toast.success('CSV content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const getPreview = () => {
    const lines = csvContent.split('\n');
    const previewLines = lines.slice(0, 5);
    const remainingLines = lines.length - 5;
    
    return {
      preview: previewLines.join('\n'),
      hasMore: remainingLines > 0,
      remainingCount: remainingLines
    };
  };

  const { preview, hasMore, remainingCount } = getPreview();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-600" />
          CSV Output
        </Label>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Expand
              </>
            )}
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-gray-50">
        <pre className="p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {isExpanded ? csvContent : preview}
        </pre>
        
        {!isExpanded && hasMore && (
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ... and {remainingCount} more {remainingCount === 1 ? 'line' : 'lines'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <span>Total rows: {csvContent.split('\n').length - 1}</span>
        <span>Ready for Shopify import</span>
      </div>
    </div>
  );
};
