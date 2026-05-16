#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const repoRoot = process.cwd();
const roots = ["src/app", "src/components", "src/data"];
const extensions = new Set([".ts", ".tsx"]);
const checkedAttributes = new Set([
  "aria-label",
  "alt",
  "label",
  "placeholder",
  "title",
]);

const ignoredText = new Set([".", ",", ":", ";", "/", "|", "·", "—", "-", "+", "v", "x", "s", "&#x2022;"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasLetters(value) {
  return /[A-Za-z]/.test(value);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function lineAndColumn(sourceFile, pos) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, column: character + 1 };
}

function shouldIgnore(value) {
  const text = normalize(value);
  if (!text || ignoredText.has(text)) return true;
  if (!hasLetters(text)) return true;
  if (/^[A-Z0-9_./:-]+$/.test(text)) return true;
  if (/^[~./\\\w-]+\.[\w-]+$/.test(text)) return true;
  if (/^[\w.-]+@[\w.-]+$/.test(text)) return true;
  if (/^~?[./\\\w-]+(\/[\w.-]+)+$/.test(text)) return true;
  if (/^[\w.-]+:\/\/[\w./:-]+$/.test(text)) return true;
  if (/^[\d.]+s$/.test(text)) return true;
  if (/^P\d+( \/ P\d+)+$/.test(text)) return true;
  if (/^\[[\w,\s-]+\]$/.test(text)) return true;
  if (/^(http|https|mailto):/.test(text)) return true;
  if (/^#[a-fA-F0-9]{3,8}$/.test(text)) return true;
  if (/^[a-z]+-[a-z0-9-]+$/.test(text)) return true;
  return false;
}

const findings = [];

for (const root of roots) {
  for (const file of walk(path.join(repoRoot, root))) {
    const source = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    function add(kind, value, node) {
      const text = normalize(value);
      if (shouldIgnore(text)) return;
      const position = lineAndColumn(sourceFile, node.getStart(sourceFile));
      findings.push({
        file: path.relative(repoRoot, file).replace(/\\/g, "/"),
        line: position.line,
        column: position.column,
        kind,
        text,
      });
    }

    function visit(node) {
      if (ts.isJsxText(node)) {
        add("jsx-text", node.getText(sourceFile), node);
      }

      if (
        ts.isJsxAttribute(node) &&
        checkedAttributes.has(node.name.getText(sourceFile)) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        add(`attribute:${node.name.getText(sourceFile)}`, node.initializer.text, node);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  for (const finding of findings) {
    console.log(`${finding.file}:${finding.line}:${finding.column} ${finding.kind} ${finding.text}`);
  }
  console.log(`\n${findings.length} hardcoded UI string candidate${findings.length === 1 ? "" : "s"}.`);
}
