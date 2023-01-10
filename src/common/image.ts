const imageReqContext = require.context(
  "@/assets/images/cards-simple/",
  false,
  /\.(jpg|png)$/
);
const simpleImageReqContext = require.context(
  "@/assets/images/cards-simple/",
  false,
  /\.(jpg|png)$/
);
const animeImageReqContext = require.context(
  "@/assets/images/cards-anime/",
  false,
  /\.(jpg|png)$/
);
const referenceAnimeImageReqContext = require.context(
  "@/assets/images/cards-anime-all/",
  false,
  /\.(jpg|png)$/
);
const alignmentImageReqContext = require.context(
  "@/assets/images/alignments/",
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

const simpleImageMap = buildImageMap(simpleImageReqContext);
const imageMap = buildImageMap(imageReqContext);
const animeImageMap = buildImageMap(animeImageReqContext);
const alignmentImageMap = buildImageMap(alignmentImageReqContext);
const overrideImageMap = buildImageMap(overrideImageReqContext);
const referenceAnimeImageMap = buildImageMap(referenceAnimeImageReqContext);

export const cardNameToFilename = (cardName: string) =>
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

export const getAnimeImage = (cardName: CardName) => {
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
    throw new Error(`Could not find alignment image with key: ${alignment}`);
  }
  return alignmentImageMap[alignment];
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
