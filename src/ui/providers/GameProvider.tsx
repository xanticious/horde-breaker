import { createActorContext } from "@xstate/react";
import { gameMachine } from "@core/machines/gameMachine";

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
 */
export function GameProvider({ children }: GameProviderProps) {
  return <GameActorContext.Provider>{children}</GameActorContext.Provider>;
}
