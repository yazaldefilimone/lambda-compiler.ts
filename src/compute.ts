import { AbstractionType, ApplicationType, Kind, KindType, ProgramType, TermType, Type, VariableType } from 'types';
const context = new Map<string, any>();
type Context = typeof context;
export function compute(program: ProgramType) {
  function computed() {
    let text = '';
    for (let term of program.body) {
      text += termComputed(term, context);
    }
    return text;
  }
  return {
    computed,
  }
}

function termComputed(term: TermType, context: Context): string {
  switch (term.kind) {
    case Kind.Variable:
      return variableComputed(term, context);
    case Kind.Abstraction:
      return abstractionComputed(term, context);
    case Kind.Application:
      return applicationComputed(term, context);
  }
}

function variableComputed(term: VariableType, context: Context): string {
  // ignore type
  return term.name;
}

function abstractionComputed(term: AbstractionType, context: Context): string {
  let text = `λ${term.variable.name}`;
  if (term.variable.t) {
    text += `:${typeComputed(term.variable.t, context)}`;
  }
  text += `.${termComputed(term.body, context)}`;
  return text;
}

function applicationComputed(term: ApplicationType, context: Context): string {
  return `(${termComputed(term.left, context)} ${termComputed(term.right, context)})`;
}

function typeComputed(term: Type, context: Context): string {
  switch (term.kind) {
    case KindType.Int:
    case KindType.Bool:
    case  KindType.Float:
      return term.value;
    case  KindType.Function:{
      let text = '(';
      text += typeComputed(term.argument, context);
      text += ' -> ';
      text += typeComputed(term.result, context);
      text += ')';
      return text;
    }
     
    case  KindType.Generic:
      return term.value;
  }
}
