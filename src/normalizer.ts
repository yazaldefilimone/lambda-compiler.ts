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
    const bodyNormalize: TermType[] = [];
    for (let term of program.body) {
      bodyNormalize.push(termNormalize(term));
    }
    return {
      ...program,
      body: bodyNormalize,
    };
  }
}

function termNormalize(term: TermType): TermType {
  switch (term.kind) {
    case Kind.Variable:
      return variableNormalize(term);
    case Kind.Abstraction:
      return abstractionNormalize(term);
    case Kind.Application:
      return applicationNormalize(term);
  }
}

function variableNormalize(term: VariableType): TermType {
  return term;
}

function abstractionNormalize(term: AbstractionType): TermType {
  const normalizedBody = termNormalize(term.body);
  const clonedType = term.t ? cloneTypeTerm(term.t) as FunctionType: null
  return {
    ...term,
    body: normalizedBody,
    t: clonedType,
  };
}

function applicationNormalize(term: ApplicationType): TermType {
  const normalizedLeft = termNormalize(term.left);
  const normalizedRight = termNormalize(term.right);

  if (normalizedLeft.kind === Kind.Abstraction && normalizedRight.t?.kind === KindType.Function) {
    return substitute(normalizedLeft.body, normalizedLeft.variable.name, normalizedRight);
  }

  return {
    ...term,
    left: normalizedLeft,
    right: normalizedRight,
  };
}

function substitute(term: TermType, variable: string, replacement: TermType): TermType {
  switch (term.kind) {
    case Kind.Variable:
      return term.name === variable ? replacement : term;
    case Kind.Abstraction:
      if (term.variable.name === variable) {
        return term;
      }
      const normalizedBody = substitute(term.body, variable, replacement);
      return {
        ...term,
        body: normalizedBody,
      };
    case Kind.Application:
      const substitutedLeft = substitute(term.left, variable, replacement);
      const substitutedRight = substitute(term.right, variable, replacement);
      return {
        ...term,
        left: substitutedLeft,
        right: substitutedRight,
      };
  }
}

function cloneTypeTerm(term: Type): Type {
  switch (term.kind) {
    case KindType.Int:
    case KindType.Bool:
    case KindType.Float:
    case KindType.Generic:
      return term;
    case KindType.Function:
      return {
        kind: KindType.Function,
        argument: cloneTypeTerm(term.argument),
        result: cloneTypeTerm(term.result),
      };
  }
}
