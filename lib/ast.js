import { parse } from 'acorn';
import { simple } from 'acorn-walk';

export function extractRegistrations(source) {
  const ast = parse(source, { ecmaVersion: 2022 });
  const registrations = [];

  simple(ast, {
    ClassDeclaration(node) {
      if (node.superClass?.name !== 'HTMLElement') return;

      const hasTagName = node.body.body.some(
        m => m.type === 'PropertyDefinition' &&
          m.static === true &&
          m.key.name === 'tagName'
      );

      if (hasTagName) {
        registrations.push(`customElements.define(${node.id.name}.tagName,${node.id.name});`);
      }
    },
  });

  return registrations.join('');
}

// Tagged template literal that strips whitespace for inlined HTML strings
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) =>
    acc + (i > 0 ? values[i - 1] : '') + str.split('\n').map(s => s.trim()).filter(Boolean).join(''),
    ''
  );
}

export function processTemplates(code) {
  const ast = parse(code, { ecmaVersion: 2022 });
  const replacements = [];
  const htmlQuasiStarts = new Set();

  simple(ast, {
    TaggedTemplateExpression(node) {
      if (node.tag.type === 'Identifier' && node.tag.name === 'html')
        htmlQuasiStarts.add(node.quasi.start);
    },
  });

  simple(ast, {
    TaggedTemplateExpression(node) {
      if (node.tag.type !== 'Identifier' || node.tag.name !== 'html') return;
      const { quasis, expressions } = node.quasi;
      let result = '`';
      for (let i = 0; i < quasis.length; i++) {
        result += (quasis[i].value.cooked ?? quasis[i].value.raw)
          .split('\n').map(s => s.trim()).filter(Boolean).join('');
        if (i < expressions.length)
          result += '${' + code.slice(expressions[i].start, expressions[i].end) + '}';
      }
      replacements.push({ start: node.start, end: node.end, replacement: result + '`' });
    },

    TemplateLiteral(node) {
      if (htmlQuasiStarts.has(node.start)) return;
      const { quasis, expressions } = node;
      let result = '`';
      for (let i = 0; i < quasis.length; i++) {
        result += (quasis[i].value.cooked ?? quasis[i].value.raw)
          .split('\n').map(s => s.trim()).filter(Boolean).join('').trim();
        if (i < expressions.length)
          result += '${' + code.slice(expressions[i].start, expressions[i].end) + '}';
      }
      replacements.push({ start: node.start, end: node.end, replacement: result + '`' });
    },
  });

  replacements.sort((a, b) => b.start - a.start);
  for (const { start, end, replacement } of replacements)
    code = code.slice(0, start) + replacement + code.slice(end);

  return code;
}
