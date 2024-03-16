export enum Kind {
  Variable = "Variable",
  Abstraction = "Abstraction",
  Application = "Application",
  Program = "Program",
}

// include generic type
export enum KindType {
  Int = "Int",
  Bool = "Bool",
  Float = "Float",
  Function = "Function",
  Generic = "Generic",
}
type FreeVariableType = string;
type BoundVariableType = `_${string}`;

export type BaseType = {
  kind: KindType.Int | KindType.Bool | KindType.Float | KindType.Generic,
  value: string;
}


export type FunctionType = {
  kind: KindType.Function;
  argument: BaseType | FunctionType;
  result: BaseType | FunctionType;
}
export type VariableType = {
  kind: Kind.Variable;
  name: FreeVariableType;
  t: Maybe<BaseType | FunctionType>;
}
export type AbstractionType = {
  kind: Kind.Abstraction;
  variable: VariableType;
  body: TermType;
  t: Maybe<FunctionType>;
}
export type ApplicationType = {
  kind: Kind.Application;
  left: TermType;
  right: TermType;
  t: Maybe<BaseType | FunctionType>;
}

export type Type = BaseType | FunctionType;
export type TermType = VariableType | AbstractionType | ApplicationType;


export type ProgramType = {
  kind: Kind.Program;
  body: TermType[];
}


export enum TokenEnum {
  Identifier = "Identifier",
  Lambda = "Lambda",
  Dot = "Dot",
  LParen = "LParen",
  RParen = "RParen",
  EOF = "EOF",
  Colon = "Colon",
  Arrow = "Arrow",
}

export type Token = {
  type: TokenEnum;
  value: string;
}

export type Maybe<T> = T | null;