import { Tokenizer } from './tokenizer';
import {
  ProgramType,
  Kind,
  TokenEnum,
  Token,
  KindType,
  TermType,
  AbstractionType,
  VariableType,
  Type,
  FunctionType,
  BaseType,
} from './types';

export type ParserType = (lex: Tokenizer) => ProgramType;
export type Parser = ReturnType<ParserType>;

const tableBaseType = new Map<string, KindType>([
  ['Bool', KindType.Bool],
  ['Int', KindType.Int],
  ['Float', KindType.Float],
] as const);

export const parse: ParserType = (lex) => {
  let current = lex.getToken();
  let nextToken = lex.peek();
  return program();
  function eat(type: TokenEnum) {
    const previous = current;
    if (current.type !== type) {
      throw new Error(`unexpected token: ${current.value}`);
    }
    current = lex.next();
    nextToken = lex.peek();
    return previous;
  }

  function isToken(value: TokenEnum): boolean {
    return current.type === value;
  }
  function isNextToken(value: TokenEnum): boolean {
    return nextToken.type === value;
  }

  function parseStatement(): TermType {
    switch (current.type) {
      case TokenEnum.Lambda:
        return parseAbstraction();
      case TokenEnum.Identifier:
        return parseVariable();
      case TokenEnum.LParen:
        return parseApplication();
      default:
        throw new Error(`unexpected token: ${current.value}`);
    }
  }
  function parseApplication(): TermType {
    eat(TokenEnum.LParen);
    const left = parseStatement();
    if (isToken(TokenEnum.RParen)) {
      eat(TokenEnum.RParen);
      return left;
    }
    const right = parseStatement();
    eat(TokenEnum.RParen);
    return {
      kind: Kind.Application,
      left,
      right,
      t: null,
    };
  }

  function parseAbstraction(): AbstractionType {
    eat(TokenEnum.Lambda);
    const variable = parseVariable();
    eat(TokenEnum.Dot);
    const body = parseStatement();
    return {
      kind: Kind.Abstraction,
      variable,
      body,
      t: null,
    };
  }

  function parseVariable(): VariableType {
    const name = eat(TokenEnum.Identifier).value;
    if (isToken(TokenEnum.Colon)) {
      eat(TokenEnum.Colon);
      const t = parseType();
      return {
        kind: Kind.Variable,
        name,
        t,
      };
    }
    return {
      kind: Kind.Variable,
      name,
      t: null,
    };
  }

  function parseBaseType(): BaseType {
    const value = eat(TokenEnum.Identifier).value;
    switch (value) {
      case 'Bool':
        return {
          kind: KindType.Bool,
          value,
        };
      case 'Int':
        return {
          kind: KindType.Int,
          value,
        };
      case 'Float':
        return {
          kind: KindType.Float,
          value,
        };
      default:
        return {
          kind: KindType.Generic,
          value,
        };
    }
  }
  function parseFunctionType(): FunctionType {
    eat(TokenEnum.LParen);
    const argument = parseType();
    eat(TokenEnum.Arrow);
    const result = parseType();
    eat(TokenEnum.RParen);
    return {
      kind: KindType.Function,
      argument,
      result,
    };
  }

  function parseType(): Type {
    // ((a -> b) -> (c -> d) -> e)
    // make ast with all aligned types'

    if(isToken(TokenEnum.LParen)) {
      return parseFunctionType();
    }
    return parseBaseType();
   
  }

  function program(): ProgramType {
    const body = [parseStatement()];
    while (lex.getToken().type !== TokenEnum.EOF) {
      body.push(parseStatement());
    }
    return {
      kind: Kind.Program,
      body,
    };
  }
};
