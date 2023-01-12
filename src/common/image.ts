const cardImageReqContext = require.context(
  "@/assets/images/cards/",
  false,
  /\.(jpg|png)$/
);
const referenceCardImageReqContext = require.context(
  "@/assets/images/cards-all/",
  false,
  /\.(jpg|png)$/
);
const alignmentImageReqContext = require.context(
  "@/assets/images/alignments/",
  false,
  /\.(jpg|png)$/
);
const typeImageReqContext = require.context(
  "@/assets/images/type/",
  false,
  /\.(jpg|png)$/
);
const overrideImageReqContext = require.context(
  "@/assets/images/cards-override/",
  false,
  /\.(jpg|png)$/
);

const buildImageMap = (reqContext: __WebpackModuleApi.RequireContext) => {
  const map = {} as { [key: string]: string };
  reqContext.keys().forEach((item) => {
    map[
      item
        .replace("./", "")
        .replace(".png", "")
        .replace(".jpg", "")
        .replace("-OW", "")
    ] = reqContext(item).default;
  });
  return map;
};

const animeImageMap = buildImageMap(cardImageReqContext);
const alignmentImageMap = buildImageMap(alignmentImageReqContext);
const typeImageMap = buildImageMap(typeImageReqContext);
const overrideImageMap = buildImageMap(overrideImageReqContext);
const referenceAnimeImageMap = buildImageMap(referenceCardImageReqContext);

export const cardNameToFilename = (cardName: string) =>
  cardName.replaceAll(/(\s|-|#|\.|'|,|&|\"|\(|\))/g, "");

export const getCardImage = (cardName: CardName) => {
  // filenames have no spaces or special characters
  const condensedKey = cardNameToFilename(cardName);
  if (!animeImageMap[condensedKey]) {
    throw new Error(`Could not find image with key: ${cardName}`);
  }
  return animeImageMap[condensedKey];
};

export const getAlignmentImage = (alignment: Alignment) => {
  // filenames have no spaces or special characters
  if (!alignmentImageMap[alignment]) {
    throw new Error(`Could not find image of alignment: ${alignment}`);
  }
  return alignmentImageMap[alignment];
};

export const getTypeImage = (type: CardType) => {
  // filenames have no spaces or special characters
  if (!typeImageMap[type]) {
    throw new Error(`Could not find image of type: ${type}`);
  }
  return typeImageMap[type];
};

export const getOverrideImage = (cardName: CardName) => {
  // filenames have no spaces or special characters
  const condensedKey = cardNameToFilename(cardName);
  if (!overrideImageMap[condensedKey]) {
    throw new Error(`Could not find image with key: ${condensedKey}`);
  }
  return overrideImageMap[condensedKey];
};

export const getReferenceAnimeImage = (code: number) => {
  // filenames have no spaces or special characters
  if (!referenceAnimeImageMap[code]) {
    throw new Error(`Could not find image with code: ${code}`);
  }
  return referenceAnimeImageMap[code];
};
