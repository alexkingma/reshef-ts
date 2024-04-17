const cardImageGlob = import.meta.glob("@/assets/images/cards/*.{png,jpg}");
const referenceCardImageGlob = import.meta.glob(
  "@/assets/images/cards-all/*.{png,jpg}"
);
const alignmentImageGlob = import.meta.glob(
  "@/assets/images/alignments/*.{png,jpg}"
);
const typeImageGlob = import.meta.glob("@/assets/images/type/*.{png,jpg}");
const overrideImageGlob = import.meta.glob(
  "@/assets/images/cards-override/*.{png,jpg}"
);

const buildImageMap = (glob: Record<string, () => Promise<unknown>>) => {
  const map = {} as { [key: string]: string };
  for (const path in glob) {
    const filename = path.split("/").pop()!;
    map[
      filename
        .replace("./", "")
        .replace(".png", "")
        .replace(".jpg", "")
        .replace("-OW", "")
    ] = new URL(path, import.meta.url).href;
  }
  return map;
};

const animeImageMap = buildImageMap(cardImageGlob);
const alignmentImageMap = buildImageMap(alignmentImageGlob);
const typeImageMap = buildImageMap(typeImageGlob);
const overrideImageMap = buildImageMap(overrideImageGlob);
const referenceAnimeImageMap = buildImageMap(referenceCardImageGlob);

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
