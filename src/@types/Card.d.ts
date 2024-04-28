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
type Card<K extends CardId = CardId> = MonsterCard<K> | SpellOrTrapOrRitualCard;

interface BaseCard<K extends CardId = CardId> {
  id: K;
  name: string;
  cost: number;
  limit?: 1 | 2;
  category: CardCategory;
}

type DBMonsterCard<K extends CardId = CardId> = BaseCard<K> & {
  id: Monster;
  category: "Monster";
  effect: boolean;
  type: CardType;
  alignment: Alignment;
  level: number;
  atk: number;
  def: number;
  code: number;
};

type MonsterCard<K extends CardId = CardId> = DBMonsterCard<K> & {
  effAtk: number;
  effDef: number;
};

type SpellOrTrapOrRitualCard = BaseCard<Monster> & {
  id: SpellTrapRitualId;
  category: "Magic" | "Trap" | "Ritual";
  code: number;
};
