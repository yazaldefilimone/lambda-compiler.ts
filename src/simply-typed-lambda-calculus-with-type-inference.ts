// Definindo o tipo de uma expressão
type Expr =
  | { tag: "Value"; value: number }
  | { tag: "Variable"; name: string }
  | { tag: "Lambda"; param: string; returnType: Type; body: Expr }
  | { tag: "App"; func: Expr; arg: Expr }
  | { tag: "Let"; variable: string; value: Expr; body: Expr }
  | { tag: "Add"; left: Expr; right: Expr }
  | { tag: "Sub"; left: Expr; right: Expr }
  | { tag: "Mul"; left: Expr; right: Expr }
  | { tag: "Div"; left: Expr; right: Expr };

// Definindo o tipo de um tipo
type Type =
  | { tag: "TInt" }
  | { tag: "TVar"; name: string }
  | { tag: "TFun"; paramType: Type; returnType: Type };

// Definindo as substituições de tipos
type Substitution = { original: Type; substitute: Type };
type Substitutions = Substitution[];
type Constraint = { left: Type; right: Type };
type Constraints = Constraint[];

// Função para gerar um nome de variável a partir de um índice
function toVar(n: number): string {
  if (n < 20) return String.fromCharCode(n + 'a'.charCodeAt(0));
  return String.fromCharCode((n % 20) + 'a'.charCodeAt(0)) + "'".repeat(Math.floor(n / 20));
}

// Função para substituir um tipo por outro em uma expressão
function substituteType(expr: Expr, original: Type, substitute: Type): Expr {
  switch (expr.tag) {
    case "Value":
    case "Variable":
      return expr;
    case "Lambda":
      return {
        ...expr,
        body: substituteType(expr.body, original, substitute)
      };
    case "App":
      return {
        tag: "App",
        func: substituteType(expr.func, original, substitute),
        arg: substituteType(expr.arg, original, substitute)
      };
    case "Let":
      return {
        ...expr,
        value: substituteType(expr.value, original, substitute),
        body: substituteType(expr.body, original, substitute)
      };
    case "Add":
    case "Sub":
    case "Mul":
    case "Div":
      return {
        ...expr,
        left: substituteType(expr.left, original, substitute),
        right: substituteType(expr.right, original, substitute)
      };
  }
}

// Função para substituir um tipo por outro em uma restrição
function substituteConstraint(constraint: Constraint, original: Type, substitute: Type): Constraint {
  if(constraint.left === original) {
    return { left: substitute, right: constraint.right };
  }
  if(constraint.right === original) {
    return { left: constraint.left, right: substitute };
  }
  return constraint;
}

// Função para substituir um tipo por outro em uma lista de restrições
function substituteConstraints(constraints: Constraints, original: Type, substitute: Type): Constraints {
  return constraints.map(constraint => substituteConstraint(constraint, original, substitute));
}

// Função para verificar se uma variável de tipo ocorre em outro tipo
function occursCheck(v: Type, c: Type): boolean {
  function freeVar(t: Type): string[] {
    switch (t.tag) {
      case "TInt":
        return [];
      case "TVar":
        return [t.name];
      case "TFun":
        return [...freeVar(t.paramType), ...freeVar(t.returnType)];
    }
  }

  if (v.tag === "TVar") {
    const vars = freeVar(c);
    return vars.includes(v.name);
  }
  return false;
}

// Função para unificar as restrições e produzir substituições de tipo
function unify(constraints: Constraints): Substitutions {
  if (constraints.length === 0) return [];

  const [first, ...rest] = constraints;
  const { left, right } = first;

  if (left.tag === "TVar" && right.tag === "TVar") {
    if (left.name === right.name) {
      return unify(rest);
    } else {
      return [{ original: left, substitute: right }, ...unify(substituteConstraints(rest, left, right))];
    }
  } else if (left.tag === "TVar") {
    if (occursCheck(left, right)) {
      throw new Error(`Failed occurs check: ${left.name} = ${JSON.stringify(right)}`);
    }
    return [{ original: left, substitute: right }, ...unify(substituteConstraints(rest, left, right))];
  } else if (right.tag === "TVar") {
    if (occursCheck(right, left)) {
      throw new Error(`Failed occurs check: ${right.name} = ${JSON.stringify(left)}`);
    }
    return [{ original: right, substitute: left }, ...unify(substituteConstraints(rest, right, left))];
  } else if (left.tag === "TFun" && right.tag === "TFun") {
    return unify([...rest, { left: left.paramType, right: right.paramType }, { left: left.returnType, right: right.returnType }]);
  } else {
    throw new Error(`Failed to unify constraints. ${JSON.stringify(left)} = ${JSON.stringify(right)}`);
  }
}

// Função para reconstruir o tipo a partir das restrições unificadas
function reconstructType(type: Type, substitutions: Substitutions): Type {
  function substituteTypeInSubstitutions(substitutions: Substitutions, original: Type): Type {
    const substitution = substitutions.find(s => s.original === original);
    if (substitution) {
      return substitution.substitute;
    }
    return original;
  }

  switch (type.tag) {
    case "TInt":
      return { ...type };
    case "TVar":
      return substituteTypeInSubstitutions(substitutions, type);
    case "TFun":
      return {
        tag: "TFun",
        paramType: reconstructType(type.paramType, substitutions),
        returnType: reconstructType(type.returnType, substitutions)
      };
  }
}

// Função para criar as restrições a partir de uma expressão
function constraints(expr: Expr): [Type, Constraints] {
  let nextVarIndex = 0;

  function freshVar(): Type {
    return { tag: "TVar", name: toVar(nextVarIndex++) };
  }

  function constraintsHelper(expr: Expr, env: Map<string, Type>): [Type, Constraints] {
    switch (expr.tag) {
      case "Value":
        return [{ tag: "TInt" }, []];
      case "Variable":
        const type = env.get(expr.name);
        if (!type) {
          throw new Error(`Unbound variable: ${expr.name}`);
        }
        return [type, []];
      case "Lambda":
        const paramType = freshVar();
        const [_bodyType, bodyConstraints] = constraintsHelper(expr.body, new Map(env).set(expr.param, paramType));
        const _type = { tag: "TFun", paramType, returnType: _bodyType } as const;
        return [_type, bodyConstraints];
      case "App":
        const [funcType, funcConstraints] = constraintsHelper(expr.func, env);
        const [argType, argConstraints] = constraintsHelper(expr.arg, env);
        const returnType = freshVar();
        const newConstraints: Constraints = [...funcConstraints, ...argConstraints, { left: funcType, right: { tag: "TFun", paramType: argType, returnType } }];
        return [returnType, newConstraints];
      case "Let":
        const [valueType, valueConstraints] = constraintsHelper(expr.value, env);
        const [bodyType, bodyConstraints2] = constraintsHelper(expr.body, new Map(env).set(expr.variable, valueType));
        return [bodyType, [...valueConstraints, ...bodyConstraints2]];
      case "Add":
      case "Sub":
      case "Mul":
      case "Div":
        return [{ tag: "TInt" }, []];
    }
  }

  return constraintsHelper(expr, new Map());
}

// Função para avaliar uma expressão
function evalExpr(expr: Expr, env: Map<string, number>): number {
  switch (expr.tag) {
    case "Value":
      return expr.value;
    case "Variable":
      const value = env.get(expr.name);
      if (value === undefined) {
        throw new Error(`Unbound variable: ${expr.name}`);
      }
      return value;
    case "Lambda":
      return 0; // do anything for now
    case "App":
      const funcValue = evalExpr(expr.func, env) as any;
      const argValue = evalExpr(expr.arg, env);
      // Aqui, assumindo que só estamos lidando com funções unárias
      // here, I assume that we are only dealing with unary functions
      if(typeof funcValue !== "function") {
        throw new Error("Not a function: " + funcValue);
      }
      return funcValue(argValue);
    case "Let":
      const newValue = evalExpr(expr.value, env);
      return evalExpr(expr.body, new Map(env).set(expr.variable, newValue));
    case "Add":
      return evalExpr(expr.left, env) + evalExpr(expr.right, env);
    case "Sub":
      return evalExpr(expr.left, env) - evalExpr(expr.right, env);
    case "Mul":
      return evalExpr(expr.left, env) * evalExpr(expr.right, env);
    case "Div":
      const divisor = evalExpr(expr.right, env);
      if (divisor === 0) {
        throw new Error("Division by zero");
      }
      return evalExpr(expr.left, env) / divisor;
  }
}

// Função para avaliar uma expressão e reconstruir seu tipo
function evalAndReconstruct(expr: Expr): Type {
  try {
    const [type, _constraints] = constraints(expr);
    const substitutions = unify(_constraints);
    const finalType = reconstructType(type, substitutions);
    return finalType;
  } catch (error: any) {
    console.error(error.message);
    return { tag: "TInt" }; // Retorna um tipo padrao em caso de erro
  }
}

// Exemplo de uso
const expr: Expr = {
  tag: "Let",
  variable: "x",
  value: {
    tag: "Lambda",
    param: "y",
    returnType: { tag: "TInt" },
    body: {
      tag: "Add",
      left: { tag: "Variable", name: "x" },
      right: { tag: "Variable", name: "y" }
    }
  },
  body: {
    tag: "App",
    func: { tag: "Variable", name: "x" },
    arg: { tag: "Value", value: 10 }
  }
};

console.log(evalAndReconstruct(expr)); // Output: { tag: "TInt" }
