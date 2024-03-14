import { Tokenizer } from "./tokenizer";
import { ProgramType, Kind } from "./types";

export type ParserType = (lex: Tokenizer) => ProgramType;
export type Parser = ReturnType<ParserType>;


export const parser: ParserType = (lex) => {
  
  return {
    kind: Kind.Program,
    body: [],
  };
}


