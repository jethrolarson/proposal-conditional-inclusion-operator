const pluginTester = require("babel-plugin-tester").default;
const plugin = require("./index");

pluginTester({
  plugin,
  pluginName: "transform-nullish-inclusion",
  formatResult: (code) => code.trim(), // trim leading/trailing newlines
  endOfLine: "lf",
  tests: [
    {
      title: "null and undefined excluded",
      code: `[1, ???null, ???undefined, 2]`,
      output: `[1, ...(null != null ? [null] : []), ...(undefined != null ? [undefined] : []), 2];`,
    },
    {
      title: "falsy but non-nullish values are preserved",
      code: `[???false, ???0, ???""]`,
      output: `[...(false != null ? [false] : []), ...(0 != null ? [0] : []), ...("" != null ? [""] : [])];`,
    },
    {
      title: "conditional expression as argument",
      code: `[???(cond ? "x" : null)]`,
      output: `[...((cond ? "x" : null) != null ? [cond ? "x" : null] : [])];`,
    },
    {
      title: "invalid: ??? used outside array",
      code: `const x = ???value;`,
      error: "'???' operator can only be used directly inside array literals",
    },
  ],
});
