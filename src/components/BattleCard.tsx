import type { BattleCardSuggestionEvent } from '../types/events';

interface BattleCardProps {
  event: BattleCardSuggestionEvent;
}

export function BattleCard({ event }: BattleCardProps) {
  // TODO: render the battle card. Decide what to show, in what order,
  // and how it earns its place during a live call.
  void event;
  return null;
}
