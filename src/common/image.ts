const imageReqContext = require.context(
  "@/assets/images/cards-simple/",
  false,
  /\.png$/
);

const simpleImageReqContext = require.context(
  "@/assets/images/cards-simple/",
  false,
  /\.png$/
);

const buildImageMap = (reqContext: __WebpackModuleApi.RequireContext) => {
  const map = {} as { [key: string]: string };
  reqContext.keys().forEach((item) => {
    map[item.replace("./", "").replace(".png", "")] = reqContext(item).default;
  });
  return map;
};

const simpleImageMap = buildImageMap(simpleImageReqContext);
const imageMap = buildImageMap(imageReqContext);

export const cardNameToFilename = (cardName: CardName) =>
  cardName.replaceAll(/(\s|-|#|\.|'|,|&|\"|\(|\))/g, "");

export const getImage = (cardName: CardName) => {
  // filenames have no spaces or special characters
  const condensedKey = cardNameToFilename(cardName);
  if (!imageMap[condensedKey]) {
    throw new Error(`Could not find image with key: ${cardName}`);
  }
  return imageMap[condensedKey];
};

export const getSimpleImage = (cardName: CardName) => {
  // filenames have no spaces or special characters
  const condensedKey = cardNameToFilename(cardName);
  if (!simpleImageMap[condensedKey]) {
    throw new Error(`Could not find image with key: ${cardName}`);
  }
  return simpleImageMap[condensedKey];
};
