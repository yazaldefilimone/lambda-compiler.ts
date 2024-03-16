import { tokenizer } from "./tokenizer"
import { parse } from "./parse";

function main() {
  const test = `λx. (x x) λx. (x x)`
  const two =  `λx. (λy. (x y))`
  const three = `λx. (λy. (λz. (x (y z))))`
  const four = `λx. (λy. (λz. (λw. (x (y (z w))))))`
  const typedTest = `λx:Bool. (x x) λx:Bool. (x x)`
  const typedTwo =  `λx:Bool. (λy:Bool. (x y))`
  const typedThree = `λx:Bool. (λy:Bool. (λz:Bool. (x (y z))))`
  const typedFour = `λx:Bool. (λy:Bool. (λz:Bool. (λw:Bool. (x (y (z w))))))`
  const typeFn =  `λx:(Bool -> a). (x x) λx:Bool. (x x)`
  const typeFn2 =  `λx:(Bool -> Bool). (λy:Bool. (x y))`

  const complex = `
  (λx: ((Bool -> a) -> (Float -> b) -> c).
  λy: (Bool -> a).
  λz: (Float -> b).
    (x y z) False)
  `


  // const result = tokenizer(four).getTokens();
  const lex = tokenizer(`
  ${test}

  ${two}

  ${three}

  ${four}
  `)
  // console.log("Simple Lambda Calculus:")
  // console.log(result);
  // console.log("--------------------------------------------------")
  // console.log("Typed Lambda Calculus:")
  // console.log(typedResult);
  const parsed = parse(lex);
  console.log(JSON.stringify(parsed, null, 2));

}

main()