import { tokenizer } from "./tokenizer"

function main() {
  const test = `λx. (x x) λx. (x x)`
  const typedTest = `λx:Bool. (x x) λx:Bool. (x x)`
  const result = tokenizer(test).getTokens();
  const typedResult = tokenizer(typedTest).getTokens();
  console.log("Simple Lambda Calculus:")
  console.log(result);
  console.log("--------------------------------------------------")
  console.log("Typed Lambda Calculus:")
  console.log(typedResult);
}

main()