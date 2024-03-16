import { ProgramType } from "types";

export type NormalizerType = (program: ProgramType) => {
  normalize: () => ProgramType,
}
export type Normalizer = ReturnType<NormalizerType>;

export const normalizer: NormalizerType = (program) => {
  return {
    normalize,
  }
  function normalize() {
    return program
  }
}