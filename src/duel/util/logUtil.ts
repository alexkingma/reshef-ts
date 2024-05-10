import { EffectDialogueTag as Tag } from "../enums/dialogue";
import { getCard } from "./cardUtil";
import { getColor } from "./common";
import { getOriginZone, getTargetZone, getZone } from "./zoneUtil";

export const logEffectMessage = (
  state: Duel,
  coords: ZoneCoords,
  text: string
) => {
  const z = getZone(state, coords);
  const { category, name } = getCard(z.id);
  text = text.replace(Tag.CurrentZone, name);

  try {
    // if the effect was targeting a card -- e.g. Elegant Egotist
    const targetZone = getTargetZone(state);
    const { name } = getCard(targetZone.id);
    text = text.replace(Tag.TargetZone, name);
  } catch (e) {}

  try {
    // if the effect was triggered by an action with another card -- e.g. most traps
    const originZone = getOriginZone(state);
    const { name } = getCard(originZone.id);
    text = text.replace(Tag.OriginZone, name);
  } catch (e) {}

  // TODO: make a chat log component to record/display
  // duel activity instead of relying on console
  console.log(`%c${text}`, `color: ${getColor(category)};`);
};
