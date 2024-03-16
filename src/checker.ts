import { Kind, ProgramType, TermType } from "types";

type CheckerType = (program: ProgramType) => {
   bind: () => ProgramType,
   errors: () => string[],
  }
export type Checker = ReturnType<CheckerType>;

export const checker: CheckerType = (program) => {
  return {
    bind,
    errors,
  }

  function bind() {
    const bodyBind = program.body.map(bindTerm);
    return {
      ...program,
      body: bodyBind,
    };
  }
  function errors() {
    return []
  }
}


function bindTerm(term: TermType) {
  switch (term.kind) {
    case Kind.Variable:
      return bindVariable(term);
    case Kind.Abstraction:
      return bindAbstraction(term);
    case Kind.Application:
      return bindApplication(term);
  }
}

function bindVariable(term: TermType) {
  return term;
}
function bindAbstraction(term: TermType) {
  return term;
}

function bindApplication(term: TermType) {
  return term;
}