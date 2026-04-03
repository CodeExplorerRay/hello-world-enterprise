function parseModelJsonResponse(text) {
  const trimmed = String(text || "").trim();

  try {
    return JSON.parse(trimmed);
  } catch (directParseError) {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

    try {
      return JSON.parse(candidate);
    } catch (fencedParseError) {
      const objectStart = candidate.indexOf("{");
      const objectEnd = candidate.lastIndexOf("}");

      if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
        return JSON.parse(candidate.slice(objectStart, objectEnd + 1));
      }

      throw fencedParseError;
    }
  }
}

module.exports = {
  parseModelJsonResponse,
};
