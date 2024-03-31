import { AbstractionType, ApplicationType, FunctionType, Kind, KindType, ProgramType, TermType, Type, VariableType } from "types";

export type NormalizerType = (program: ProgramType) => {
  normalize: () => ProgramType,
}
export type Normalizer = ReturnType<NormalizerType>;



export const normalizer: NormalizerType = (program) => {
  return {
    normalize,
  };

  function normalize() {
    const body = reduce(program.body)
    return {
      ...program,
      body,
    }
  }
}

function reduce(term: TermType): TermType {
  switch (term.kind) {
    case Kind.Variable:
      return term;
    case Kind.Abstraction:
      return reduceAbstraction(term);
    case Kind.Application:
      return reduceApplication(term);
  }
}
function reduceAbstraction(term: AbstractionType): TermType {
  term.body = reduce(term.body);
  return {
    ...term,
    body: term.body,
  };
}

function reduceApplication(term: ApplicationType): TermType {
  if(term.left.kind === Kind.Abstraction) {
    const left_normal = reduce(term.left);
    const right_normal = reduce(term.right);
    return reduce(apply(left_normal, right_normal));
  }
  term.left = reduce(term.left);
  term.right = reduce(term.right);
  return term;
}


function apply(term: TermType, arg: TermType): TermType {
  if(term.kind === Kind.Abstraction) {
    return substitute(term.body, term.variable, arg);
  }
  return term;
}

function substitute(term: TermType, variable: VariableType, arg: TermType): TermType {
  switch (term.kind) {
    case Kind.Variable:
      return term.name === variable.name ? arg : term;
    case Kind.Abstraction:
      return {
        ...term,
        body: substitute(term.body, variable, arg),
      };
    case Kind.Application:
      return {
        ...term,
        left: substitute(term.left, variable, arg),
        right: substitute(term.right, variable, arg),
      };
  }
}

