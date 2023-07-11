import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Ast } from './models/ast.model';

export class ASTProcessor {
  private ast: Ast[] = [];

  process(tree: any, rules: number[] = []): this {
    const childCount = tree.childCount;
    Array.from(Array(childCount).keys()).forEach((_, index) => {
      const child = tree.getChild(index);
      if (!child) return;
      if (!(child instanceof TerminalNode)) {
        if (!rules.includes(tree.ruleIndex))
          rules.push(tree.ruleIndex);
        this.process(child, [...rules]);
        return;
      }
      const ruleIndex = tree.ruleIndex;
      const token = child.symbol;
      const tokenType = token.type;
      this.ast.push({ token: <string>token.text, tokenType, ruleIndex, rules});

    });

    return this;
  }

  get() {
    return this.ast;
  }
}
