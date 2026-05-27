import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useScenarioPlayer } from '../stores/RootStoreContext';

export const CallSurface = observer(function CallSurface() {
  const player = useScenarioPlayer();

  useEffect(() => {
    return player.onEvent((event) => {
      // TODO: react to each event as it arrives.
      // `event` is a ScenarioEvent — discriminate on `event.type`
      // (and `event.suggestionType` when type === 'suggestion').
      void event;
    });
  }, [player]);

  // TODO: build the rep-facing surface here. Restructure, rename, or
  // split this component however makes sense.
  return null;
});
