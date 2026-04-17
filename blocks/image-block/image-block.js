import ImageBlock, {
  ImageBlockContract,
} from "../../../platform-blocks/image-block/image-block.min.js";
import { getFirstElement } from "../../../platform-blocks/utils/dom-utils.min.js";
import { createOptimizedPicture, decorateIcon } from "../../scripts/aem.js";
import { moveAttributes, moveInstrumentation } from "../../scripts/scripts.js";
import { COMBINED_IMAGE_BLOCK_CONFIGS } from "./image-block-config.js";

function parseBlockData(block, ImageBlockContract, getFirstElement) {
  if (!block) return {};

  const children = [...(block?.children || [])];
  const [
    imageElement,
    mobileImageElement,
    descriptionElement,
    squareEdgesElement,
    fullWidthElement,
  ] = children;

  // Helper function to safely get text content
  const getTrimmedText = (el) => {
    const text = el?.textContent?.trim() || "";
    if (el) el.textContent = "";
    return text;
  };

  // Helper function to get text content without clearing
  const getTextContent = (el) => el?.textContent?.trim() || "";

  // Parse image elements using utility functions
  const mainImageElem = getFirstElement(imageElement, "img");

  // Determine mobile image container
  const isImagePresent = mobileImageElement?.querySelector("img");
  const mobileImageContainer = isImagePresent
    ? mobileImageElement
    : imageElement;
  const finalMobileImageElem = getFirstElement(mobileImageContainer, "img");

  // Parse description content
  const descElement = descriptionElement?.children?.[0]?.children;
  const [_, ...rest] = Array.from(descElement || []);
  const descDiv = document.createElement("div");

  rest?.forEach((item) => {
    const isHTMLAvailable = item?.innerHTML;
    if (isHTMLAvailable) descDiv.appendChild(item.cloneNode(true));
  });

  // Content data
  const contentData = {
    image: mainImageElem?.src || "",
    imageAlt: mainImageElem?.alt || "",
    mobileImage: finalMobileImageElem?.src || "",
    mobileImageAlt: finalMobileImageElem?.alt || "",
    labelText: getTextContent(descElement?.[0]),
    descriptionElement: descDiv,
    squareEdges: getTrimmedText(squareEdgesElement) || "false",
    fullWidth: getTrimmedText(fullWidthElement) || "false",
  };

  // Create ImageBlockContract instance and populate properties
  const imageBlockObj = new ImageBlockContract();
  imageBlockObj.componentName = "Image Block";
  imageBlockObj.image = mainImageElem?.src || "";
  imageBlockObj.imageAlt = mainImageElem?.alt || "";
  imageBlockObj.mobileImage = finalMobileImageElem?.src || "";
  imageBlockObj.mobileImageAlt = finalMobileImageElem?.alt || "";
  imageBlockObj.labelText = getTextContent(descElement?.[0]);
  imageBlockObj.descriptionElement = descDiv;
  imageBlockObj.squareEdges = getTrimmedText(squareEdgesElement) || "false";

  const parsedData = {
    content: contentData,
    elements: {
      imageElement,
      mobileImageElement,
      descriptionElement,
      squareEdgesElement,
      fullWidthElement,
    },
  };

  return { parsedData, imageBlockObj };
}

export default async function decorate(block) {
  try {
    // Parse block data in EDS layer
    const { parsedData, imageBlockObj } = parseBlockData(
      block,
      ImageBlockContract,
      getFirstElement,
    );

    // Initialize the component
    const imageBlock = new ImageBlock(block, {
      createOptimizedPicture,
      moveInstrumentation,
      moveAttributes,
      decorateIcon,
      componentName: "Image Block",
      enableAccessibility: true,
      fieldConfigs: Object.values(COMBINED_IMAGE_BLOCK_CONFIGS),
      parsedData,
      imageBlockObj,
    });

    imageBlock.init();

    // Apply full-width class to block if enabled
    const fullWidth = parsedData?.content?.fullWidth === "true";
    if (fullWidth) {
      block.classList.add("image-full-width");
    }

    // Apply enable-square-edges class to block if enabled
    const squareEdges = parsedData?.content?.squareEdges === "true";
    if (squareEdges) {
      block.classList.add("enable-square-edges");
    }
  } catch (error) {
    console.error("Error loading image-block:", error);
  }
}
