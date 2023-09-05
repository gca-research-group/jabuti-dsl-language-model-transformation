import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { type Ast } from './models/ast.model';

import { CharStreams, CommonTokenStream, type RuleContext } from 'antlr4ts';
import { JabutiGrammarLexer } from 'jabuti-dsl-language-antlr/dist/JabutiGrammarLexer';
import { JabutiGrammarParser } from 'jabuti-dsl-language-antlr/dist/JabutiGrammarParser';

const CONTRACT_NAME = { ruleIndex: 3, tokenType: 71 };
const APPLICATION = { ruleIndex: 9, tokenType: 63 };
const PROCESS = { ruleIndex: 10, tokenType: 63 };
const BEGIN_DATE = [
  {
    tokenType: 70,
    ruleIndex: 43
  },
  {
    tokenType: 57,
    ruleIndex: 36
  },
  {
    tokenType: 64,
    ruleIndex: 42
  },
  {
    tokenType: 57,
    ruleIndex: 36
  },
  {
    tokenType: 64,
    ruleIndex: 41
  },
  {
    tokenType: 66,
    ruleIndex: 41
  },
  {
    tokenType: 64,
    ruleIndex: 40
  },
  {
    tokenType: 66,
    ruleIndex: 40
  },
  {
    tokenType: 55,
    ruleIndex: 37
  },
  {
    tokenType: 64,
    ruleIndex: 39
  },
  {
    tokenType: 64,
    ruleIndex: 38
  },
  {
    tokenType: 69,
    ruleIndex: 38
  }
];

const DUE_DATE = [
  {
    tokenType: 70,
    ruleIndex: 43
  },
  {
    tokenType: 57,
    ruleIndex: 36
  },
  {
    tokenType: 64,
    ruleIndex: 42
  },
  {
    tokenType: 65,
    ruleIndex: 42
  },
  {
    tokenType: 57,
    ruleIndex: 36
  },
  {
    tokenType: 67,
    ruleIndex: 41
  },
  {
    tokenType: 68,
    ruleIndex: 41
  },
  {
    tokenType: 66,
    ruleIndex: 40
  },
  {
    tokenType: 55,
    ruleIndex: 37
  },
  {
    tokenType: 66,
    ruleIndex: 39
  },
  {
    tokenType: 64,
    ruleIndex: 39
  },
  {
    tokenType: 64,
    ruleIndex: 38
  },
  {
    tokenType: 69,
    ruleIndex: 38
  }
];

const ROLE_PLAYER = [
  {
    tokenType: 7,
    ruleIndex: 14
  }
];

const OPERATION = [
  {
    tokenType: 19,
    ruleIndex: 15
  },
  {
    tokenType: 20,
    tokenIndex: 97,
    ruleIndex: 15
  }
];

const WEEKDAY_INTERVAL = {
  token: {
    tokenType: 28,
    ruleIndex: 24
  },
  ruleIndex: [23],
  tokenType: [33, 39],
  closeToken: {
    tokenType: 52,
    ruleIndex: 24
  }
};

const TIMEINTEVAL = {
  token: {
    tokenType: 26,
    ruleIndex: 22
  },
  children: [
    {
      tokenType: 55,
      ruleIndex: 37
    },
    {
      tokenType: 64,
      ruleIndex: 40
    },
    {
      tokenType: 64,
      ruleIndex: 39
    },
    {
      tokenType: 64,
      ruleIndex: 39
    },
    {
      tokenType: 31,
      ruleIndex: 22
    },
    {
      tokenType: 64,
      ruleIndex: 38
    },
    {
      tokenType: 66,
      ruleIndex: 40
    },
    {
      tokenType: 69,
      ruleIndex: 39
    },
    {
      tokenType: 69,
      ruleIndex: 38
    }
  ]
};

const TIMEOUT = {
  token: {
    tokenType: 25,
    ruleIndex: 21
  },
  children: [
    {
      tokenType: 70,
      ruleIndex: 21
    },
    {
      tokenType: 66,
      ruleIndex: 44
    }
  ]
};

const MAXNUMBEROFOPERATION = {
  token: {
    tokenType: 22,
    ruleIndex: 25
  },
  children: [
    {
      tokenType: 70,
      ruleIndex: 25
    },
    {
      tokenType: 46,
      ruleIndex: 25
    },
    {
      tokenType: 66,
      ruleIndex: 44
    },
    {
      tokenType: 70,
      ruleIndex: 44
    }
  ]
};

const MESSAGE_CONTENT = {
  token: {
    tokenType: 23,
    ruleIndex: 26
  },
  closeToken: {
    tokenType: 52,
    ruleIndex: 26
  },
  children: [
    {
      tokenType: 63,
      ruleIndex: 28
    },
    {
      tokenType: 58,
      ruleIndex: 29
    },
    {
      tokenType: 61,
      ruleIndex: 28
    },
    {
      tokenType: 66,
      ruleIndex: 44
    },
    {
      tokenType: 70,
      ruleIndex: 44
    },
    {
      tokenType: 61,
      ruleIndex: 27
    },
    {
      tokenType: 70,
      ruleIndex: 44
    },
    {
      tokenType: 71,
      ruleIndex: 3
    }
  ]
};

const ERROR = {
  tokenType: 63,
  ruleIndex: 33
};

export class ASTProcessor {
  private readonly ast: Ast[] = [];

  process(contract: string) {
    const context = this.getContext(contract);
    this.buildRecursiveAst(context);
    return this.buildAst(this.ast);
  }

  private getContext(contract: string) {
    const inputStream = CharStreams.fromString(contract);
    const lexer = new JabutiGrammarLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JabutiGrammarParser(tokenStream);
    const context = parser.contract();

    return context;
  }

  private buildRecursiveAst(tree: RuleContext, rules: number[] = []) {
    const childCount = tree.childCount;
    Array.from(Array(childCount).keys()).forEach((_, index) => {
      const child = tree.getChild(index) as RuleContext;
      if (!child) return;
      if (!(child instanceof TerminalNode)) {
        if (!rules.includes(tree.ruleIndex)) {
          rules.push(tree.ruleIndex);
        }

        this.buildRecursiveAst(child, [...rules]);
        return;
      }
      const ruleIndex = tree.ruleIndex;
      const token = child.symbol;
      const tokenType = token.type;
      const tokenIndex = token.tokenIndex;
      this.ast.push({ token: token.text as string, tokenType, tokenIndex, ruleIndex, rules });
    });
  }

  private buildAst(ast: Ast[]) {
    const contractName = ast.find(
      item => item.ruleIndex === CONTRACT_NAME.ruleIndex && item.tokenType === CONTRACT_NAME.tokenType
    )?.token;

    const beginDate = ast
      .filter(
        item =>
          BEGIN_DATE.find(_item => _item.ruleIndex === item.ruleIndex && _item.tokenType === item.tokenType) &&
          item.rules?.includes(7)
      )
      .map(item => item.token);

    const dueDate = ast
      .filter(
        item =>
          DUE_DATE.find(_item => _item.ruleIndex === item.ruleIndex && _item.tokenType === item.tokenType) &&
          item.rules?.includes(8)
      )
      .map(item => item.token);

    const application = ast
      .find(item => item.ruleIndex === APPLICATION.ruleIndex && item.tokenType === APPLICATION.tokenType)
      ?.token?.replace(/\/|"/g, '');

    const process = ast
      .find(item => item.ruleIndex === PROCESS.ruleIndex && item.tokenType === PROCESS.tokenType)
      ?.token?.replace(/\/|"/g, '');

    const clauses = ast
      .filter(item => [9, 10, 11].includes(item.tokenType))
      .map((item, index) => {
        const tokens = ast.filter(token => token.rules?.includes(item.ruleIndex));

        const clause: Record<string, any> = {};
        clause.rolePlayer = this.findRolePlayer(tokens, item.ruleIndex);
        clause.operation = this.findOperation(tokens, item.ruleIndex);

        const terms = [];

        const weekdayInterval = this.buildWeekDaysInterval(tokens);
        const timeInterval = this.buildTimeInterval(tokens);
        const maxNumberOfOperation = this.buildMaxNumberOfOperation(tokens);
        const timeout = this.buildTimeout(tokens);
        const messageContent = this.buildMessageContent(tokens);

        const errorMessage = tokens
          .find(token => token.ruleIndex === ERROR.ruleIndex && token.tokenType === ERROR.tokenType)
          ?.token?.replace(/\\"/g, '');

        terms.push(...weekdayInterval);
        terms.push(...timeInterval);
        terms.push(...maxNumberOfOperation);
        terms.push(...timeout);
        terms.push(...messageContent);

        const termName = tokens.find(token => token.tokenType === 71 && token.tokenIndex > item.tokenIndex)?.token;

        clause.name = {
          snake: `${item.token}_${termName}_${index}`,
          camel:
            item.token +
            [termName ?? '', index.toString()].map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(''),
          pascal: [item.token, termName ?? '', index.toString()]
            .map(item => item.charAt(0).toUpperCase() + item.slice(1))
            .join('')
        };

        const variables: Array<{ name: string; type: string }> = terms
          .filter(term => term.type === 'messageContent')
          .map(term => {
            return { type: (term.arguments as any).type, name: term.name.camel };
          })
          .flat();

        if (weekdayInterval.length) {
          variables.push({ name: 'weekDay', type: 'NUMBER' });
        }

        if (timeInterval.length) {
          variables.push({ name: 'accessTime', type: 'TIME' });
        }

        if (maxNumberOfOperation.length || timeout.length) {
          variables.push({ name: 'accessDateTime', type: 'DATETIME' });
        }

        clause.errorMessage = errorMessage;
        clause.variables = variables;
        clause.terms = terms;

        return clause;
      })
      .filter(clause => clause.terms.length);

    const timeoutTerms = clauses
      .filter(
        clause =>
          clause.operation === 'response' && clause.terms.find((term: { type: string }) => term.type === 'timeout')
      )
      .map(clause => {
        const term = clause.terms.find((term: { type: string }) => term.type === 'timeout');
        return {
          clauseName: clause.name,
          termName: term.name
        };
      });

    const data = {
      timeoutTerms,
      contractName,
      dates: {
        beginDate: this.convertToDateTime(beginDate),
        dueDate: this.convertToDateTime(dueDate)
      },
      parties: {
        application,
        process
      },
      clauses
    };

    return data;
  }

  private convertToDateTime(arr: string[]): string {
    return [...arr.slice(0, 5), ' ', ...arr.slice(5)].join('');
  }

  private findRolePlayer(tokens: Ast[], ruleIndex: number) {
    return tokens.find(
      token =>
        ROLE_PLAYER.find(item => item.ruleIndex === token.ruleIndex) &&
        ROLE_PLAYER.find(item => item.tokenType === token.tokenType) &&
        token.rules?.includes(ruleIndex)
    )?.token;
  }

  private findOperation(tokens: Ast[], ruleIndex: number) {
    return tokens.find(
      token =>
        OPERATION.find(item => item.ruleIndex === token.ruleIndex) &&
        OPERATION.find(item => item.tokenType === token.tokenType) &&
        token.rules?.includes(ruleIndex)
    )?.token;
  }

  private buildWeekDaysInterval(tokens: Ast[]) {
    return tokens
      .filter(
        token =>
          token.ruleIndex === WEEKDAY_INTERVAL.token.ruleIndex && token.tokenType === WEEKDAY_INTERVAL.token.tokenType
      )
      .map((item, index) => {
        const closeToken = tokens.find(
          token =>
            token.tokenIndex > item.tokenIndex &&
            token.ruleIndex === WEEKDAY_INTERVAL.closeToken.ruleIndex &&
            token.tokenType === WEEKDAY_INTERVAL.closeToken.tokenType
        );
        return {
          name: {
            snake: `weekdayInterval_${index}`,
            camel: `weekdayInterval${index}`,
            pascal: `WeekdayInterval${index}`
          },
          type: 'weekdayInterval',
          arguments: tokens
            .filter(
              b =>
                WEEKDAY_INTERVAL.tokenType.includes(b.tokenType) &&
                WEEKDAY_INTERVAL.ruleIndex.includes(b.ruleIndex) &&
                b.rules?.includes(item.ruleIndex) &&
                b.tokenIndex > item.tokenIndex &&
                closeToken &&
                b.tokenIndex < closeToken.tokenIndex
            )
            .map(c => c.token)
        };
      });
  }

  private buildTimeInterval(tokens: Ast[]) {
    return tokens
      .filter(
        token => token.ruleIndex === TIMEINTEVAL.token.ruleIndex && token.tokenType === TIMEINTEVAL.token.tokenType
      )
      .map((item, index) => {
        const [start, end] = tokens
          .filter(
            token =>
              !!TIMEINTEVAL.children.find(
                child => child.ruleIndex === token.ruleIndex && child.tokenType === token.tokenType
              )
          )
          .map(token => token.token)
          .join('')
          .split('to');

        return {
          name: {
            snake: `timeInterval_${index}`,
            camel: `timeInterval${index}`,
            pascal: `TimeInterval${index}`
          },
          type: 'timeInterval',
          arguments: {
            start,
            end
          }
        };
      });
  }

  private buildMaxNumberOfOperation(tokens: Ast[]) {
    return tokens
      .filter(
        token =>
          token.ruleIndex === MAXNUMBEROFOPERATION.token.ruleIndex &&
          token.tokenType === MAXNUMBEROFOPERATION.token.tokenType
      )
      .map((item, index) => {
        const [value, period] = tokens
          .filter(
            token =>
              !!MAXNUMBEROFOPERATION.children.find(
                child => child.ruleIndex === token.ruleIndex && child.tokenType === token.tokenType
              )
          )
          .map(token => token.token);

        return {
          name: {
            snake: `maxNumberOfOperation_${index}`,
            camel: `maxNumberOfOperation${index}`,
            pascal: `MaxNumberOfOperation${index}`
          },
          type: 'maxNumberOfOperation',
          arguments: {
            value,
            period
          }
        };
      });
  }

  private buildTimeout(tokens: Ast[]) {
    return tokens
      .filter(token => token.ruleIndex === TIMEOUT.token.ruleIndex && token.tokenType === TIMEOUT.token.tokenType)
      .map((item, index) => {
        const [value] = tokens
          .filter(
            token =>
              !!TIMEOUT.children.find(
                child => child.ruleIndex === token.ruleIndex && child.tokenType === token.tokenType
              )
          )
          .map(token => token.token);

        return {
          name: {
            snake: `timeout_${index}`,
            camel: `timeout${index}`,
            pascal: `Timeout${index}`
          },
          type: 'timeout',
          arguments: {
            value
          }
        };
      });
  }

  private buildMessageContent(tokens: Ast[]) {
    return tokens
      .filter(
        token =>
          token.ruleIndex === MESSAGE_CONTENT.token.ruleIndex && token.tokenType === MESSAGE_CONTENT.token.tokenType
      )
      .map((item, index) => {
        const closeToken = tokens.find(
          token =>
            token.tokenIndex > item.tokenIndex &&
            token.ruleIndex === MESSAGE_CONTENT.closeToken.ruleIndex &&
            token.tokenType === MESSAGE_CONTENT.closeToken.tokenType
        );

        const values = tokens
          .filter(
            token =>
              !!MESSAGE_CONTENT.children.find(
                child => child.ruleIndex === token.ruleIndex && child.tokenType === token.tokenType
              ) &&
              token.rules?.includes(item.ruleIndex) &&
              token.tokenIndex > item.tokenIndex &&
              closeToken &&
              token.tokenIndex < closeToken.tokenIndex
          )
          .map(token => token.token);

        const args: { operator: string; value: string | boolean; type: string } = {
          operator: '',
          value: '',
          type: ''
        };

        if (values.length === 1) {
          args.operator = '==';
          args.value = true;
          args.type = 'BOOLEAN';
        }

        if (values.length === 3) {
          args.operator = values[1];
          args.value = values[2];
          args.type = isNaN(+values[2]) ? 'NUMBER' : 'TEXT';
        }

        if (values.length === 4) {
          args.operator = `${values[1]}${values[2]}`;
          args.value = values[3];
          args.type = isNaN(+values[3]) ? 'NUMBER' : 'TEXT';
        }

        return {
          name: {
            snake: `messageContent_${index}`,
            camel: `messageContent${index}`,
            pascal: `messageContent${index}`
          },
          type: 'messageContent',
          arguments: args
        };
      });
  }
}
