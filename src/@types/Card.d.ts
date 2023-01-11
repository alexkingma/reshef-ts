type CardCategory = "Monster" | "Magic" | "Trap" | "Ritual";

type CardType =
  | "Aqua"
  | "Beast-Warrior"
  | "Beast"
  | "Dinosaur"
  | "Dragon"
  | "Fairy"
  | "Fiend"
  | "Fish"
  | "Insect"
  | "Machine"
  | "Plant"
  | "Pyro"
  | "Reptile"
  | "Rock"
  | "Sea Serpent"
  | "Spellcaster"
  | "Thunder"
  | "Warrior"
  | "Winged Beast"
  | "Zombie";

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
