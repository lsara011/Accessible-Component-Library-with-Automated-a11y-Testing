import type { Preview, ReactRenderer } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/index.css'
import './preview.css'
const preview: Preview = {
  initialGlobals: { theme: 'light' },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    // The theme switcher owns the canvas background as well as component colors.
    backgrounds: { disable: true },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error'
    }
  },
};

export default preview;
