import { makeAutoObservable } from 'mobx';
import happyScenario from '../../scenarios/happy.json';
import messyScenario from '../../scenarios/messy.json';
import degradedScenario from '../../scenarios/degraded.json';
import type { CallEvent } from '../types/events';

export type ScenarioId = 'happy' | 'messy' | 'degraded';

export type ScenarioEvent =
  | CallEvent
  | (Record<string, unknown> & {
      id?: string;
      t?: number;
      type?: string;
      suggestionType?: string;
      arrivalT?: number;
    });

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  duration: number;
  buyer: {
    name: string;
    company: string;
  };
  events: ScenarioEvent[];
}

export type EventListener = (event: ScenarioEvent) => void;

const scenarioList = [
  happyScenario,
  messyScenario,
  degradedScenario,
] as unknown as ScenarioDefinition[];

const scenariosById = scenarioList.reduce<Record<ScenarioId, ScenarioDefinition>>(
  (acc, scenario) => {
    acc[scenario.id] = scenario;
    return acc;
  },
  {} as Record<ScenarioId, ScenarioDefinition>,
);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function scheduledAt(event: ScenarioEvent) {
  const transportTime = 'arrivalT' in event ? Number(event.arrivalT) : Number.NaN;
  if (Number.isFinite(transportTime)) {
    return transportTime;
  }

  return Number(event.t);
}

export class ScenarioPlayer {
  readonly scenarios = scenarioList;

  scenarioId: ScenarioId = 'happy';
  elapsed = 0;
  isPlaying = false;
  emittedEvents: ScenarioEvent[] = [];

  private intervalId: number | undefined;
  private startedAt = 0;
  private baseElapsed = 0;
  private listeners = new Set<EventListener>();
  private orderedEvents: ScenarioEvent[] = [];
  private nextEmitIndex = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.rebuildOrder();
  }

  onEvent(listener: EventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  get scenario() {
    return scenariosById[this.scenarioId];
  }

  get duration() {
    return this.scenario.duration;
  }

  get latestEvent() {
    return this.emittedEvents[this.emittedEvents.length - 1] ?? null;
  }

  play() {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.startedAt = performance.now();
    this.baseElapsed = this.elapsed;
    this.intervalId = window.setInterval(this.tick, 100);
    this.tick();
  }

  pause() {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isPlaying = false;
  }

  scrub(seconds: number) {
    const target = clamp(seconds, 0, this.duration);

    if (target < this.elapsed) {
      this.elapsed = target;
      this.nextEmitIndex = this.findEmissionCursor(target);
      this.emittedEvents = this.orderedEvents.slice(0, this.nextEmitIndex);
    } else {
      this.elapsed = target;
      this.flushArrivals();
    }

    if (this.isPlaying) {
      this.startedAt = performance.now();
      this.baseElapsed = this.elapsed;
    }
  }

  selectScenario(scenarioId: ScenarioId) {
    this.pause();
    this.scenarioId = scenarioId;
    this.elapsed = 0;
    this.emittedEvents = [];
    this.nextEmitIndex = 0;
    this.rebuildOrder();
  }

  dispose() {
    this.pause();
    this.listeners.clear();
  }

  private tick() {
    const nextElapsed = this.baseElapsed + (performance.now() - this.startedAt) / 1000;
    this.elapsed = clamp(nextElapsed, 0, this.duration);
    this.flushArrivals();

    if (this.elapsed >= this.duration) {
      this.pause();
    }
  }

  private flushArrivals() {
    while (
      this.nextEmitIndex < this.orderedEvents.length &&
      scheduledAt(this.orderedEvents[this.nextEmitIndex]) <= this.elapsed
    ) {
      const event = this.orderedEvents[this.nextEmitIndex];
      this.nextEmitIndex += 1;
      this.emittedEvents.push(event);
      this.listeners.forEach((listener) => listener(event));
    }
  }

  private findEmissionCursor(targetElapsed: number) {
    let cursor = 0;
    while (
      cursor < this.orderedEvents.length &&
      scheduledAt(this.orderedEvents[cursor]) <= targetElapsed
    ) {
      cursor += 1;
    }
    return cursor;
  }

  private rebuildOrder() {
    this.orderedEvents = this.scenario.events
      .slice()
      .sort((a, b) => scheduledAt(a) - scheduledAt(b));
  }
}
