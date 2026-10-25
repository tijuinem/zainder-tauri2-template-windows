#!/usr/bin/env node
/**
 * rename-app.js — Template Rebrander for Zainder Template
 * Usage:
 *   npm run rename -- "MiApp" "com.empresa.miapp"
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const [, , appName, appId] = process.argv;

if (!appName || !appId) {
  console.error('\n❌  Uso: npm run rename -- "NombreApp" "com.empresa.nombreapp"\n');
  process.exit(1);
}
if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/.test(appId)) {
  console.error(`\n❌  Identificador "${appId}" inválido. Usa formato: com.empresa.app\n`);
  process.exit(1);
}

const appNameLower = appName.toLowerCase().replace(/\s+/g, '-');
const appNameRust  = appName.toLowerCase().replace(/[\s-]+/g, '_');

console.log(`\n🏷️  Renombrando a: ${appName} (${appId})\n`);

function patchFile(relPath, patchFn) {
  const absPath = resolve(ROOT, relPath);
  try {
    const original = readFileSync(absPath, 'utf-8');
    const patched  = patchFn(original);
    if (patched === original) { console.log(`  ⏩  ${relPath} (sin cambios)`); return; }
    writeFileSync(absPath, patched, 'utf-8');
    console.log(`  ✅  ${relPath}`);
  } catch (e) { console.error(`  ❌  ${relPath}: ${e.message}`); }
}

patchFile('package.json', (src) => {
  const j = JSON.parse(src);
  j.name = appNameLower; j.description = appName; j.author = appName;
  return JSON.stringify(j, null, 2) + '\n';
});

patchFile('src-tauri/tauri.conf.json', (src) => {
  const j = JSON.parse(src);
  j.productName = appName; j.identifier = appId;
  if (j.app?.windows?.[0]) j.app.windows[0].title = `${appName} — Aplicación de Escritorio`;
  if (j.bundle) { j.bundle.copyright = `Copyright © ${new Date().getFullYear()} ${appName}`; j.bundle.shortDescription = `${appName} Desktop Application`; }
  return JSON.stringify(j, null, 2) + '\n';
});

patchFile('src-tauri/Cargo.toml', (src) => src
  .replace(/^name\s*=\s*"[^"]*"/m, `name = "${appNameRust}"`)
  .replace(/^description\s*=\s*"[^"]*"/m, `description = "${appName}"`)
  .replace(/^authors\s*=\s*\[[^\]]*\]/m, `authors = ["${appName}"]`)
);

patchFile('src-tauri/src/lib.rs', (src) =>
  src.replace(/\.expect\("error while running [^"]+"\)/, `.expect("error while running ${appName} desktop application")`)
);

patchFile('src-tauri/windows/hooks.nsh', (src) =>
  src
    .replace(/taskkill \/F \/IM [a-zA-Z0-9_\.-]+ \/T/g, `taskkill /F /IM ${appName}.exe /T`)
    .replace(/\$DESKTOP\\[a-zA-Z0-9_\.-]+\.lnk/g, `$DESKTOP\\${appName}.lnk`)
    .replace(/\$SMPROGRAMS\\[a-zA-Z0-9_\.-]+\\[a-zA-Z0-9_\.-]+\.lnk/g, `$SMPROGRAMS\\${appName}\\${appName}.lnk`)
    .replace(/\$INSTDIR\\[a-zA-Z0-9_\.-]+\.exe/g, `$INSTDIR\\${appName}.exe`)
);

patchFile('src/components/Navbar.tsx', (src) =>
  src.replace(/brandName="[^"]*"/, `brandName="${appName.toUpperCase()}"`)
);

console.log(`\n🎉  ¡Listo! Recuerda: cambia el icono en src-tauri/icons/ y ejecuta npx tauri build\n`);
