export const createDefaultDarkThemePlugin = () => ({
  getHead: () => (
    <script>{`(() => {
  try {
    var key = 'theme';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();`}</script>
  ),
})
