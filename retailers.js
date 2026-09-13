// Where "Shop this room" sends people.
//
// Amazon just needs your Associates tag. Home Depot and Wayfair run through
// Impact Radius, which gives you a tracking link rather than a simple tag —
// paste that link into the matching environment variable, putting {url} where
// the destination goes. For example:
//   HOME_DEPOT_LINK=https://homedepot.sjv.io/c/1234567/890123/4567?u={url}
// Leave a variable empty and that shop simply doesn't appear.

const SHOPS = [
  {
    id: "amazon",
    label: "Amazon",
    search: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    wrap: (url) => {
      const tag = process.env.AMAZON_AFFILIATE_TAG;
      return tag ? `${url}&tag=${tag}` : url;
    },
    enabled: () => !!process.env.AMAZON_AFFILIATE_TAG,
  },
  {
    id: "homedepot",
    label: "Home Depot",
    search: (q) => `https://www.homedepot.com/s/${encodeURIComponent(q)}`,
    wrap: (url) => {
      const tpl = process.env.HOME_DEPOT_LINK;
      return tpl ? tpl.replace("{url}", encodeURIComponent(url)) : url;
    },
    enabled: () => !!process.env.HOME_DEPOT_LINK,
  },
  {
    id: "wayfair",
    label: "Wayfair",
    search: (q) => `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(q)}`,
    wrap: (url) => {
      const tpl = process.env.WAYFAIR_LINK;
      return tpl ? tpl.replace("{url}", encodeURIComponent(url)) : url;
    },
    enabled: () => !!process.env.WAYFAIR_LINK,
  },
];

// Always give people somewhere to go, even before any affiliate account exists.
export function shopLinks(query) {
  const live = SHOPS.filter((s) => s.enabled());
  const use = live.length ? live : [SHOPS[0]];
  return use.map((s) => ({ id: s.id, label: s.label, url: s.wrap(s.search(query)) }));
}
