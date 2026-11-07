// "7 Nov 2026". The numeric form (11/7/2026) reads as 7 November or 11 July depending on the country, so it is never used.
export const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
