export interface Trait {
  traitType: string;
  value: string;
}

export interface Token {
  id: number;
  image: string;
  name: string;
  description: string;
  externalLink: string;
  traits?: Trait[];
  isClaimed: boolean;
}

export interface Collections {
  _id?: string;
  creator: string;
  image: string;
  name: string;
  symbol: string;
  contractAddress: string;
  tokens?: Token[];
  createdAt?: Date;
  updatedAt?: Date;
}