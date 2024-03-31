import { ContextTabeleTypes, contextTabeleTypes } from "context";
import { AbstractionType, ApplicationType, Kind, KindType, ProgramType, TermType, VariableType } from "types";

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
    const bodyBind= bindTerm(program.body, contextTabeleTypes)
    return {
      ...program,
      body: bodyBind,
    };
  }
  function errors() {
    return []
  }
}


function bindTerm(term: TermType, context: ContextTabeleTypes) {
  switch (term.kind) {
    case Kind.Variable:
      return bindVariable(term, context);
    case Kind.Abstraction:
      return bindAbstraction(term, context);
    case Kind.Application:
      return bindApplication(term, context);
  }
}

function bindVariable(term: VariableType, context: ContextTabeleTypes): TermType {
  const t = context.get(term.name);
  term.t = t || term.t;
  return term;
}
function bindAbstraction(term: AbstractionType, context: ContextTabeleTypes): TermType {
  const t = term.variable.t || {
    kind: KindType.Generic,
    value: 'a',
  }
  context.set(term.variable.name, t);
  term.body = bindTerm(term.body, context);
  if(!term.body.t) {
    throw new Error("Type not defined")
  }
  term.t = term.t || {
    kind: KindType.Function,
    argument: t,
    result: term.body.t
  }
  return term;
}

function bindApplication(term: ApplicationType, context: ContextTabeleTypes): TermType {
  term.left = bindTerm(term.left, context);
  term.right = bindTerm(term.right, context);
  term.left.t = term.left.t || {
      kind: KindType.Function,
      argument: bindTerm(term.right, context).t as any,
      result: bindTerm(term.right, context).t as any
  }
  term.right.t = term.right.t || bindTerm(term.right, context).t as any;
  if(term.left.t.kind !== KindType.Function && term.left.t.kind !== KindType.Generic) {
    throw new Error(`Expected function type, got ${term.left.t.kind}`)
  }
  if(term.left.t.kind === KindType.Function){
    if(term.left.t.argument.kind !== term.right.t?.kind && term.left.t.argument.kind !== KindType.Generic) {
      throw new Error(`Expected ${term.left.t.argument.kind}, got ${term.right.t?.kind}`)
    }
    term.t = term.left.t.result;
    return term;
  }

    term.t = term.left.t;
    return term;
}

