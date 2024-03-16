import { Maybe, Token, TokenEnum } from "./types";

const specs = [
  // dot
  [/^\./, TokenEnum.Dot],
  // lambda
  [/^\\/, TokenEnum.Lambda],
  // lambda
  [/^λ/, TokenEnum.Lambda],
  // lparen
  [/^\(/, TokenEnum.LParen],
  // rparen
  [/^\)/, TokenEnum.RParen],
  // identifier
  [/^[a-zA-Z]+/, TokenEnum.Identifier],
  // colon
  [/^:/, TokenEnum.Colon],
  // arrow
  [/^->/, TokenEnum.Arrow],
  // space
  [/^\s+/, null],
] as const;


type TokenizerType = (str: string) => {
  next: () => Token;
  getToken: () => Token;
  peek: () => Token;
  getTokens: () => Token[];
}

export type Tokenizer = ReturnType<TokenizerType>;
const TokenEOF: Token = { type: TokenEnum.EOF, value: "" };
export const tokenizer: TokenizerType = (str) => {
  const _str = str;
  let _cursor = 0;
  let token: Token = TokenEOF;
  next()
  return {
    next,
    getToken,
    peek,
    getTokens,
  }

  function next() {
    if(!_isHasToken()) {
      token = TokenEOF
      return TokenEOF
    }
    const current = _str.slice(_cursor);
    for (const [regex, type] of specs) {
      const matched = _match(current, regex);
      if(matched === null) {
        continue;
      }
      if(type === null) {
        return next();
      }

      token = { type, value: matched };
      return token;
    }
    throw new Error(`lex error: unexpected token: ${current}`);
  }

  // peeks
  function peek() {
    const cursor = _cursor;
    const token = next();
    _cursor = cursor;
    return token;
  }
  function getToken() {
    return token;
  }

  function getTokens() {
    const tokens: Token[] = [];
    let currentToken = next();
    while(true) {
      tokens.push(currentToken);
      if(currentToken.type === TokenEnum.EOF) break;
      currentToken = next();
    }
    return tokens;
  }


  function _isHasToken() {
    return _cursor < _str.length;
  }

  function _match(value:string, regex:RegExp) {
    const matched = regex.exec(value);
    if (matched === null) {
      return null;
    }
    _cursor += matched[0].length;
    return matched[0];
  }

}