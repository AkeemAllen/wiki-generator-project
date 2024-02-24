import { DependencyList, EffectCallback, useEffect, useRef } from "react";

function isFirstRender() {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return isFirst.current;
}

/**
 * Custom hook that runs the effect only after the first render
 * @param effect The callback to run when the component updates
 * @param deps The dependencies to watch for changes
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirst = isFirstRender();

  useEffect(() => {
    if (!isFirst) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
