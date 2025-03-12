export const generatePrompt = (detail: "low" | "auto" | "high"): string => {
  const basePrompt = `You are an expert UI/UX designer with deep knowledge of design systems, color theory, typography, and user interface patterns. Analyze the uploaded image and create a detailed UI style guide based on what you see.

Extract the following elements:
- Color palette (primary, secondary, accent colors, with hex codes)
- Typography (font families, sizes, weights)
- UI components (buttons, inputs, cards, navigation)
- Spacing and layout principles
- Iconography style
- Overall visual aesthetic and mood

Format your response as a well-structured markdown document with sections for each design element. Include specific CSS values where possible.`;

  // Add detail level specifics
  let detailPrompt = "";
  
  switch (detail) {
    case "low":
      detailPrompt = "\n\nProvide a concise style guide with just the essential elements and colors.";
      break;
    case "high":
      detailPrompt = "\n\nProvide an extremely detailed style guide with comprehensive analysis of all visual elements, exact measurements, and detailed CSS implementation suggestions.";
      break;
    case "auto":
    default:
      detailPrompt = "\n\nProvide a balanced style guide with the most important elements and design principles.";
      break;
  }
  
  return basePrompt + detailPrompt;
};