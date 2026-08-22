export const createDefaultDarkThemePlugin = () => ({
  getHead: () => (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
  try {
    var key = 'theme';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();`,
      }}
    />
  ),
})
