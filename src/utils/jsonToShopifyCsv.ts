
interface OptionsConfig {
  handle?: string;
  title?: string;
  vendor?: string;
  productCategory?: string;
  tags?: string;
  basePrice?: string;
  primaryProduct?: string;
}

interface MenuUIItem {
  label: string;
  type: string;
  target?: any[];
  options: any[];
  visibilityConfig?: any;
}

interface JsonData {
  menuUI: MenuUIItem[];
}

interface ProductVariant {
  optionName: string;
  optionValue: string;
  icon?: string;
  id?: string;
}

interface Product {
  handle: string;
  title: string;
  label: string;
  type: string;
  variants: ProductVariant[];
}

export function jsonToShopifyCsv(json: JsonData, options: OptionsConfig = {}): string {
  // Shopify CSV headers - matching the template exactly
  const csvHeaders = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", 
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
    "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position", 
    "Image Alt Text", "Gift Card", "SEO Title", "SEO Description", "Google Shopping / Google Product Category",
    "Google Shopping / Gender", "Google Shopping / Age Group", "Google Shopping / MPN", 
    "Google Shopping / Condition", "Google Shopping / Custom Product", "Variant Image", 
    "Variant Weight Unit", "Variant Tax Code", "Cost per item", "Included / United States", 
    "Price / United States", "Compare At Price / United States", "Included / International", 
    "Price / International", "Compare At Price / International", "Status"
  ];

  // Helper function to escape CSV values
  function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return "";
    const strValue = String(value);
    if (strValue.includes(",") || strValue.includes("\"") || strValue.includes("\n") || strValue.includes("\r")) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  }

  // Helper function to create clean handle from label
  function createHandle(label: string): string {
    let handle = label.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    if (options.handle) {
      handle = `${options.handle}-${handle}`;
    }
    
    return handle || 'product'; // Fallback if handle is empty
  }

  // Helper function to create option name
  function createOptionName(label: string): string {
    return label.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // Convert to Title Case
  }

  // Helper function to get the effective product title
  function getProductTitle(menuItem: any): string {
    console.log('Getting product title for:', menuItem.label);
    console.log('Primary product setting:', options.primaryProduct);
    console.log('Base title setting:', options.title);
    
    if (options.primaryProduct && menuItem.label === options.primaryProduct) {
      // If this is the primary product, use the base title
      const primaryTitle = options.title || options.primaryProduct;
      console.log('Using primary product title:', primaryTitle);
      return primaryTitle;
    } else {
      // For non-primary products, use base title with their label as suffix
      const nonPrimaryTitle = options.title ? `${options.title} - ${menuItem.label}` : menuItem.label;
      console.log('Using non-primary product title:', nonPrimaryTitle);
      return nonPrimaryTitle;
    }
  }

  // Parse JSON data into products
  const products: Product[] = [];

  json.menuUI.forEach((menuItem) => {
    const product: Product = {
      handle: createHandle(menuItem.label),
      title: getProductTitle(menuItem),
      label: menuItem.label,
      type: menuItem.type,
      variants: []
    };

    // Extract variants based on type - CLEAR TYPE-BASED LOGIC
    if (menuItem.type === "material" || menuItem.type === "material change") {
      // For MATERIAL types: Extract option values from baseMaps[].label
      if (menuItem.options && menuItem.options.length > 0) {
        const baseMaps = menuItem.options[0]?.baseMaps || [];
        baseMaps.forEach((baseMap: any) => {
          product.variants.push({
            optionName: createOptionName(menuItem.label),
            optionValue: baseMap.label, // Taking label from baseMaps
            icon: baseMap.icon,
            id: baseMap.id
          });
        });
      }
    } else if (menuItem.type === "model") {
      // For MODEL type: Extract option values directly from options[].label
      if (menuItem.options && menuItem.options.length > 0) {
        menuItem.options.forEach((option: any) => {
          product.variants.push({
            optionName: createOptionName(menuItem.label),
            optionValue: option.label, // Taking label directly from options
            icon: option.icon,
            id: option.id
          });
        });
      }
    } else {
      // For OTHER types: Also use options directly as fallback
      if (menuItem.options && menuItem.options.length > 0) {
        menuItem.options.forEach((option: any) => {
          product.variants.push({
            optionName: createOptionName(menuItem.label),
            optionValue: option.label,
            icon: option.icon,
            id: option.id
          });
        });
      }
    }

    // If no variants found, create a default variant
    if (product.variants.length === 0) {
      product.variants.push({
        optionName: "Title",
        optionValue: "Default Title"
      });
    }

    products.push(product);
  });

  // Generate CSV rows
  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(csvHeaders.map(escapeCsvValue).join(","));

  let globalImagePosition = 1;

  // Generate rows for each product
  products.forEach((product) => {
    product.variants.forEach((variant, variantIndex) => {
      const row = new Array(csvHeaders.length).fill("");
      const isFirstVariant = variantIndex === 0;

      // Product-level fields (only for first variant of each product)
      if (isFirstVariant) {
        row[0] = product.handle; // Handle
        row[1] = product.title; // Title (now uses primary product logic)
        row[2] = "<p></p>"; // Body (HTML)
        row[3] = options.vendor || "Delta's Integration"; // Vendor
        row[4] = options.productCategory || "Furniture > Office Furniture > Workspace Tables"; // Product Category
        row[5] = product.type || ""; // Type
        
        // Apply common tags to all products
        const commonTags = options.tags || "";
        const productTags = commonTags ? `${commonTags}, ${product.label.toLowerCase()}` : product.label.toLowerCase();
        row[6] = productTags; // Tags
        
        row[7] = "TRUE"; // Published
      } else {
        // For subsequent variants, only include handle
        row[0] = product.handle; // Handle
        row[7] = ""; // Published (empty for subsequent variants)
      }

      // Option fields - Fixed positioning
      row[8] = variant.optionName; // Option1 Name
      row[9] = variant.optionValue; // Option1 Value
      row[10] = ""; // Option2 Name
      row[11] = ""; // Option2 Value
      row[12] = ""; // Option3 Name
      row[13] = ""; // Option3 Value

      // Variant-specific fields - Fixed positioning
      row[14] = `${product.handle}-${variantIndex + 1}`; // Variant SKU
      row[15] = "0"; // Variant Grams
      row[16] = "shopify"; // Variant Inventory Tracker
      row[17] = "10"; // Variant Inventory Qty
      row[18] = "deny"; // Variant Inventory Policy
      row[19] = "manual"; // Variant Fulfillment Service
      row[20] = options.basePrice || "3000"; // Variant Price
      row[21] = ""; // Variant Compare At Price
      row[22] = "TRUE"; // Variant Requires Shipping
      row[23] = "TRUE"; // Variant Taxable
      row[24] = ""; // Variant Barcode

      // Image fields - Fixed positioning
      if (isFirstVariant && variant.icon) {
        row[25] = "https://res.cloudinary.com/dicnuc6ox/image/upload/v1706617512/samples/chair.png" // Image Src
        row[26] = globalImagePosition.toString(); // Image Position
        row[27] = `${product.title} - ${variant.optionValue}`; // Image Alt Text
        globalImagePosition++;
      }

      row[28] = "FALSE"; // Gift Card
      row[29] = ""; // SEO Title
      row[30] = ""; // SEO Description

      // Google Shopping fields - Fixed positioning
      row[31] = ""; // Google Shopping / Google Product Category
      row[32] = ""; // Google Shopping / Gender
      row[33] = ""; // Google Shopping / Age Group
      row[34] = ""; // Google Shopping / MPN
      row[35] = ""; // Google Shopping / Condition
      row[36] = ""; // Google Shopping / Custom Product

      row[37] =  ""; // Variant Image
      row[38] = ""; // Variant Weight Unit
      row[39] = ""; // Variant Tax Code
      row[40] = ""; // Cost per item

      // Market-specific pricing fields
      row[41] = "TRUE"; // Included / United States
      row[42] = ""; // Price / United States
      row[43] = ""; // Compare At Price / United States
      row[44] = "TRUE"; // Included / International
      row[45] = ""; // Price / International
      row[46] = ""; // Compare At Price / International

      row[47] = "active"; // Status

      csvRows.push(row.map(escapeCsvValue).join(","));
    });
  });

  return csvRows.join("\n");
}

// Example usage function
export function convertJsonToCsv(jsonData: JsonData, config?: OptionsConfig): string {
  const defaultConfig: OptionsConfig = {
    baseHandle: "custom-product",
    baseTitle: "Custom Product",
    vendor: "Delta's Integration",
    productCategory: "Furniture > Office Furniture > Workspace Tables",
    baseTags: "custom, configurable",
    basePrice: "3000",
    primaryProduct: "primary-product"
  };

  const finalConfig = { ...defaultConfig, ...config };
  return jsonToShopifyCsv(jsonData, finalConfig);
}

// Test with your sample data
const sampleData: JsonData = {
  "menuUI": [
    {
      "label": "variant change",
      "type": "material",
      "target": [
        {
          "model": "565-01",
          "part": "part1"
        },
        {
          "model": "LegA",
          "part": "Leg_A"
        }
      ],
      "options": [
        {
          "label": "test1",
          "slug": "OSaSgSpE3X7Kvi53pk9c-test1",
          "baseMaps": [
            {
              "id": "72x0ngHaynQRJo2jZzgp",
              "label": "Amber",
              "slug": "72x0ngHaynQRJo2jZzgp-Amber",
              "icon": "https://example.com/amber.png",
              "hexCode": "#ffffff"
            },
            {
              "id": "iO82Ot8ZYXk5HPNed2Ej",
              "label": "Bitmore",
              "slug": "iO82Ot8ZYXk5HPNed2Ej-Bitmore",
              "icon": "https://example.com/bitmore.png",
              "hexCode": "#ffffff"
            }
          ]
        }
      ]
    },
    {
      "label": "Handle Change",
      "type": "model",
      "options": [
        {
          "label": "handle 1",
          "icon": null,
          "target": "565-01 Hardware 1",
          "id": "e37d5bd0-409f-4aa3-84a0-14311e7e879d"
        },
        {
          "label": "handle 2",
          "icon": null,
          "target": "565-01 Hardware 2",
          "id": "fe2042eb-837b-41ab-9eef-b8cf20c2a074"
        }
      ],
      "visibilityConfig": {
        "selectionType": 0,
        "dependsOn": []
      }
    }
  ]
};

// Usage example:
// const csvOutput = convertJsonToCsv(sampleData);
// console.log(csvOutput);
