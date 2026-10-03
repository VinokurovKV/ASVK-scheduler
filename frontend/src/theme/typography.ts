import montserratCyrillicUrl from "@fontsource-variable/montserrat/files/montserrat-cyrillic-wght-normal.woff2?url";
import montserratLatinUrl from "@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2?url";
import robotoCondensedCyrillicUrl from "@fontsource-variable/roboto-condensed/files/roboto-condensed-cyrillic-wght-normal.woff2?url";
import robotoCondensedLatinUrl from "@fontsource-variable/roboto-condensed/files/roboto-condensed-latin-wght-normal.woff2?url";

const classicFallback = "Arial, Helvetica, sans-serif";

const cyrillicRange =
  "U+0400-052F, U+1C80-1C8F, U+2DE0-2DFF, U+A640-A69F";
const latinRange =
  "U+0000-024F, U+1E00-1EFF, U+2000-206F, U+20A0-20CF, U+2100-214F";

export const fontFamilies = {
  body: `"Montserrat Variable", "Montserrat", ${classicFallback}`,
  display: `"Montserrat Variable", "Montserrat", ${classicFallback}`,
  condensed: `"Roboto Condensed Variable", "Roboto Condensed", ${classicFallback}`,
} as const;

export const variableFontFaces = `
  @font-face {
    font-family: "Montserrat Variable";
    src: url("${montserratCyrillicUrl}") format("woff2-variations");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    unicode-range: ${cyrillicRange};
  }

  @font-face {
    font-family: "Montserrat Variable";
    src: url("${montserratLatinUrl}") format("woff2-variations");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    unicode-range: ${latinRange};
  }

  @font-face {
    font-family: "Roboto Condensed Variable";
    src: url("${robotoCondensedCyrillicUrl}") format("woff2-variations");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    unicode-range: ${cyrillicRange};
  }

  @font-face {
    font-family: "Roboto Condensed Variable";
    src: url("${robotoCondensedLatinUrl}") format("woff2-variations");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    unicode-range: ${latinRange};
  }
`;

export const appTypography = {
  fontFamily: fontFamilies.body,

  h1: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
  },
  h5: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
  },
  h6: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
  },

  caption: {
    fontFamily: fontFamilies.condensed,
  },
  overline: {
    fontFamily: fontFamilies.condensed,
  },
} as const;
