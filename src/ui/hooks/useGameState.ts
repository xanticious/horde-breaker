import { useSelector } from "@xstate/react";
import { GameActorContext } from "@ui/providers/GameProvider";

/**
 * Selects a derived value from the game machine state.
 * Component only re-renders when the selected value changes.
 *
 * @example
 * const screen = useGameState((s) => s.value);
 */
export function useGameState<T>(
  selector: (
    state: ReturnType<ReturnType<typeof GameActorContext.useActorRef>["getSnapshot"]>,
  ) => T,
): T {
  const actorRef = GameActorContext.useActorRef();
  return useSelector(actorRef, selector);
}
