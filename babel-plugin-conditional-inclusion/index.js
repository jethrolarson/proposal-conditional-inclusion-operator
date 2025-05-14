const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api) => {
  api.assertVersion(7);
  const t = api.types;

  return {
    name: "transform-conditional-inclusion",
    visitor: {
      UnaryExpression(path) {
        if (path.node.operator !== "???") return;

        if (!t.isArrayExpression(path.parentPath.node)) {
          throw path.buildCodeFrameError(
            "The '???' operator can only be used directly inside array literals."
          );
        }

        const arg = path.node.argument;
        const condition = t.binaryExpression("!=", arg, t.nullLiteral());
        const replacement = t.spreadElement(
          t.conditionalExpression(
            condition,
            t.arrayExpression([arg]),
            t.arrayExpression([])
          )
        );

        path.replaceWith(replacement);
      },
    },
  };
});
