# Nullish Conditional Inclusion Operator (`???`)

You can browse the [ecmarkup output](https://jethrolarson.github.io/proposal-conditional-inclusion-operator
/)
or browse the [source](https://github.com/jethrolarson/proposal-conditional-inclusion-operator
/blob/HEAD/spec.emu).

## Status

This proposal is currently Stage 0. It is seeking feedback and a champion within TC39

## Summary

Introduce a new unary operator `???`, usable only within array literals, that conditionally includes a single value based on nullish-ness (`null` or `undefined`). This operator provides a concise alternative to the common pattern `...(x != null ? [x] : [])`.


## Motivation

JavaScript developers frequently include optional elements in arrays based on nullish values. The current idiomatic way to do this is:

```js
const arr = [
  ...someArray,
  ...(maybeValue != null ? [maybeValue] : []),
  ...anotherArray
];
```

This pattern is verbose, visually noisy, and semantically more complex than necessary for such a simple conditional inclusion.

By introducing a `???` operator:

```js
const arr = [
  ...someArray,
  ???maybeValue,
  ...anotherArray
];
```

We gain clarity and brevity without changing runtime semantics or introducing new types.


## Syntax and Semantics

* `???expr` is only valid **within array literals**.
* The operator evaluates `expr`.

  * If the result is `null` or `undefined`, it contributes nothing to the array.
  * Otherwise, the result is included as a single element.
* The expression is always evaluated eagerly (no laziness implied).

### Examples

```js
// Valid use cases:
[1, ???null, 3]        // [1, 3]
[1, ???42, 3]          // [1, 42, 3]
[???false, ???0]       // [false, 0]
[???undefined]         // []
[???getVal()]          // Evaluates getVal(), includes result if non-nullish

// Invalid or disallowed usage:
const x = ???value;    // SyntaxError — not valid outside array literals
[...(???value)]        // SyntaxError — cannot be used in spread expression
[???...value]          // SyntaxError — spread cannot be nested in ???
[...???value]          // SyntaxError — ??? is not a standalone expression
```

Note: The `???` operator is only valid as a top-level element inside array literals. It does not evaluate to a value and cannot be composed with other expressions or operators.

```js
[1, ???null, 3]        // [1, 3]
[1, ???42, 3]          // [1, 42, 3]
[???false, ???0]       // [false, 0]
[???undefined]         // []
[???getVal()]          // Evaluates getVal(), includes result if non-nullish
```

### Invalid Usage

```js
const x = ???value;    // SyntaxError — operator not valid outside array literals
```


## Desugaring

The following transformation defines the semantics clearly:

```js
[1, ???x, 2]
// becomes:
[1, ...(x != null ? [x] : []), 2]
```


## Open Questions

* Should `???` be generalized to objects (e.g., conditional key inclusion)?
* Would tooling (ESLint, Babel) adopt it cleanly?


## Operator Naming Rationale

The operator `???` was chosen to evoke two key associations in JavaScript developers' mental models:

* Its resemblance to the nullish coalescing operator `??` signals that it is related to null/undefined handling.
* Its triple-character form parallels the spread operator `...`, indicating structural inclusion within array literals.

This blend of familiar cues supports immediate understanding: `???` includes a value *if it is not nullish*, just as `...` expands values *if they are iterable*. The visual parallel helps position `???` as a structural, presence-dependent operator without suggesting iterable semantics.

Crucially, `???` is not an expression-level operator and does not introduce new evaluation rules or coercions. It is purely syntactic sugar for a very common pattern.

## Implementation Strategy

This proposal desugars directly to `...(x != null ? [x] : [])` and I plan to implement a babel plugin to prototype this soon.

## Q & A
**Q:** Why is this a syntax operator and not a function like `nonNullishOf(x)`?

**A:** The use case is inherently syntactic—conditional inclusion of values during array construction. A helper like `nonNullishOf(x)` would require writing:

```js
const arr = [
  ...someArray,
  ...nonNullishOf(value),
  ...anotherArray
];
```

This introduces both verbosity and a shift in abstraction: the developer must now think about mapping from nullable values into arrays, and then unwinding them via spread. In contrast, the `???` operator keeps the developer in value space, expressing intent declaratively without structural manipulation.

**Q**: Why does this need new syntax instead of using existing JavaScript patterns?

**A:** The idiom `...(x != null ? [x] : [])` is common but verbose and visually noisy. The `???` operator expresses the same intention declaratively and more clearly, avoiding duplication and mental overhead. This also side-steps some unintentional bugs like `...(x ? [x] : [])` leading to unintentional inclusion of falsy values.

**Q**: Why not generalize this beyond array literals or to more complex cases?

**A:** This is my first TC39 proposal so I want to keep it small and well contained. Generalization (e.g. object keys, control flow, etc.) may be useful in future proposals but would add a lot of complexity that could be hard to come to agreement on.

**Q:** Does this operator introduce ambiguity with existing syntax like `...` or `??`?

**A:** Potentially, particularly for developers with visual or reading impairments. The similarity between `??` and `???` could pose an accessibility concern, much like `==` vs. `===` or `!` vs. `!=`. However, the operator is valid only inside array literals, and its semantics are distinct from both `...` (spread) and `??` (nullish coalescing). These restrictions limit ambiguity and reduce the risk of accidental misuse.

**Q:** How does this interact with transpilation or older runtimes?

**A:** The operator desugars to `...(x != null ? [x] : [])`, which is fully compatible with all modern JavaScript environments. It can be easily implemented in Babel or similar tools. In runtimes that don’t support it natively, use will result in a syntax error—just like with `??`, `?.`, or `...` when they were newly introduced.
