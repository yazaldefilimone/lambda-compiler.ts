export enum Kind {
  Variable = "Variable",
  Abstraction = "Abstraction",
  Application = "Application",
  Program = "Program",
}

export enum KindType {
  Int = "Int",
  Bool = "Bool",
  Float = "Float",
  Function = "Function",
}
type FreeVariableType = string;
type BoundVariableType = `_${string}`;

type BaseType = {
  kind: KindType.Int | KindType.Bool | KindType.Float,
  value: string;
}


type FunctionType = {
  kind: KindType.Function;
  argument: BaseType;
  result: BaseType;
}
export type VariableType = {
  kind: Kind.Variable;
  name: FreeVariableType;
  t: BaseType;
}
type AbstractionType = {
  kind: Kind.Abstraction;
  variable: BoundVariableType;
  body: TermType;
  t: FunctionType;
}
type ApplicationType = {
  kind: Kind.Application;
  left: TermType;
  right: TermType;
  t: BaseType | FunctionType;
}

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
}

export type Token = {
  type: TokenEnum;
  value: string;
}

export type Maybe<T> = T | null;