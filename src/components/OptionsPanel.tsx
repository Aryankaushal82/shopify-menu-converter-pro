
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface OptionsConfig {
  handle: string;
  title: string;
  tags: string;
  vendor: string;
  productCategory: string;
}

interface OptionsPanelProps {
  options: OptionsConfig;
  onChange: (options: OptionsConfig) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onChange }) => {
  const handleChange = (field: keyof OptionsConfig, value: string) => {
    onChange({
      ...options,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration Options</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="handle" className="text-sm font-medium text-gray-700 mb-2 block">
            Product Handle
          </Label>
          <Input
            id="handle"
            value={options.handle}
            onChange={(e) => handleChange('handle', e.target.value)}
            placeholder="custom-product"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Unique identifier for the product</p>
        </div>

        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
            Product Title
          </Label>
          <Input
            id="title"
            value={options.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Custom Product"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Display name for the product</p>
        </div>

        <div>
          <Label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 block">
            Tags
          </Label>
          <Input
            id="tags"
            value={options.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="custom-product"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated tags for organization</p>
        </div>

        <div>
          <Label htmlFor="vendor" className="text-sm font-medium text-gray-700 mb-2 block">
            Vendor
          </Label>
          <Input
            id="vendor"
            value={options.vendor}
            onChange={(e) => handleChange('vendor', e.target.value)}
            placeholder="Delta's Integration"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Product manufacturer or supplier</p>
        </div>

        <div>
          <Label htmlFor="productCategory" className="text-sm font-medium text-gray-700 mb-2 block">
            Product Category
          </Label>
          <Input
            id="productCategory"
            value={options.productCategory}
            onChange={(e) => handleChange('productCategory', e.target.value)}
            placeholder="Furniture > Office Furniture > Workspace Tables"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Hierarchical product categorization</p>
        </div>
      </div>
    </div>
  );
};
