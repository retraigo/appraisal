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
    min_lr: number;
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
    step_size: number;
    /** Decay factor */
    rate: number;
  };
};
export type OneCycleScheduler = {
  /** Type of Scheduler */
  type: Scheduler.OneCycleScheduler;
  /** The maximum value learning rate can get to */
  max_lr: number;
  /** Number of steps in each cycle */
  cycle_steps: number;
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
      return initial - step * (initial - scheduler.config.min_lr) / scheduler.config.epochs;
    }
    case Scheduler.ExponentialAnnealer: {
      return initial * Math.pow(scheduler.config.rate, step);
    }
    case Scheduler.DecayScheduler: {
      return initial * Math.pow(scheduler.config.rate, ~~(step / scheduler.config.step_size));
    }
    case Scheduler.OneCycleScheduler: {
      const currentSteps = step % (2 * scheduler.cycle_steps);
      if (currentSteps < scheduler.cycle_steps) {
        return initial +
          (scheduler.max_lr - initial) * (currentSteps / scheduler.cycle_steps);
      } else {return scheduler.max_lr -
          (scheduler.max_lr - initial) *
            ((currentSteps - scheduler.cycle_steps) / scheduler.cycle_steps);}
    }
    default: {
      return current;
    }
  }
}
