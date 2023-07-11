import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Ast } from './models/ast.model';

export class ASTProcessor {
  private ast: Ast[] = [];

  process(tree: any, namespace?: string): this {
    const childCount = tree.childCount;
    Array.from(Array(childCount).keys()).forEach((_, index) => {
      const child = tree.getChild(index);
      let rule: string = <string>child?.parent?.constructor.name;
      if (!child) return;
      if (!(child instanceof TerminalNode)) {
        namespace ? this.process(child, `${namespace}.${rule}`) : this.process(child, rule);
        return;
      }

      const ruleIndex = tree.ruleIndex;
      const token = child.symbol;
      const tokenType = token.type;
      namespace = namespace?.replace(/context/ig, '').toLocaleLowerCase();
      rule = rule?.replace(/context/ig, '');
      this.ast.push({ token: <string>token.text, tokenType, ruleIndex, rule, namespace });

    });

    return this;
  }

  get() {
    return this.ast;
  }
}
