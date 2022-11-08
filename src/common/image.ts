const imageMap = (() => {
  const reqContext = require.context("../assets/images/cards/", false, /\.png$/);
  const map = {} as { [key: string]: string };
  reqContext.keys().forEach((item) => {
    map[item.replace("./", "").replace("-ROD-EU-VG.png", "")] =
      reqContext(item).default;
  });
  return map;
})();

export const getImage = (cardName: CardName) => {
  // filenames have no spaces or special characters
  const condensedKey = cardName.replace(/(\s|-|#|\.|'|,|&|\"|\(|\))/g, "");
  if (!imageMap[condensedKey]) {
    throw new Error(`Could not find image with key: ${cardName}`);
  }
  return imageMap[condensedKey];
};
