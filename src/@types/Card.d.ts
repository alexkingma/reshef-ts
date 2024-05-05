type CARD_NONE = 0;
type CardId = number; // decorative type
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

type Card = MonsterCard | SpellTrapRitualCard;

interface BaseCard {
  id: CardId;
  name: string;
  cost: number;
  limit?: 1 | 2;
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

type SpellTrapRitualCard = BaseCard & {
  category: "Magic" | "Trap" | "Ritual";
  code: number;
};
