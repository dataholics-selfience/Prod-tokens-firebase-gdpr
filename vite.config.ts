async closeBundle() {
  const redirectsSrc = resolve(__dirname, '_redirects');
  const redirectsDest = resolve(__dirname, 'dist', '_redirects');
  if (fs.existsSync(redirectsSrc)) {
    fs.copyFileSync(redirectsSrc, redirectsDest);
    console.log('✅ _redirects copiado para dist/');
  }
}
