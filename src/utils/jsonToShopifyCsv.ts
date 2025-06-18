
interface OptionsConfig {
  handle?: string;
  title?: string;
  vendor?: string;
  productCategory?: string;
  tags?: string;
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

export function jsonToShopifyCsv(json: JsonData, options: OptionsConfig = {}): string {
  // Default values for CSV fields not present in JSON
  const defaultValues = {
    handle: options.handle || "custom-product",
    title: options.title || "Custom Product",
    bodyHtml: "<p></p>",
    vendor: options.vendor || "Delta's Integration",
    productCategory: options.productCategory || "Furniture > Office Furniture > Workspace Tables",
    type: "",
    tags: options.tags || options.handle || "custom-product",
    published: "TRUE",
    variantSku: "0",
    variantGrams: "0",
    variantInventoryTracker: "shopify",
    variantInventoryQty: "10",
    variantInventoryPolicy: "deny",
    variantFulfillmentService: "manual",
    variantPrice: "3000",
    variantCompareAtPrice: "",
    variantRequiresShipping: "TRUE",
    variantTaxable: "TRUE",
    variantBarcode: "",
    giftCard: "FALSE",
    seoTitle: "",
    seoDescription: "",
    googleProductCategory: "",
    googleGender: "",
    googleAgeGroup: "",
    googleMpn: "",
    googleCondition: "",
    googleCustomProduct: "",
    googleCustomLabel0: "",
    googleCustomLabel1: "",
    googleCustomLabel2: "",
    googleCustomLabel3: "",
    googleCustomLabel4: "",
    variantImage: "",
    variantWeightUnit: "kg",
    variantTaxCode: "",
    costPerItem: "",
    status: "active"
  };

  // Shopify CSV headers
  const csvHeaders = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option1 Linked To", "Option2 Name", "Option2 Value", "Option2 Linked To",
    "Option3 Name", "Option3 Value", "Option3 Linked To", "Variant SKU", "Variant Grams",
    "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy", "Variant Fulfillment Service",
    "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable", "Variant Barcode",
    "Image Src", "Image Position", "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
    "Google Shopping / MPN", "Google Shopping / Condition", "Google Shopping / Custom Product",
    "Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1", "Google Shopping / Custom Label 2",
    "Google Shopping / Custom Label 3", "Google Shopping / Custom Label 4", "Variant Image", "Variant Weight Unit",
    "Variant Tax Code", "Cost per item", "Status"
  ];

  // Function to escape CSV values
  function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return "";
    const strValue = String(value);
    if (strValue.includes(",") || strValue.includes("\"") || strValue.includes("\n")) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  }

  // Extract option groups from JSON
  const optionGroups = json.menuUI.map(group => ({
    name: group.label.toLowerCase().replace(/\s+/g, "_"), // Convert label to snake_case for OptionX Name
    values: group.type === "material" ? group.options[0]?.baseMaps || [] : group.options,
    isMaterial: group.type === "material"
  }));

  // Ensure up to 3 option groups for Shopify compatibility
  const validOptionGroups = optionGroups.slice(0, 3);

  // Get all possible variant combinations
  const combinations: any[] = [];

  function generateCombinations(groups: any[], index = 0, current: any[] = []) {
    if (index === groups.length) {
      combinations.push([...current]);
      return;
    }
    const group = groups[index];
    group.values.forEach((value: any) => {
      current.push({ groupName: group.name, value: value.label, icon: value.icon || null });
      generateCombinations(groups, index + 1, current);
      current.pop();
    });
  }

  generateCombinations(validOptionGroups);

  // Generate CSV rows
  const rows: string[][] = [];
  let imagePosition = 1;
  const processedFinishes = new Set<string>();

  combinations.forEach((combo, index) => {
    const row = new Array(csvHeaders.length).fill("");
    const isFirstForFinish = combo[0]?.groupName === "variant_change" && !processedFinishes.has(combo[0].value);

    // Product-level fields (only for first variant or first variant of a new finish)
    if (index === 0 || isFirstForFinish) {
      row[0] = defaultValues.handle; // Handle
      row[1] = defaultValues.title; // Title
      row[2] = defaultValues.bodyHtml; // Body (HTML)
      row[3] = defaultValues.vendor; // Vendor
      row[4] = defaultValues.productCategory; // Product Category
      row[5] = defaultValues.type; // Type
      row[6] = defaultValues.tags; // Tags
      row[7] = defaultValues.published; // Published
    } else {
      row[0] = defaultValues.handle; // Handle (required for all rows)
      row[7] = defaultValues.published; // Published
    }

    // Variant option fields
    combo.forEach((option: any, i: number) => {
      if (i < 3) { // Shopify supports up to 3 options
        row[8 + i * 3] = validOptionGroups[i]?.name || ""; // OptionX Name
        row[9 + i * 3] = option.value; // OptionX Value
        row[10 + i * 3] = ""; // OptionX Linked To
      }
    });

    // Variant details
    row[17] = defaultValues.variantSku; // Variant SKU
    row[18] = defaultValues.variantGrams; // Variant Grams
    row[19] = defaultValues.variantInventoryTracker; // Variant Inventory Tracker
    row[20] = defaultValues.variantInventoryQty; // Variant Inventory Qty
    row[21] = defaultValues.variantInventoryPolicy; // Variant Inventory Policy
    row[22] = defaultValues.variantFulfillmentService; // Variant Fulfillment Service
    row[23] = defaultValues.variantPrice; // Variant Price
    row[24] = defaultValues.variantCompareAtPrice; // Variant Compare At Price
    row[25] = defaultValues.variantRequiresShipping; // Variant Requires Shipping
    row[26] = defaultValues.variantTaxable; // Variant Taxable
    row[27] = defaultValues.variantBarcode; // Variant Barcode
    row[31] = defaultValues.giftCard; // Gift Card
    row[45] = defaultValues.variantImage; // Variant Image
    row[46] = defaultValues.variantWeightUnit; // Variant Weight Unit
    row[47] = defaultValues.variantTaxCode; // Variant Tax Code
    row[48] = defaultValues.costPerItem; // Cost per item
    row[49] = defaultValues.status; // Status

    // Image fields for material group (variant_change)
    if (isFirstForFinish && combo[0]?.groupName === "variant_change") {
      row[28] = combo[0].icon; // Image Src
      row[29] = imagePosition++; // Image Position
      row[30] = `${defaultValues.title} - ${combo[0].value}`; // Image Alt Text
      processedFinishes.add(combo[0].value);
    }

    rows.push(row);
  });

  // Convert rows to CSV string
  const csvRows = [csvHeaders.map(escapeCsvValue).join(",")];
  rows.forEach(row => csvRows.push(row.map(escapeCsvValue).join(",")));
  return csvRows.join("\n");
}
