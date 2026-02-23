import { createActorContext } from "@xstate/react";
import { gameMachine } from "@core/machines/gameMachine";
import { parseDebugConfig } from "@debug/DebugConfig";
import { setupInspector } from "@debug/StateInspector";

// Initialise the inspector once at module load, before any actors are created.
// Returns null in production or when ?debug=true is absent.
const _inspector = setupInspector(parseDebugConfig());

/**
 * React context for the root game actor.
 * Components can use GameActorContext.useActorRef() to send events,
 * or GameActorContext.useSelector() to read specific state slices.
 */
export const GameActorContext = createActorContext(gameMachine);

interface GameProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in the game actor context.
 * Must be mounted once at the root of the component tree.
 *
 * When `?debug=true` is set (dev builds only), the Stately browser inspector
 * is attached via the `inspect` actor option so all state transitions are
 * visible at https://stately.ai/inspector.
 */
export function GameProvider({ children }: GameProviderProps) {
  return (
    <GameActorContext.Provider options={_inspector ? { inspect: _inspector.inspect } : undefined}>
      {children}
    </GameActorContext.Provider>
  );
}
