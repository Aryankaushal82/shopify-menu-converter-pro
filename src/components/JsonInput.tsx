
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

export const JsonInput: React.FC<JsonInputProps> = ({ value, onChange, onValidityChange }) => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    validateJson(value);
  }, [value]);

  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValid(false);
      setError('');
      onValidityChange(false);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate required structure
      if (!parsed.menuUI || !Array.isArray(parsed.menuUI)) {
        throw new Error('JSON must contain a "menuUI" array');
      }

      if (parsed.menuUI.length === 0) {
        throw new Error('menuUI array cannot be empty');
      }

      // Validate each menu item has required fields
      parsed.menuUI.forEach((item, index) => {
        if (!item.label) {
          throw new Error(`Menu item ${index + 1} missing required "label" field`);
        }
        if (!item.type) {
          throw new Error(`Menu item ${index + 1} missing required "type" field`);
        }
        if (!item.options || !Array.isArray(item.options)) {
          throw new Error(`Menu item ${index + 1} missing required "options" array`);
        }
      });

      setIsValid(true);
      setError('');
      onValidityChange(true);
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      onValidityChange(false);
    }
  };

  const loadSampleData = () => {
    const sampleJson = {
      menuUI: [
        {
          label: "variant change",
          type: "material",
          target: [
            { model: "565-01", part: "part1" },
            { model: "LegA", part: "Leg_A" }
          ],
          options: [
            {
              label: "test1",
              slug: "OSaSgSpE3X7Kvi53pk9c-test1",
              baseMaps: [
                {
                  id: "72x0ngHaynQRJo2jZzgp",
                  label: "Amber",
                  slug: "72x0ngHaynQRJo2jZzgp-Amber",
                  icon: "https://example.com/amber.png",
                  hexCode: "#ffffff"
                },
                {
                  id: "iO82Ot8ZYXk5HPNed2Ej",
                  label: "Bitmore",
                  slug: "iO82Ot8ZYXk5HPNed2Ej-Bitmore",
                  icon: "https://example.com/bitmore.png",
                  hexCode: "#ffffff"
                }
              ]
            }
          ]
        },
        {
          label: "Handle Change",
          type: "model",
          options: [
            { label: "handle 1", icon: null, target: "565-01 Hardware 1", id: "e37d5bd0-409f-4aa3-84a0-14311e7e879d" },
            { label: "handle 2", icon: null, target: "565-01 Hardware 2", id: "fe2042eb-837b-41ab-9eef-b8cf20c2a074" }
          ],
          visibilityConfig: { selectionType: 0, dependsOn: [] }
        }
      ]
    };
    
    onChange(JSON.stringify(sampleJson, null, 2));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          JSON Input
        </Label>
        <div className="flex items-center space-x-2">
          {value && (
            <div className="flex items-center">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
          <Button
            onClick={loadSampleData}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Load Sample
          </Button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your JSON data here..."
        className="w-full h-96 p-4 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Validation Error:</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {isValid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">✓ Valid JSON structure detected</p>
        </div>
      )}
    </div>
  );
};
