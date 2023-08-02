export enum Scheduler {
  None = "none",
  ExponentialAnnealer = "exponentialannealer",
  LinearAnnealer = "linearannealer",
  DecayScheduler = "decayscheduler",
  OneCycleScheduler = "onecyclescheduler",
}

export type NoScheduler = {
  /** Type of Scheduler */
  type: Scheduler.None;
};

export type LinearAnnealer = {
  /** Type of Scheduler */
  type: Scheduler.LinearAnnealer;
  config: {
    /** The lowest value learning rate can get to */
    minLr: number;
    /** Total epochs */
    epochs: number;
  };
};
export type ExponentialAnnealer = {
  /** Type of Scheduler */
  type: Scheduler.ExponentialAnnealer;
  config: {
    /** Decay factor */
    rate: number;
  };
};
export type DecayScheduler = {
  /** Type of Scheduler */
  type: Scheduler.DecayScheduler;
  config: {
    /** Number of steps for each decay */
    stepSize: number;
    /** Decay factor */
    rate: number;
  };
};
export type OneCycleScheduler = {
  /** Type of Scheduler */
  type: Scheduler.OneCycleScheduler;
  /** The maximum value learning rate can get to */
  maxLr: number;
  /** Number of steps in each cycle */
  cycleSteps: number;
};

export type LearningRateScheduler =
  | NoScheduler
  | LinearAnnealer
  | ExponentialAnnealer
  | DecayScheduler
  | OneCycleScheduler;

/**
 * @param scheduler Scheduler configuration
 * @param current Current learning rate
 * @param step Current step / epoch / iteration / t (in case of SGD or Adam)
 * @param initial Initial learning rate
 */
export function getLearningRate(
  scheduler: LearningRateScheduler,
  current: number,
  step: number,
  initial: number,
): number {
  switch (scheduler.type) {
    case Scheduler.None: {
      return current;
    }
    case Scheduler.LinearAnnealer: {
      return initial - step * (initial - scheduler.config.minLr) / scheduler.config.epochs;
    }
    case Scheduler.ExponentialAnnealer: {
      return initial * Math.pow(scheduler.config.rate, step);
    }
    case Scheduler.DecayScheduler: {
      return initial * Math.pow(scheduler.config.rate, ~~(step / scheduler.config.stepSize));
    }
    case Scheduler.OneCycleScheduler: {
      const currentSteps = step % (2 * scheduler.cycleSteps);
      if (currentSteps < scheduler.cycleSteps) {
        return initial +
          (scheduler.maxLr - initial) * (currentSteps / scheduler.cycleSteps);
      } else {return scheduler.maxLr -
          (scheduler.maxLr - initial) *
            ((currentSteps - scheduler.cycleSteps) / scheduler.cycleSteps);}
    }
    default: {
      return current;
    }
  }
}
