import { tokenizer } from "tokenizer"
import { parse } from "parse";
import { normalizer } from "normalizer";
import { checker } from "checker";
import { compute } from "compute";

function main() {
  const test = `λx. (x x) λx. (x x)` // !todo fix this (prevent infinite loop)
  const lam = `(λf.λx.(f (f x)) λg.λy.(g (g y)))`
  const lam_type = `(λf:((a->a)->a->a).λg:(a->a).λy:a.(g (g y)))`
  const lex = tokenizer(test)
  const program = parse(lex);
  const checked = checker(program).bind();
  const normalized = normalizer(checked).normalize();
  const str = compute(normalized).computed()
  console.log(str)}

main()
