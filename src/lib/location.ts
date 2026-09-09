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
  for (const [needles, flag] of LOCATION_FLAGS) {
    if (needles.some((needle) => normalized.includes(needle))) return flag;
  }
  return "📍";
}
