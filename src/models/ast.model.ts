export interface Ast {
  ruleIndex: number;
  token: string;
  tokenType: number;
  tokenIndex: number;
  rules?: number[];
}
