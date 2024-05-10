export const enum EffectDialogueTag {
  CurrentZone = "[CurrentZone]",
  TargetZone = "[TargetZone]",
  OriginZone = "[OriginZone]",
}

export enum CardTextPrefix {
  Manual = `${EffectDialogueTag.CurrentZone} was activated.\n`,
  Sacrifice = `${EffectDialogueTag.CurrentZone} was activated and sent to the graveyard.\n`,
  Auto = `${EffectDialogueTag.CurrentZone}'s effect:\n`,
  AutoGraveyard = `${EffectDialogueTag.CurrentZone}'s effect in the graveyard:\n`,
  Trap = `The trap was ${EffectDialogueTag.CurrentZone}:\n`,
  SpiritMessage = "Spirit Message effect:\n",
}

// TODO: enums
const generalDialogue = [
  // turn slogans
  "It's [name]'s turn.", // player
  "It's my turn.", // generic AI placeholder?
  "In darkness I find strength!", // PaniK
  "My turn!", // Mako/Mai/Rex
  "Hyohyohyo.\nIt's my turn!", // Weevil
  "Are you enjoying my show?", // Arkana
  "Hihihi...\nMy turn!", // Bonz
  "My turn it is!", // Dox
  "Pipipi...\nIt's my turn", // Espa
  "Gawry Nida.", // Chevaliers
  "My turn.", // Kaiba
  "It's my turn!", // Pegasus
  "...", // Reshef

  // assorted
  "Swords of Revealing Light remains in effect...", // TODO: should show number of turns remaining?
  "The opponent could not draw a card from the deck.",
  'The "FINAL" message formed on the field!',

  // victory
  "The opponent is out of LP!",
  "Duel victory!",
  "Your deck capacity increased by [X]!",
  "[X] Domino was obtained.",
  "[Card] was obtained!",

  // loss
  "[Player name] is out of LP!",
  "Lost the duel...",
];
