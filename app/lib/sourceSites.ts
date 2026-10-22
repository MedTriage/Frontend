/* ── Where the evidence comes from. ──
 *
 * Real institutions at their real headquarters. The globe in the About hero draws
 * an arc from each to HUB, which is not an institution — it is where the question
 * was asked, so the arcs converge on the reader rather than on a building.
 *
 * `short` is what gets burned onto the sphere; `name` and `src` are what the
 * readout panel says, and what a screen reader gets from the list in the hero.
 * They are separate fields rather than a split on the em dash so a body whose
 * name happens to contain one cannot silently truncate.
 *
 * `logo` is the institution's own mark, pulled from its site and served from
 * /public/logos rather than hotlinked — so the page makes no third-party request
 * and works offline. Five bodies publish nothing usable at favicon size; those
 * fall back to `mono`, a monogram set in the house mono face.
 *
 * Worth stating plainly, since it is a decision and not an accident: these are
 * registered trademarks, shown here to identify the bodies whose guidance the
 * system reads. That is nominative use, not endorsement — none of these
 * institutions has endorsed MedTriage. If this is ever published, that line needs
 * checking against each body's mark policy.
 *
 * Coordinates are decimal degrees, longitude first — d3's order.
 */

export interface Site {
  /** Full name, as the readout says it. */
  name: string;
  /** What this body supplies. */
  src: string;
  /** The label drawn on the sphere. Kept to a few characters. */
  short: string;
  /** The institution's own domain — where its mark came from. Absent on HUB,
   *  which is a place rather than a body. */
  domain?: string;
  /** Filename under /public/logos. Absent where no usable mark could be found,
   *  in which case the readout falls back to the monogram. */
  logo?: string;
  /** Monogram for the readout tile, and the fallback when `logo` is absent.
   *  Five characters is the practical ceiling at the tile's size. */
  mono: string;
  lon: number;
  lat: number;
}

/** Not a source. Where the answer is reconciled — the reader's own location. */
export const HUB: Site = {
  name: "Your consultation",
  src: "Reconciled here",
  short: "You",
  mono: "MT",
  lon: -0.13,
  lat: 51.51,
};

export const SITES: Site[] = [
  // ── WHO and its regional offices ──
  { name: "WHO — Geneva", src: "Essential medicines list", short: "WHO", domain: "who.int", logo: "who.png", mono: "WHO", lon: 6.14, lat: 46.2 },
  { name: "WHO EURO — Copenhagen", src: "European regional guidance", short: "EURO", domain: "who.int", logo: "euro.png", mono: "EURO", lon: 12.57, lat: 55.68 },
  { name: "WHO AFRO — Brazzaville", src: "African regional guidance", short: "AFRO", domain: "afro.who.int", logo: "afro.png", mono: "AFRO", lon: 15.28, lat: -4.27 },
  { name: "WHO SEARO — New Delhi", src: "South-East Asia guidance", short: "SEARO", domain: "who.int", logo: "searo.png", mono: "SEAR", lon: 77.19, lat: 28.6 },
  { name: "WHO WPRO — Manila", src: "Western Pacific guidance", short: "WPRO", domain: "who.int", logo: "wpro.png", mono: "WPRO", lon: 120.98, lat: 14.6 },
  { name: "WHO EMRO — Cairo", src: "Eastern Mediterranean guidance", short: "EMRO", domain: "emro.who.int", mono: "EMRO", lon: 31.24, lat: 30.04 },
  { name: "PAHO — Washington", src: "Americas regional guidance", short: "PAHO", domain: "paho.org", logo: "paho.png", mono: "PAHO", lon: -77.04, lat: 38.9 },

  // ── United States ──
  { name: "FDA — Silver Spring", src: "Drug labelling · DailyMed", short: "FDA", domain: "fda.gov", logo: "fda.png", mono: "FDA", lon: -77.03, lat: 39.0 },
  { name: "PubMed — Bethesda", src: "Literature · NLM", short: "PubMed", domain: "nlm.nih.gov", logo: "pubmed.png", mono: "NLM", lon: -77.1, lat: 38.98 },
  { name: "CDC — Atlanta", src: "Surveillance and prevention", short: "CDC", domain: "cdc.gov", logo: "cdc.png", mono: "CDC", lon: -84.39, lat: 33.75 },
  { name: "IHME — Seattle", src: "Global burden of disease", short: "IHME", domain: "healthdata.org", logo: "ihme.png", mono: "IHME", lon: -122.33, lat: 47.61 },

  // ── United Kingdom and Ireland ──
  { name: "NICE — London", src: "Clinical guidelines", short: "NICE", domain: "nice.org.uk", logo: "nice.png", mono: "NICE", lon: -0.13, lat: 51.51 },
  { name: "MHRA — London", src: "UK drug labelling", short: "MHRA", domain: "gov.uk", logo: "mhra.png", mono: "MHRA", lon: -0.017, lat: 51.505 },
  { name: "Cochrane — London", src: "Systematic reviews", short: "Cochrane", domain: "cochrane.org", logo: "cochrane.png", mono: "COCH", lon: -0.09, lat: 51.53 },
  { name: "SIGN — Edinburgh", src: "Scottish clinical guidelines", short: "SIGN", domain: "sign.ac.uk", mono: "SIGN", lon: -3.19, lat: 55.95 },

  // ── Europe ──
  { name: "EMA — Amsterdam", src: "European drug labelling", short: "EMA", domain: "ema.europa.eu", logo: "ema.png", mono: "EMA", lon: 4.9, lat: 52.37 },
  { name: "ECDC — Stockholm", src: "Disease control guidance", short: "ECDC", domain: "ecdc.europa.eu", logo: "ecdc.png", mono: "ECDC", lon: 18.07, lat: 59.33 },
  { name: "HAS — Paris", src: "French health authority", short: "HAS", domain: "has-sante.fr", logo: "has.png", mono: "HAS", lon: 2.36, lat: 48.94 },
  { name: "BfArM — Bonn", src: "German medicines authority", short: "BfArM", domain: "bfarm.de", logo: "bfarm.png", mono: "BFRM", lon: 7.1, lat: 50.73 },
  { name: "IQWiG — Cologne", src: "Quality and efficiency review", short: "IQWiG", domain: "iqwig.de", logo: "iqwig.png", mono: "IQWG", lon: 6.96, lat: 50.94 },
  { name: "AIFA — Rome", src: "Italian medicines agency", short: "AIFA", domain: "aifa.gov.it", logo: "aifa.png", mono: "AIFA", lon: 12.5, lat: 41.9 },
  { name: "Swissmedic — Bern", src: "Swiss therapeutic products", short: "Swissmedic", domain: "swissmedic.ch", mono: "SWMD", lon: 7.45, lat: 46.95 },
  { name: "KCE — Brussels", src: "Belgian health knowledge centre", short: "KCE", domain: "kce.fgov.be", mono: "KCE", lon: 4.35, lat: 50.85 },
  { name: "NIPH — Oslo", src: "Norwegian public health", short: "NIPH", domain: "fhi.no", logo: "niph.png", mono: "NIPH", lon: 10.75, lat: 59.91 },

  // ── Asia ──
  { name: "ICMR — New Delhi", src: "Indian medical research", short: "ICMR", domain: "icmr.gov.in", logo: "icmr.png", mono: "ICMR", lon: 77.21, lat: 28.63 },
  { name: "CDSCO — New Delhi", src: "Indian drug control", short: "CDSCO", domain: "cdsco.gov.in", mono: "CDSC", lon: 77.23, lat: 28.58 },
  { name: "PMDA — Tokyo", src: "Japanese drug labelling", short: "PMDA", domain: "pmda.go.jp", logo: "pmda.png", mono: "PMDA", lon: 139.65, lat: 35.68 },
  { name: "NMPA — Beijing", src: "Chinese drug administration", short: "NMPA", domain: "nmpa.gov.cn", logo: "nmpa.png", mono: "NMPA", lon: 116.41, lat: 39.9 },
  { name: "MFDS — Cheongju", src: "Korean drug safety", short: "MFDS", domain: "mfds.go.kr", logo: "mfds.png", mono: "MFDS", lon: 127.49, lat: 36.64 },
  { name: "HSA — Singapore", src: "Health sciences authority", short: "HSA", domain: "hsa.gov.sg", logo: "hsa.png", mono: "HSA", lon: 103.82, lat: 1.35 },

  // ── Oceania ──
  { name: "TGA — Canberra", src: "Therapeutic goods labelling", short: "TGA", domain: "tga.gov.au", logo: "tga.png", mono: "TGA", lon: 149.13, lat: -35.28 },
  { name: "NHMRC — Canberra", src: "Clinical practice guidance", short: "NHMRC", domain: "nhmrc.gov.au", logo: "nhmrc.png", mono: "NHMR", lon: 149.11, lat: -35.25 },
  { name: "Medsafe — Wellington", src: "New Zealand medicines safety", short: "Medsafe", domain: "medsafe.govt.nz", logo: "medsafe.png", mono: "MSFE", lon: 174.78, lat: -41.29 },

  // ── Americas ──
  { name: "Health Canada — Ottawa", src: "Canadian drug labelling", short: "Health Canada", domain: "canada.ca", logo: "health-canada.png", mono: "HC", lon: -75.7, lat: 45.42 },
  { name: "CADTH — Ottawa", src: "Health technology assessment", short: "CADTH", domain: "cda-amc.ca", logo: "cadth.png", mono: "CADT", lon: -75.68, lat: 45.4 },
  { name: "ANVISA — Brasília", src: "Brazilian health surveillance", short: "ANVISA", domain: "gov.br", logo: "anvisa.png", mono: "ANVS", lon: -47.88, lat: -15.79 },
  { name: "COFEPRIS — Mexico City", src: "Mexican health protection", short: "COFEPRIS", domain: "gob.mx", logo: "cofepris.png", mono: "COFE", lon: -99.13, lat: 19.43 },

  // ── Africa ──
  { name: "Africa CDC — Addis Ababa", src: "Continental disease control", short: "Africa CDC", domain: "africacdc.org", logo: "africa-cdc.png", mono: "ACDC", lon: 38.76, lat: 9.03 },
  { name: "SAHPRA — Pretoria", src: "South African regulator", short: "SAHPRA", domain: "sahpra.org.za", logo: "sahpra.png", mono: "SAHP", lon: 28.19, lat: -25.75 },
];
