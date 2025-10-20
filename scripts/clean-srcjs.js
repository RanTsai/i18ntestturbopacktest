// scripts/clean-srcjs.js
import { rmSync, readdirSync, statSync } from "fs";
import { join } from "path";

const exts = [".js", ".jsx", ".map", ".d.ts"];

function walk(dir) {
  for (const file of readdirSync(dir)) {
    const full = join(dir, file);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      walk(full);
    } else {
      if (exts.some(ext => full.endsWith(ext))) {
        console.log("🧹 Removing:", full);
        rmSync(full);
      }
    }
  }
}

// 只掃描 src 目錄
walk(join(process.cwd(), "src"));
console.log("✅ Clean done: removed stray build artifacts in src/");
