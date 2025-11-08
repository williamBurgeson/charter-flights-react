import { useCallback } from "react";
import { generateGuid } from "./guid";

/**
 * React hook providing a stable generateGuid function.
 * The function identity is memoised so you can safely
 * use it in dependencies.
 */
export function useGuid() {
  const createGuid = useCallback(() => generateGuid(), []);
  return { generateGuid: createGuid };
}
