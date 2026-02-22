import { GameActorContext } from "@ui/providers/GameProvider";

/**
 * Returns the root game actor ref.
 * Use the actor ref to send events: `actor.send({ type: 'START_GAME' })`.
 * Prefer `useSelector` for subscribing to specific state slices.
 */
export function useGameActor() {
  return GameActorContext.useActorRef();
}
