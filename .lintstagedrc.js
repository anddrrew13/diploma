module.exports = {
    // Type check TypeScript files
    '**/*.ts': () => 'tsc --noEmit',
  
    // Lint & Prettify TS and JS files
    '**/*.(js|ts),!.lintstagedrc.js': (filenames) => [
      `eslint ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`,
    ],
  };
  