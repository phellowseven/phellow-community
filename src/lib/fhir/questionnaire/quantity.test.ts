import { describe, test, expect } from 'vitest';
import { validateQuantity } from './validation';
import { evaluateEnableWhen } from './enableWhen';
import type { QuestionnaireItem } from 'fhir/r4';
import { SvelteMap } from 'svelte/reactivity';
import type { QuestionnaireAnswer } from '$lib/stores/questionnaireStore.svelte';

describe('Quantity question functionality', () => {
	describe('validateQuantity', () => {
		test('validates valid quantity objects', () => {
			const validQuantity = {
				value: 70,
				unit: 'kg',
				code: 'kg',
				system: 'http://unitsofmeasure.org',
			};

			const result = validateQuantity(validQuantity);
			expect(result.isValid).toBe(true);
		});

		test('rejects quantity without value', () => {
			const invalidQuantity = {
				unit: 'kg',
				code: 'kg',
			};

			const result = validateQuantity(invalidQuantity);
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('numeric value');
		});

		test('rejects quantity without unit', () => {
			const invalidQuantity = {
				value: 70,
			};

			const result = validateQuantity(invalidQuantity);
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('unit');
		});

		test('accepts quantity with unit but no code', () => {
			const validQuantity = {
				value: 70,
				unit: 'kg',
			};

			const result = validateQuantity(validQuantity);
			expect(result.isValid).toBe(true);
		});

		test('rejects non-numeric values', () => {
			const invalidQuantity = {
				value: 'not a number',
				unit: 'kg',
			};

			const result = validateQuantity(invalidQuantity);
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('numeric value');
		});
	});

	describe('enableWhen with quantities', () => {
		test('evaluates quantity equality correctly', () => {
			const item: QuestionnaireItem = {
				linkId: 'dependent',
				type: 'string',
				text: 'Dependent question',
				enableWhen: [
					{
						question: 'weight',
						operator: '=',
						answerQuantity: {
							value: 70,
							unit: 'kg',
							code: 'kg',
							system: 'http://unitsofmeasure.org',
						},
					},
				],
			};

			const answers = new SvelteMap<string, QuestionnaireAnswer>();

			// Should be false when no answer
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be false when value doesn't match
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 65, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be true when value matches
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 70, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(true);

			// Should be false when unit doesn't match
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 70, unit: 'lbs', code: 'lbs' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);
		});

		test('evaluates quantity greater than correctly', () => {
			const item: QuestionnaireItem = {
				linkId: 'dependent',
				type: 'string',
				text: 'Dependent question',
				enableWhen: [
					{
						question: 'weight',
						operator: '>',
						answerQuantity: {
							value: 70,
							unit: 'kg',
							code: 'kg',
						},
					},
				],
			};

			const answers = new SvelteMap<string, QuestionnaireAnswer>();

			// Should be false when equal
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 70, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be false when less
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 65, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be true when greater
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 75, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(true);

			// Should be false when different unit (no conversion)
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 75, unit: 'lbs', code: 'lbs' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);
		});

		test('evaluates quantity less than correctly', () => {
			const item: QuestionnaireItem = {
				linkId: 'dependent',
				type: 'string',
				text: 'Dependent question',
				enableWhen: [
					{
						question: 'weight',
						operator: '<',
						answerQuantity: {
							value: 70,
							unit: 'kg',
							code: 'kg',
						},
					},
				],
			};

			const answers = new SvelteMap<string, QuestionnaireAnswer>();

			// Should be false when equal
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 70, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be true when less
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 65, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(true);

			// Should be false when greater
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 75, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);
		});

		test('evaluates quantity greater than or equal correctly', () => {
			const item: QuestionnaireItem = {
				linkId: 'dependent',
				type: 'string',
				text: 'Dependent question',
				enableWhen: [
					{
						question: 'weight',
						operator: '>=',
						answerQuantity: {
							value: 70,
							unit: 'kg',
							code: 'kg',
						},
					},
				],
			};

			const answers = new SvelteMap<string, QuestionnaireAnswer>();

			// Should be true when equal
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 70, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(true);

			// Should be false when less
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 65, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(false);

			// Should be true when greater
			answers.set('weight', {
				linkId: 'weight',
				value: { value: 75, unit: 'kg', code: 'kg' },
			});
			expect(evaluateEnableWhen(item, answers)).toBe(true);
		});
	});
});