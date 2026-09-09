const LOCATION_FLAGS: Array<[string[], string]> = [
  [["ireland", "dublin", "sligo", "cork", "galway"], "🇮🇪"],
  [["kenya", "nairobi", "mombasa"], "🇰🇪"],
  [["france", "paris", "lyon"], "🇫🇷"],
  [["germany", "berlin", "munich", "münchen", "hamburg"], "🇩🇪"],
  [["canada", "toronto", "montreal", "vancouver"], "🇨🇦"],
  [["united states", "usa", "us", "new york", "california", "texas"], "🇺🇸"],
  [["united kingdom", "uk", "london", "england", "scotland"], "🇬🇧"],
  [["spain", "madrid", "barcelona"], "🇪🇸"],
  [["netherlands", "amsterdam"], "🇳🇱"],
  [["europe"], "🇪🇺"],
  [["worldwide", "anywhere", "remote"], "🌍"],
];

export function locationFlag(value: string | null | undefined) {
  const normalized = (value ?? "").toLowerCase();
  const matches = LOCATION_FLAGS.filter(([needles]) => needles.some((needle) => normalized.includes(needle)));
  const countryMatches = matches.filter(([needles]) => !needles.includes("worldwide") && !needles.includes("europe"));
  if (countryMatches.length > 1) return "🌍";
  if (matches.length > 0) return matches[0][1];
  return "📍";
}
