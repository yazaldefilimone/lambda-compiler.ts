import { Tokenizer } from './tokenizer';
import {
  ProgramType,
  Kind,
  TokenEnum,
  KindType,
  TermType,
  AbstractionType,
  VariableType,
  Type,
  FunctionType,
  BaseType,
  Maybe,
} from './types';

export type ParserType = (lex: Tokenizer) => ProgramType;
export type Parser = ReturnType<ParserType>;

type B = KindType.Bool | KindType.Int | KindType.Float;

const tableBaseType = new Map<string, B>([
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
      throw new Error(`unexpected token: ${current.value}, expected: ${type}`);
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
    // (x r y...) consume until no more right parens
    eat(TokenEnum.LParen);
    let term: TermType = parseStatement();
    while (!isToken(TokenEnum.RParen)) {
      term = {
        kind: Kind.Application,
        left: term,
        right: parseStatement(),
        t: null,
      };
    }
    eat(TokenEnum.RParen);
    return term;
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
    const kind = tableBaseType.get(value);
    return {
      kind: kind || KindType.Generic,
      value,
    };
  }
  function parseFunctionType(): BaseType | FunctionType {
    // (a -> b -> (c -> d) -> e... consume until no more arrows
    eat(TokenEnum.LParen);
    let argument = parseType();
    while (isToken(TokenEnum.Arrow)) {
      eat(TokenEnum.Arrow);
      const result = parseType();
      argument = {
        kind: KindType.Function,
        argument,
        result,
      };
    }
    eat(TokenEnum.RParen);
    return argument;
  }

  function parseGenericType(): BaseType {
    const value = eat(TokenEnum.Identifier).value;
    return {
      kind: KindType.Generic,
      value,
    };
  }

  function parseType(): Type {
    if (isToken(TokenEnum.LParen)) {
      return parseFunctionType();
    }
    if (tableBaseType.has(current.value)) {
      return parseBaseType();
    }
    return parseGenericType();
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
