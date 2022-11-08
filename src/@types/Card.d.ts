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

type Card = MonsterCard | SpellOrTrapOrRitualCard;

interface BaseCard {
  id: number;
  name: CardName;
  cost: number;
  category: CardCategory;
}

type MonsterCard = BaseCard & {
  category: "Monster";
  effect: boolean;
  type: CardType;
  alignment: Alignment;
  level: number;
  atk: number;
  def: number;
  code: number;
};

type SpellOrTrapOrRitualCard = BaseCard & {
  category: "Magic" | "Trap" | "Ritual";
  code: number;
};
