import React, { createContext, useContext, ReactNode } from "react";
import { useStepCounter } from "./functions";

// Type for the context value (whatever your hook returns)
type StepCounterContextType = ReturnType<typeof useStepCounter> | null;

export const StepCounterContext = createContext<StepCounterContextType>(null);

export function StepCounterProvider({ children }: { children: ReactNode }) {
  const value = useStepCounter();
  return (
    <StepCounterContext.Provider value={value}>
      {children}
    </StepCounterContext.Provider>
  );
}

export function useStepCounterContext() {
  return useContext(StepCounterContext);
}
