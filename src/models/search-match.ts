import type { ModelType } from './model-type';

export interface SearchMatch<T> {
  item: T;
  modelType: ModelType;
  matchField: string;
  matchType: 'exact' | 'startsWith' | 'contains';
  score: number;
}