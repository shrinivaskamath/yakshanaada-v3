import { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import { usePlayback } from './PlaybackContext';
import { logScreenView } from './firebase';
import { useVisitCount } from './useVisitCount';
import { assetUrl } from './audio/engine';
import Shruthi from './screens/Shruthi';
import Tanpura from './screens/Tanpura';
import Bhagavatha from './screens/Bhagavatha';
import Tuner from './screens/Tuner';

type ScreenId = 'shruthi' | 'tanpura' | 'bhagavatha' | 'tuner';

const SCREENS: { id: ScreenId; title: string }[] = [
  { id: 'shruthi', title: 'ಯಕ್ಷಶ್ರುತಿ - Yaksha Shruthi' },
  { id: 'tanpura', title: 'ತಾನ್ಪುರ - Tanpura' },
  { id: 'bhagavatha', title: 'ಯಕ್ಷ ಭಾಗವತ - Bhagavatha' },
  { id: 'tuner', title: 'ಶೃತಿ ಪರೀಕ್ಷೆ - Pitch detector' },
];

export default function App() {
  const { colors, theme, toggleTheme } = useTheme();
  const { isPlaying } = usePlayback();
  const [screen, setScreen] = useState<ScreenId>('shruthi');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const visitCount = useVisitCount();

  const current = SCREENS.find((s) => s.id === screen)!;

  useEffect(() => {
    document.title = 'Yakshanaada';
    logScreenView(current.id);
  }, [current.id]);

  return (
    <div className="app" style={{ backgroundColor: colors.background }}>
      <header
        className="header"
        style={{
          backgroundColor: colors.headerBackground,
          color: colors.headerIcon,
        }}
      >
        <button
          className="icon-btn"
          aria-label="Menu"
          onClick={() => setDrawerOpen(true)}
          style={{ color: colors.headerIcon }}
        >
          &#9776;
        </button>
        <img
          className={`brand-logo${isPlaying ? ' playing' : ''}`}
          src={assetUrl('logo.png')}
          alt="Yakshanaada logo"
        />
        <div className="brand-text">
          <span className="brand-title" style={{ color: colors.accent }}>
            ಯಕ್ಷನಾದ
          </span>
          <span className="brand-tagline">ಯಕ್ಷಧ್ರುವ ಪಟ್ಲಾಭಿಮಾನಿ</span>
        </div>
        <div style={{ flex: 1 }} />
        {visitCount != null && (
          <span
            className="visit-count"
            title="Total visits"
            style={{ color: colors.headerIcon }}
          >
            {'\uD83D\uDC41'} {visitCount.toLocaleString()}
          </span>
        )}
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          style={{ color: colors.headerIcon }}
        >
          {theme === 'dark' ? '\u2600' : '\u263d'}
        </button>
      </header>

      <main className="screen" style={{ backgroundColor: colors.background }}>
        {screen === 'shruthi' && <Shruthi />}
        {screen === 'tanpura' && <Tanpura />}
        {screen === 'bhagavatha' && <Bhagavatha />}
        {screen === 'tuner' && <Tuner active={screen === 'tuner'} />}
      </main>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}
      <nav
        className={`drawer${drawerOpen ? ' open' : ''}`}
        style={{ backgroundColor: colors.drawerBackground }}
      >
        <div className="drawer-title" style={{ color: colors.accent }}>
          Yakshanaada
        </div>
        {SCREENS.map((s) => {
          const isActive = s.id === screen;
          return (
            <button
              key={s.id}
              className="drawer-item"
              onClick={() => {
                setScreen(s.id);
                setDrawerOpen(false);
              }}
              style={{
                color: colors.drawerText,
                backgroundColor: isActive
                  ? colors.drawerActiveBackground
                  : 'transparent',
              }}
            >
              {s.title}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
