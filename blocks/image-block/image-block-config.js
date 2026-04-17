/**
 * Image Block Field Configurations
 * Contains field mappings and configurations for the Image Block component
 */

export const IMAGE_BLOCK_FIELD_CONFIGS = {
  // Font size configurations
  descriptionFontSize: {
    field: "descriptionFontSize",
    pattern: /^description-fs-(.+)$/,
    prefix: "description-fs-",
    default: "16px",
    defaultFromField: true,
  },
};

/**
 * Combined Image Block configurations
 * Exports all field configurations for the Image Block component
 */
export const COMBINED_IMAGE_BLOCK_CONFIGS = {
  ...IMAGE_BLOCK_FIELD_CONFIGS,
};
