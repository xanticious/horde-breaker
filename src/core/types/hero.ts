export enum HeroId {
  Barbarian = "barbarian",
}

export interface HeroDefinition {
  id: HeroId;
  name: string;
  description: string;
}
