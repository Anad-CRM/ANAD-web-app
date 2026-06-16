
export function extractVariableIndices(text: string): number[] {
  const matches = text.match(/{{(d+)}}/g) || [];
  return Array.from(new Set(matches.map(m => parseInt(m.replace(/[{}]/g, '')))));
}
