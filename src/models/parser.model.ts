export interface Parser {
  parse: (contract: string, template?: string) => string;
}
