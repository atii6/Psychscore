import * as lodash from 'lodash';

// 1. COMPREHENSIVE mapping using snake_case placeholder names with aliases
export const standardizedMappings = {
  // Full Scale IQ variations
  full_scale: [
    "Full Scale IQ", "FSIQ", "Full-Scale", "Full Scale Intelligence Quotient", 
    "Full Scale IQ (FSIQ)", "Composite Score", "Full Scale", "Full-Scale IQ", "Composite"
  ],
  
  // General Ability Index variations
  general_ability: [
    "General Ability Index", "GAI", "General Ability Index (GAI)", "General Ability"
  ],
  
  // Cognitive Proficiency Index variations
  cognitive_proficiency: [
    "Cognitive Proficiency Index", "CPI", "Cognitive Proficiency Index (CPI)", 
    "Cognitive Proficiency"
  ],
  
  // Verbal Comprehension Index variations
  verbal_comprehension: [
    "Verbal Comprehension Index", "VCI", "Verbal Comprehension", 
    "Verbal Comprehension Index (VCI)"
  ],
  
  // Visual Spatial Index variations
  visual_spatial: [
    "Visual Spatial Index", "VSI", "Visual Spatial", "Visual Spatial Index (VSI)",
    "Perceptual Reasoning Index", "PRI", "Perceptual Reasoning", "Perceptual Reasoning Index (PRI)"
  ],
  
  // Fluid Reasoning Index variations
  fluid_reasoning: [
    "Fluid Reasoning Index", "FRI", "Fluid Reasoning", "Fluid Reasoning Index (FRI)"
  ],
  
  // Working Memory Index variations
  working_memory: [
    "Working Memory Index", "WMI", "Working Memory", "Working Memory Index (WMI)"
  ],
  
  // Processing Speed Index variations
  processing_speed: [
    "Processing Speed Index", "PSI", "Processing Speed", "Processing Speed Index (PSI)"
  ],
  
  // Nonmotor variations
  nonmotor: [
    "Nonmotor", "Non-motor", "Non Motor", "Nonmotor Index"
  ],
  
  // Verbal Comprehension Subtests
  similarities: ["Similarities", "SI", "Similarities (SI)"],
  vocabulary: ["Vocabulary", "VC", "Vocabulary (VC)"],
  information: ["Information", "IN", "Information (IN)"],
  comprehension: ["Comprehension", "CO", "Comprehension (CO)"],
  
  // Visual Spatial / Perceptual Reasoning Subtests
  block_design: ["Block Design", "BD", "Block Design (BD)"],
  visual_puzzles: ["Visual Puzzles", "VP", "Visual Puzzles (VP)"],
  picture_completion: ["Picture Completion", "PC", "Picture Completion (PC)"],
  
  // Fluid Reasoning Subtests
  matrix_reasoning: ["Matrix Reasoning", "MR", "Matrix Reasoning (MR)"],
  figure_weights: ["Figure Weights", "FW", "Figure Weights (FW)"],
  arithmetic: ["Arithmetic", "AR", "Arithmetic (AR)"],
  
  // Working Memory Subtests
  digit_span: ["Digit Span", "DS", "Digit Span (DS)"],
  digit_sequencing: ["Digit Sequencing", "DQ", "Digit Sequencing (DQ)"],
  letter_number_sequencing: ["Letter Number Sequencing", "LN", "Letter Number Sequencing (LN)"],
  running_digits: ["Running Digits", "RD", "Running Digits (RD)"],
  
  // Processing Speed Subtests
  symbol_search: ["Symbol Search", "SS", "Symbol Search (SS)"],
  coding: ["Coding", "CD", "Coding (CD)"],
  cancellation: ["Cancellation", "CA", "Cancellation (CA)"]
};

// 2. Enhanced normalization function for matching
export const normalizeForMatching = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric chars
    .trim();
};

// Pre-compute normalized mappings for ultra-fast lookups
const normalizedMap = new Map();
for (const [standardKey, terms] of Object.entries(standardizedMappings)) {
  for (const term of terms) {
    const normalized = normalizeForMatching(term);
    if (normalized) {
      normalizedMap.set(normalized, standardKey);
    }
  }
}

/**
 * Simple string similarity function (approximates fuzzy matching)
 * Returns a percentage similarity between two strings
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  // Simple character-based similarity
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }
  
  return (matches / longer.length) * 100;
};

/**
 * Ultra-flexible function to find standardized placeholder key for any subtest name
 * Uses multiple matching strategies including fuzzy matching at 85% similarity
 * @param {string} subtestName - Raw subtest name from extracted data
 * @returns {string|null} - Standardized snake_case key or null if no match
 */
export const findStandardizedKey = (subtestName) => {
  if (!subtestName) return null;
  
  const normalizedSubtest = normalizeForMatching(subtestName);
  if (!normalizedSubtest) return null;

  // Strategy 1: Direct exact match (highest confidence)
  if (normalizedMap.has(normalizedSubtest)) {
    return normalizedMap.get(normalizedSubtest);
  }
  
  // Strategy 2: Check if the subtest contains any of our known terms
  // This catches cases like "WAIS-V Verbal Comprehension Index" matching "verbal_comprehension"
  for (const [normalizedTerm, standardKey] of normalizedMap.entries()) {
    if (normalizedTerm.length > 2 && normalizedSubtest.includes(normalizedTerm)) {
      return standardKey;
    }
  }
  
  // Strategy 3: Check if any of our known terms contain the subtest
  // This catches abbreviated forms or partial names
  for (const [normalizedTerm, standardKey] of normalizedMap.entries()) {
    if (normalizedTerm.length > 2 && normalizedTerm.includes(normalizedSubtest)) {
      return standardKey;
    }
  }
  
  // Strategy 4: Fuzzy matching with 85% similarity threshold
  let bestMatch = null;
  let bestSimilarity = 0;
  
  for (const [normalizedTerm, standardKey] of normalizedMap.entries()) {
    if (normalizedTerm.length > 2) {
      const similarity = calculateSimilarity(normalizedSubtest, normalizedTerm);
      if (similarity >= 85 && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = standardKey;
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  // Strategy 5: Word-based matching for multi-word terms
  // Split both the subtest and our terms into words and check for significant overlap
  const subtestWords = subtestName.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  if (subtestWords.length > 0) {
    for (const [standardKey, terms] of Object.entries(standardizedMappings)) {
      for (const term of terms) {
        const termWords = term.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        // If we have significant word overlap, consider it a match
        const overlap = subtestWords.filter(word => 
          termWords.some(termWord => 
            termWord.includes(word) || word.includes(termWord)
          )
        ).length;
        
        // Require at least half the words to overlap for a match
        if (overlap > 0 && overlap >= Math.min(subtestWords.length, termWords.length) * 0.5) {
          return standardKey;
        }
      }
    }
  }
  
  // No standardized match found - return null to trigger fallback cleaning
  return null;
};

/**
 * Fallback cleaning function for subtests not in our standardized mapping
 * Creates a reasonable snake_case placeholder key from any subtest name
 * @param {string} subtestName - Raw subtest name
 * @returns {string} - Clean snake_case placeholder key
 */
export const createFallbackKey = (subtestName) => {
  if (!subtestName) return '';
  
  return subtestName
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and contents
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .trim();
};