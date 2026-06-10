export const calculateRisk = async (text, author, productId) => {
  let riskScore = 0;
  const flags = [];

  const bannedWords = ["buy now", "click here", "spam", "scam", "free money","fraud","Free trial","Full refund"];
  if (bannedWords.some(word => text.toLowerCase().includes(word))) {
    riskScore += 20;
    flags.push("Contains banned or spam words");
  }

  const upperCaseChars = (text.match(/[A-Z]/g) || []).length;
  if (text.length > 0 && upperCaseChars / text.length > 0.4) {
    riskScore += 15;
    flags.push("Excessive uppercase characters");
  }

  if (/[!?.]{2,}/.test(text)) {
    riskScore += 15;
    flags.push("Multiple exclamation or question marks used");
  }

  if (text.trim().length < 10) {
    riskScore += 30;
    flags.push("Review text is too short or meaningless");
  }

  if (/(.)\1{3,}/.test(text)) {
    riskScore += 10;
    flags.push("Contains repeated or elongated characters");
  }

  return Math.min(Math.max(riskScore, 0), 100);
};