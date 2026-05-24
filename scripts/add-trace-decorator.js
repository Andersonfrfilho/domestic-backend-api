#!/usr/bin/env node
/**
 * Add @TraceMethod() decorator to concrete method implementations
 * (not to interface methods, abstract methods, or field declarations)
 */

const fs = require('fs');
const path = require('path');

const TRACE_IMPORT = "import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';";

function hasTraceImport(content) {
  return content.includes('TraceMethod');
}

function addTraceImport(content) {
  if (hasTraceImport(content)) return content;

  // Find the first import statement
  const lines = content.split('\n');
  let insertIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i + 1;
    } else if (lines[i].trim().length > 0 && !lines[i].startsWith('import')) {
      break;
    }
  }

  lines.splice(insertIndex, 0, TRACE_IMPORT);
  return lines.join('\n');
}

function decorateMethod(content) {
  // Only decorate actual method implementations in classes
  // Skip: interfaces, abstract classes, method signatures without bodies

  const lines = content.split('\n');
  const result = [];
  let inClass = false;
  let classDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track if we're in a class definition
    if (trimmed.includes('class ') && !trimmed.includes('interface')) {
      inClass = true;
    }

    // Check if this line has a method that needs decoration
    if (
      inClass &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.includes('interface') &&
      !trimmed.includes('abstract') &&
      (trimmed.match(/^\w+\s*\(/) || // method(params)
       trimmed.match(/^(async\s+)?\w+\s*\(/) || // async method() or method()
       trimmed.match(/^(async\s+)?get\s+\w+\s*\(/)) && // getter
      !trimmed.startsWith('@') && // not already decorated
      i + 1 < lines.length
    ) {
      // Look ahead to ensure there's a body on the next line (not just a signature)
      let hasBody = false;
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('{')) {
          hasBody = true;
          break;
        }
        if (lines[j].includes(';')) {
          // Method signature without body (interface or abstract)
          hasBody = false;
          break;
        }
      }

      if (hasBody && !trimmed.startsWith('constructor')) {
        // Add decorator
        result.push(line.replace(trimmed, `@TraceMethod()\n${line.match(/^\s*/)[0]}${trimmed}`));
        continue;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Only process files that are likely to have services/use-cases
  if (!filePath.includes('service.ts') && !filePath.includes('use-case.ts')) {
    return;
  }

  const hasChanges = false;

  // Add import if needed
  if (!hasTraceImport(content)) {
    content = addTraceImport(content);
  }

  // For now, we'll manually handle specific files
  // This requires more careful AST parsing

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${filePath}`);
  }
}

// Find all TypeScript files
function findFiles(dir, pattern = /\.(service|use-case)\.ts$/) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && pattern.test(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} potential files for decoration`);
console.log('Manual review required - using safer approach in main code');
