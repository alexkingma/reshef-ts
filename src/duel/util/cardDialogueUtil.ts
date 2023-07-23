import {
  CounterAttackTrap,
  CounterSpellTrap,
  DirectSpell,
  FlipEffectMonster,
  GraveyardEffectMonster,
  HandEffectMonster,
  Monster,
  PermAutoEffectMonster,
  PerpetualSpellTrap,
  Spell,
  TempPowerUpMonster,
  Trap,
} from "../common";

type DialogueMap<K extends CardName> = {
  [key in K]: string;
};

// TODO: make this into a map
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

  // card activation prefixes
  "[cardname] was activated.", // manual effect
  '[cardname] was activated and its LP was cut to "1".', // Ra battle mode
  "[cardname] was activated and sent to the graveyard.", // Pinch Hopper, Skull ladybug, reflect bounder, beast of gilfer
  "[cardname]'s permanent effect:", // default auto effect
  "[cardname]'s permanent effect in the own graveyard:", // newdoria, DDD, vampyre lord, Ra phoenix mode
  "[cardname]'s permanent effect was triggered.", // negative effects -- exodia necross, thunder nyan
  "[cardname]'s permanent effect in the foe's graveyard:", // helpoemer
  "The trap was [cardname]:",
  "Spirit Message permanent effect:", // INAL (not F) failure/destruction

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

const directAttack =
  "It will inflict LP damage equal to the attack power on the opponent directly.";
const powerupSpell = "It powered up a monster.";
const burnSpell = (amt: number) =>
  `It will inflict ${amt}LP damage on the opponent.`;
const healSpell = (amt: number) =>
  `The player's LP will be restored by ${amt}.`;
const destroyAttackerTrap = "[X] will disappear.";
const spiritMessageFail = "Disappeared because Destiny Board is missing.";

// ----------------------------------------- //
//                 MONSTERS                  //
// ----------------------------------------- //

export const flipDialogueMap: DialogueMap<FlipEffectMonster> = {
  // destroy opponent cards
  [Monster.FlameSwordsman]:
    "Its circular slash will destroy all dinosaurs on the opponent's field.",
  [Monster.DragonSeeker]:
    "All the dragons on the opponent's field will be destroyed.",
  [Monster.BattleOx]:
    "Its Axe Crusher will destroy all fire monsters on the opponent's field.",
  [Monster.FiendsHand]:
    "One monster on the foe's field will be taken to the world of the dead.",
  [Monster.ObeliskTheTormentor]:
    "Every monster on the foe's field will be destroyed.\nThe opponent will be hit with 4,000LP damage.",
  [Monster.BeastkingOfTheSwamps]:
    "It will drown all monsters on the field in a swamp.",
  [Monster.TheWingedDragonOfRaPhoenixMode]:
    "All monsters on the foe's field will be wiped out at the cost of 1,000LP.",
  [Monster.ZombyraTheDark]:
    "In return for powereing down, a monster on the foe's field will be destroyed.",
  [Monster.DesVolstgalph]:
    "One monster on the foe's field will be destroyed.\nThe opponent will be hit with 500LP damage.",
  [Monster.GilfordTheLightning]:
    "Every monster on the foe's field will be destroyed.",
  [Monster.MysticalBeastSerket]:
    "It will power up by enveloping one monster on the foe's field.",
  [Monster.FGD]:
    "All monsters, spells, and traps on the opponent's field will be destroyed.",
  [Monster.BarrelDragon]:
    "Up to three monsters on the foe's field will be wiped out at a 50% success rate.",
  [Monster.ChironTheMage]:
    "A monster on the opponent's field will be destroyed.",
  [Monster.ReaperOfTheCards]: "A trap on the foe's field will be destroyed.",
  [Monster.XYDragonCannon]:
    "Discard the card at the far left in your hand to destroy a face-up spell or trap on the opponent's field.",
  [Monster.XZTankCannon]:
    "Discard the card at the far left in your hand to destroy a face-down spell or trap on the opponent's field.",
  [Monster.YZTankDragon]:
    "Discard the card at the far left in your hand to destroy a face-down monster on the opponent's field.",
  [Monster.XYZDragonCannon]:
    "Discard the card at the far left in your hand to destroy a monster on the opponent's field.",
  [Monster.DarkPaladin]:
    "Discard the card at the far left in your hand to destroy a spell on the opponent's field.",

  // fields
  [Monster.CurseOfDragon]: "The field will be turned into a wasteland.",
  [Monster.KairyuShin]: "The field will be turned into a sea.",
  [Monster.GiantSoldierOfStone]: "The field will be turned into an arena.",
  [Monster.SpiritOfTheMountain]: "The field will be turned into a mountain.",
  [Monster.Trent]: "The field will be transformed into a forest.",

  // special summon
  [Monster.SpiritOfTheBooks]:
    "Boo Koo will be summoned if there is room on the own field.",
  [Monster.RevivalJam]:
    "Revival Jam will split if there is space on the player's field.",
  [Monster.ToadMaster]:
    "Frog the Jam will be summoned if there is room on the own field.",
  [Monster.Doron]: "Doron will clone itself if there is room on the own field.",
  [Monster.AncientLamp]:
    "La Jinn the Mystical Genie of the Lamp will be summoned if there is room on the own field.",
  [Monster.KingsKnight]:
    "A Jack's Knight is summoned if a Queen's Knight is on the player's field.",
  [Monster.PuppetMaster]:
    "Three zombies will be summoned in exchange for 1,000LP.",
  [Monster.ValkyrionTheMagnaWarrior]:
    "If there is room on the own field, it splits into Alpha, Beta, and Gamma.",
  [Monster.PinchHopper]:
    "In return, it summons an insect monster from the player's hand.",

  // powerup/upgrade own monsters
  [Monster.TimeWizard]: "Over a millennium, monsters are transformed.",
  [Monster.GyakutennoMegami]:
    "All monsters on the own field with 500 ATK or lower are powered up.",
  [Monster.HourglassOfLife]:
    "All monsters on the own field will be powered up in exchange for 1,000LP.",
  [Monster.LegendaryFiend]: "Legendary Fiend will power up.",

  // immobilise opponent
  [Monster.IllusionistFacelessMage]:
    "Its illusory eye stops all monsters on the foe's field from moving on the next turn.",
  [Monster.Nemuriko]: "All monsters on the foe's field will fall asleep.",
  [Monster.ElectricLizard]:
    "One monster on the foe's field will be immobilised on the next turn.",
  [Monster.RedArcheryGirl]:
    "A monster on the foe's field will be powered down and unable to move next turn.",
  [Monster.InvitationToADarkSleep]:
    "All monsters on the foe's field will fall asleep and be incapable of moving.",

  // heal self
  [Monster.FairysGift]: "The player's LP will be restored by 1,000.",
  [Monster.LadyOfFaith]: "The player's LP will be restored by 500.",
  [Monster.SkullMarkLadyBug]: "In return, it restores the player's LP by 500.",

  // burn/direct attack
  [Monster.FireReaper]:
    "It will shoot a flaming arrow at the foe to inflict 50LP damage.",
  [Monster.MysticLamp]: directAttack,
  [Monster.Leghul]: directAttack,
  [Monster.PenguinTorpedo]: directAttack,
  [Monster.ExarionUniverse]:
    "It will inflict LP damage on the foe equal to its ATK, then power down.",
  [Monster.TheWingedDragonOfRaBattleMode]:
    "In return, the opponent loses an identical amount of LP.",
  [Monster.ReflectBounder]:
    "In return, the ATK of a monster on the foe's field inflicts LP damage.",
  [Monster.DarkNecrofear]: "A monster on the foe's field will be made an ally.",

  // control/subsume opponent monster
  [Monster.Relinquished]:
    "A monster on the foe's field will be robbed of its abilities.",
  [Monster.ThousandEyesRestrict]:
    "The abilities of a foe's will be stolen to power up two levels.", // bad wording
  [Monster.ParasiteParacide]: "It infected a monster on the foe's field.",

  // merge with own monsters
  [Monster.XHeadCannon]:
    "X will combine with Y and/or Z on the player's field.\nCombine with Y to become XY. Combine with Z to become XZ. Combine with Y and Z to become XYZ.",
  [Monster.YDragonHead]:
    "Y will combine with X and/or Z on the player's field.\nCombine with X to become XY. Combine with Z to become YZ. Combine with X and Z to become XYZ.",
  [Monster.ZMetalTank]:
    "Z will combine with X and/or Y on the player's field.\nCombine with X to become XZ. Combine with Y to become YZ. Combine with X and Z to become XYZ.",
  [Monster.AlphaTheMagnetWarrior]:
    "If Beta and Gamma are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.",
  [Monster.BetaTheMagnetWarrior]:
    "If Alpha and Gamma are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.",
  [Monster.GammaTheMagnetWarrior]:
    "If Alpha and Beta are on the field, the trio integrates as one. Valkyrion the Magna Warrior will appear.",

  // assorted
  [Monster.CatapultTurtle]:
    "All unused monsters on the own field will be launched by catapult.\nTheir combined ATK directly damages the opponent's LP.",
  [Monster.TrapMaster]:
    "An Acid Trap Hole will be set if there is room on the own field.",
  [Monster.RocketWarrior]:
    "It transforms into a rocket that powers down a monster on the foe's field.",
  [Monster.MonsterEye]: "It will reveal the cards in the opponent's hand.",
  [Monster.GoddessOfWhim]:
    "It lets the player draw a card from the deck, then disappears.",
  [Monster.Skelengel]: "One card will be drawn from the player's deck.",
  [Monster.ByserShock]:
    "All face-down cards on both fields are returned to the players' hands if space allows.",
  [Monster.BerserkDragon]:
    "It will attack every monster on the opponent's field.",
  [Monster.BeastOfGilfer]:
    "In return, it powers down every monster on the foe's field.",
};

export const graveyardDialogueMap: DialogueMap<GraveyardEffectMonster> = {
  [Monster.TheWingedDragonOfRaPhoenixMode]:
    "Resurrected to own field in Battle Mode.",
  [Monster.Helpoemer]: "Discard one card in own hand.",
  [Monster.Newdoria]: "Destroyed the enemy monster with the highest ATK.",
  [Monster.VampireLord]: "Resurrected to the own field.",
  [Monster.DifferentDimensionDragon]: "Resurrected to the own field.",
  [Monster.DarkFlareKnight]:
    "The Dark Flare Knight in the graveyard summoned a Mirage Knight to the own field.",
};

export const permAutoMonsterDialogueMap: DialogueMap<PermAutoEffectMonster> = {
  [Monster.ThunderNyanNyan]:
    "It was sent to the graveyard because a non-light monster appeared on the own field.",
  
  // death text
  // [Monster.ExodiaNecross]:
  //   "It was sent to the graveyard because there were no Exodia parts in the own graveyard.",

  // powerup text
  [Monster.ExodiaNecross]: "Powered up one level.",
  [Monster.Jinzo]: "Destroyed all enemy traps.",
  [Monster.CastleOfDarkIllusions]:
    "Darkened the own field and turned monsters face down.",
  [Monster.SatelliteCannon]: "Powered up two levels, to max six levels.",
  [Monster.LavaGolem]: "Inflicted 700LP damage on the player.",
  [Monster.ViserDes]: "Weakened the enemy monster with the highest ATK.",
  [Monster.MirageKnight]: "Split into Dark Magician and Flame Swordsman.",
  [Monster.BerserkDragon]: "Powered down.",

  // CoE line has no intro text
  [Monster.PetitMoth]: "Petit Moth transformed into Larvae Moth!",
  [Monster.LarvaeMoth]: "Larvae Moth transformed into Cocoon of Evolution!",
  [Monster.CocoonOfEvolution]:
    "Cocoon of evolution transformed into Great Moth!",
  [Monster.GreatMoth]:
    "Great Moth transformed into Perfectly Ultimate Great Moth!",
};

export const tempAutoMonsterDialogueMap: DialogueMap<TempPowerUpMonster> = {
  [Monster.MammothGraveyard]: "Powered down every monster on the foe's field.",
  [Monster.DarkJeroid]: "Weakened the enemy monster with the highest ATK.",
  [Monster.Hoshiningen]:
    "On both fields, light grew stronger and dark weakened.",
  [Monster.WitchsApprentice]:
    "On both fields, light grew weaker and dark stronger.",
  [Monster.PumpkingTheKingOfGhosts]: "Powered up all zombies on the own field.",
  [Monster.MysticalElf]:
    "Powered up a Blue Eyes White Dragon on the own field.",
  [Monster.HarpieLady]: "Powered up Harpie's Pet Dragons on own field.",
  [Monster.CyberHarpie]: "Powered up Harpie's Pet Dragons on own field.",
  [Monster.HarpieLadySisters]:
    "2X powered up Harpie's Pet Dragons on own field.",
  [Monster.MonsterTamer]: "Powered up a Dungeon Worm on the own field.",
  [Monster.MWarrior1]: "Powered up a M-Warrior #2 on the own field.",
  [Monster.MWarrior2]: "Powered up a M-Warrior #1 on the own field.",
  [Monster.NightmarePenguin]:
    "Powered up monster(s) on the own field.\nIt affects aqua, fish, sea serpent, and reptile types.",
  [Monster.CommandAngel]: "Powered up all fairies on the own field.",
  [Monster.SwampBattleguard]:
    "Powered up for every Lava Battleguard on own field.",
  [Monster.LavaBattleguard]:
    "Powered up for every Swamp Battleguard on own field.",
  [Monster.BusterBlader]:
    "Powered up for every dragon on the foe's field and in the foe's graveyard.",
  [Monster.WodanTheResidentOfTheForest]:
    "Powered up for every plant on the own field.",
  [Monster.PerfectMachineKing]:
    "2X powered up for every machine on both fields.",
  [Monster.SliferTheSkyDragon]: "3X powered up for every card in the own hand.",
  [Monster.LabyrinthTank]:
    "Powered up for every Labyrinth Wall on the own field.",
  [Monster.MachineKing]: "Powered up for every machine on both fields.",
  [Monster.MasterOfDragonSoldier]:
    "Powered up for all face-up dragons on own field.",
  [Monster.DarkMagicianGirl]:
    "Powered up for all Dark Magicians in graveyards.",
  [Monster.ToonDarkMagicianGirl]:
    "Powered up for all Dark Magicians in graveyards.",
  [Monster.InsectQueen]: "Powered up for all face-up insects on own field.",
  [Monster.BladeKnight]: "Powered up for having one or no cards in the hand.",
};

export const handDialogueMap: DialogueMap<HandEffectMonster> = {
  [Monster.LavaGolem]:
    "Emerged on the foe's field in exchange for two enemy tributes.",
  [Monster.ExodiaTheForbiddenOne]:
    "All Exodia pieces came together in the hand!",
};

// ----------------------------------------- //
//                  SPELLS                   //
// ----------------------------------------- //

export const spellDialogueMap: DialogueMap<DirectSpell> = {
  // burn
  [Spell.Sparks]: burnSpell(50),
  [Spell.Hinotama]: burnSpell(100),
  [Spell.FinalFlame]: burnSpell(200),
  [Spell.Ookazi]: burnSpell(500),
  [Spell.TremendousFire]: burnSpell(1000),
  [Spell.RestructerRevolution]:
    "The opponent takes 200LP damage for each card in his/her hand.",

  // heal
  [Spell.MooyanCurry]: healSpell(200),
  [Spell.RedMedicine]: healSpell(500),
  [Spell.GoblinsSecretRemedy]: healSpell(1000),
  [Spell.SoulOfThePure]: healSpell(2000),
  [Spell.DianKetoTheCureMaster]: healSpell(5000),

  // type-specific power-up
  [Spell.LegendarySword]: powerupSpell,
  [Spell.SwordOfDarkDestruction]: powerupSpell,
  [Spell.DarkEnergy]: powerupSpell,
  [Spell.AxeOfDespair]: powerupSpell,
  [Spell.LaserCannonArmor]: powerupSpell,
  [Spell.InsectArmorWithLaserCannon]: powerupSpell,
  [Spell.ElfsLight]: powerupSpell,
  [Spell.BeastFangs]: powerupSpell,
  [Spell.SteelShell]: powerupSpell,
  [Spell.VileGerms]: powerupSpell,
  [Spell.BlackPendant]: powerupSpell,
  [Spell.SilverBowAndArrow]: powerupSpell,
  [Spell.HornOfLight]: powerupSpell,
  [Spell.HornOfTheUnicorn]: powerupSpell,
  [Spell.DragonTreasure]: powerupSpell,
  [Spell.ElectroWhip]: powerupSpell,
  [Spell.CyberShield]: powerupSpell,
  [Spell.MysticalMoon]: powerupSpell,
  [Spell.MalevolentNuzzler]: powerupSpell,
  [Spell.VioletCrystal]: powerupSpell,
  [Spell.BookOfSecretArts]: powerupSpell,
  [Spell.Invigoration]: powerupSpell,
  [Spell.MachineConversionFactory]: powerupSpell,
  [Spell.RaiseBodyHeat]: powerupSpell,
  [Spell.FollowWind]: powerupSpell,
  [Spell.PowerOfKaishin]: powerupSpell,
  [Spell.KunaiWithChain]: powerupSpell,
  [Spell.Salamandra]: powerupSpell,
  [Spell.Megamorph]: powerupSpell,
  [Spell.WingedTrumpeter]: powerupSpell,
  [Spell.BrightCastle]: powerupSpell,

  // monster-specific power-up
  [Spell.CyclonLaser]: powerupSpell,
  [Spell.ElegantEgotist]: "[X] will be transformed into Harpie Lady Sisters.",
  [Spell.MagicalLabyrinth]: powerupSpell,
  [Spell.Metalmorph]: "A monster is made stronger through metalization.",
  [Spell._7Completed]: powerupSpell,

  // power-down
  [Spell.SpellbindingCircle]:
    "All monsters on the foe's field will be weakened.",
  [Spell.ShadowSpell]:
    "All monsters on the foe's field will be weakened by two levels.",

  // field
  [Spell.Forest]:
    "The field is transformed into a forest.\nBeast warriors, beasts, insects, and plants will gain field power.",
  [Spell.Wasteland]:
    "The field is transformed into a wasteland.\nZombies, dinosaurs, and rock-type monsters will gain field power.",
  [Spell.Mountain]:
    "The field is transformed into a mountain.\nDragons, winged beasts, and thunder types will gain field power.",
  [Spell.Sogen]:
    "The field is transformed into a meadow.\nWarriors and beast warriors will gain field power.",
  [Spell.Umi]:
    "The field is transformed into a sea.\nAqua, sea serpent, and thunder monsters will gain field power.\nMachines and pyro monsters will be weakened.",
  [Spell.Yami]:
    "The field is transformed into darkness.\nSpellcasters and fiends will gain power.\nFairies will be weakened.",

  // general destruction
  [Spell.FinalDestiny]:
    "Every monster, spell, and trap card on the field and in the hand will be destroyed.",
  [Spell.HeavyStorm]:
    "Every monster, spell, and trap card on the field will be destroyed.",
  [Spell.DarkHole]: "All monsters on the field will be wiped out.",
  [Spell.Raigeki]: "All enemies on the field will be wiped out.",
  [Spell.CrushCard]:
    "All monsters on the foe's field with ATK of 1,500 or higher will be destroyed.",
  [Spell.HarpiesFeatherDuster]:
    "All spells and traps on the foe's field are eradicated.",
  [Spell.BeckonToDarkness]:
    "It will carry off a monster on the foe's field to the afterlife.",

  // type-specific destruction
  [Spell.WarriorElimination]:
    "All warriors on the foe's field will be destroyed.",
  [Spell.EternalRest]: "All zombies on the foe's field will be destroyed.",
  [Spell.StainStorm]: "All machines on the foe's field will be destroyed.",
  [Spell.EradicatingAerosol]:
    "All insects on the foe's field will be destroyed.",
  [Spell.BreathOfLight]:
    "All rock monsters on the foe's field will be destroyed.",
  [Spell.EternalDrought]: "All fish on the foe's field will be destroyed.",
  [Spell.ExileOfTheWicked]: "All fields on the foe's field will be destroyed.",
  [Spell.LastDayOfWitch]:
    "All spellcasters on the foe's field will be destroyed.",

  // assorted
  [Spell.Cursebreaker]:
    "All powered down monsters on the player's field are restored.",
  [Spell.StopDefense]:
    "For one turn, all enemy monsters on the field cannot defend.",
  [Spell.SwordsOfRevealingLight]:
    "The opponent will be unable to attack for three turns.\nAll monsters on the enemy's field will be identified by the swords' light",
  [Spell.DarkPiercingLight]:
    "All monsters on the enemy's field will be identified.",
  [Spell.MonsterReborn]:
    "A monster in the foe's graveyard will be revived on the player's field.",
  [Spell.GravediggerGhoul]:
    "The ghoul will carry off all the monsters in the graveyards.",
  [Spell.DarknessApproaches]:
    "All cards on the own field are turned face down.",
  [Spell.BrainControl]:
    "For one turn, a monster on the foe's field is under mind control.",
  [Spell.ChangeOfHeart]: "A monster on the foe's field will be made an ally.",
  [Spell.Multiply]: "Kuriboh on the player's field will multiply.",
  [Spell.PotOfGreed]:
    "Up to two cards may be drawn from the deck if there is space in the hand.",
  [Spell.TheInexperiencedSpy]: "The opponent's hand will be revealed.",
};

// ----------------------------------------- //
//                   TRAPS                   //
// ----------------------------------------- //

export const perpetualSpellTrapDialogueMap: DialogueMap<PerpetualSpellTrap> = {
  [Spell.MessengerOfPeace]:
    "Immobilised all monsters with 1,500 ATK or higher.", // as soon as a 1500+ card is present
  
  // [Spell.MessengerOfPeace]: "Infliced 1,000LP damage on the player.", // start of own turn
  // [Spell.JamBreedingMachine]: "Summoned a Change Slime to the own field.", // start of all own turns after first

  [Spell.JamBreedingMachine]: "No monsters can be summoned from the own deck.", // on initial set only
  [Trap.DragonCaptureJar]: "All dragons are immobilised on the foe's field.",
  [Trap.DestinyBoard]: "Added a letter to the Spirit Message on the own field.",
  [Trap.SpiritMessageI]: spiritMessageFail,
  [Trap.SpiritMessageN]: spiritMessageFail,
  [Trap.SpiritMessageA]: spiritMessageFail,
  [Trap.SpiritMessageL]: spiritMessageFail,
};

export const attackTrapDialogueMap: DialogueMap<CounterAttackTrap> = {
  [Trap.AmazonArchers]: "The monster is powered down.",
  [Trap.HouseOfAdhesiveTape]: destroyAttackerTrap,
  [Trap.Eatgaboon]: destroyAttackerTrap,
  [Trap.BearTrap]: destroyAttackerTrap,
  [Trap.InvisibleWire]: destroyAttackerTrap,
  [Trap.AcidTrapHole]: destroyAttackerTrap,
  [Trap.WidespreadRuin]: destroyAttackerTrap,
  [Trap.TorrentialTribute]:
    "All monsters on the attacking side of the field will be destroyed.",
  [Trap.InfiniteDismissal]: "[X] will be unable to move for one turn.",
};

export const spellTrapDialogueMap: DialogueMap<CounterSpellTrap> = {
  // TODO
  [Trap.GoblinFan]: "",
  [Trap.BadReactionToSimochi]: "",
  [Trap.ReverseTrap]: "The monster will be powered down.",
  [Trap.FakeTrap]: "",
  [Trap.AntiRaigeki]: "",
};
