type CardCategory = "Monster" | "Magic" | "Trap" | "Ritual";

type CardType =
  | "Warrior"
  | "Fiend"
  | "Spellcaster"
  | "Machine"
  | "Aqua"
  | "Dragon"
  | "Insect"
  | "Beast"
  | "Fairy"
  | "Zombie"
  | "Rock"
  | "Winged Beast"
  | "Beast-Warrior"
  | "Plant"
  | "Fish"
  | "Pyro"
  | "Thunder"
  | "Dinosaur"
  | "Reptile"
  | "Sea Serpent";

type Alignment =
  | "Fiend"
  | "Earth"
  | "Forest"
  | "Water"
  | "Dark"
  | "Light"
  | "Wind"
  | "Fire"
  | "Dreams"
  | "Divine"
  | "Thunder";

type DBCard = DBMonsterCard | SpellOrTrapOrRitualCard;
type Card = MonsterCard | SpellOrTrapOrRitualCard;

interface BaseCard {
  id: number;
  name: CardName;
  cost: number;
  limit?: 1 | 2;
  category: CardCategory;
}

type DBMonsterCard = BaseCard & {
  category: "Monster";
  effect: boolean;
  type: CardType;
  alignment: Alignment;
  level: number;
  atk: number;
  def: number;
  code: number;
};

type MonsterCard = DBMonsterCard & {
  effAtk: number;
  effDef: number;
};

type SpellOrTrapOrRitualCard = BaseCard & {
  category: "Magic" | "Trap" | "Ritual";
  code: number;
};
