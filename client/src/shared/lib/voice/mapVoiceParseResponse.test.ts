import { describe, expect, it } from 'vitest';
import { defaultMealByHour } from './defaultMeal';
import { mapVoiceParseResponse } from './mapVoiceParseResponse';

describe('defaultMealByHour', () => {
  it('maps time of day to a meal', () => {
    expect(defaultMealByHour(8)).toBe('breakfast');
    expect(defaultMealByHour(13)).toBe('lunch');
    expect(defaultMealByHour(19)).toBe('dinner');
    expect(defaultMealByHour(23)).toBe('snack');
  });
});

describe('mapVoiceParseResponse', () => {
  it('returns null for unknown intent', () => {
    expect(
      mapVoiceParseResponse({
        intent: 'unknown',
        productName: 'погода',
        meal: 'breakfast',
      }),
    ).toBeNull();
  });

  it('returns null without a product name', () => {
    expect(mapVoiceParseResponse({ intent: 'add_entry', productName: '  ' })).toBeNull();
  });

  it('maps add_entry and keeps fat as a macro', () => {
    expect(
      mapVoiceParseResponse({
        intent: 'add_entry',
        productName: 'творог 9%',
        searchQuery: 'творог 9%',
        weight: 70,
        meal: 'snack',
        calories: null,
        protein: null,
        fat: null,
        carbs: null,
        matchedProduct: {
          id: 'custom_1',
          name: 'Творог 9%',
          calories: 159,
          protein: 16,
          fat: 9,
          carbs: 3,
        },
      }),
    ).toMatchObject({
      productName: 'творог 9%',
      searchQuery: 'творог 9%',
      weight: 70,
      meal: 'snack',
      fat: null,
      matchedProduct: { id: 'custom_1', name: 'Творог 9%' },
    });
  });
});
