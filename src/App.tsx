import { GameProvider, GameActorContext } from "@ui/providers/GameProvider";
import { TitleScreen } from "@ui/screens/TitleScreen/TitleScreen";
import { HeroSelect } from "@ui/screens/HeroSelect/HeroSelect";
import { GameScreen } from "@ui/screens/GameScreen/GameScreen";
import { ResultsScreen } from "@ui/screens/ResultsScreen/ResultsScreen";
import { UpgradeScreen } from "@ui/screens/UpgradeScreen/UpgradeScreen";
import styles from "./App.module.css";

/**
 * Uses the GameMachine state as the router — no react-router needed.
 * Each state value maps to a screen component.
 */
function GameScreenRouter() {
  const screen = GameActorContext.useSelector((s) => s.value);

  switch (screen) {
    case "titleScreen":
      return <TitleScreen />;
    case "heroSelect":
      return <HeroSelect />;
    case "run":
      return <GameScreen />;
    case "results":
      return <ResultsScreen />;
    case "upgrade":
      return <UpgradeScreen />;
    default:
      return <TitleScreen />;
  }
}

function App() {
  return (
    <GameProvider>
      <div className={styles.app}>
        <GameScreenRouter />
      </div>
    </GameProvider>
  );
}

export default App;
