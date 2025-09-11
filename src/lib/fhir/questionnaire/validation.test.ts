import { describe, test, expect } from 'vitest';
import { validateQuestionnaireItem } from './validation';
import type { QuestionnaireItem } from 'fhir/r4';

describe('validateQuestionnaireItem with enableWhen', () => {
	const requiredItem: QuestionnaireItem = {
		linkId: 'test-required',
		type: 'string',
		text: 'Required question',
		required: true,
	};

	test('validates required fields when item is enabled', () => {
		// Empty value should fail when enabled and required
		const result = validateQuestionnaireItem(requiredItem, '', true);
		expect(result.isValid).toBe(false);
		expect(result.message).toBeDefined();
	});

	test('skips required validation when item is disabled', () => {
		// Empty value should pass when disabled, even if required
		const result = validateQuestionnaireItem(requiredItem, '', false);
		expect(result.isValid).toBe(true);
		expect(result.message).toBeUndefined();
	});

	test('validates provided value regardless of enablement status', () => {
		// Valid value should pass when enabled
		const enabledResult = validateQuestionnaireItem(requiredItem, 'valid value', true);
		expect(enabledResult.isValid).toBe(true);
		
		// Valid value should pass when disabled
		const disabledResult = validateQuestionnaireItem(requiredItem, 'valid value', false);
		expect(disabledResult.isValid).toBe(true);
	});

	test('defaults to enabled behavior when isEnabled parameter is omitted', () => {
		// Should behave as enabled by default (backward compatibility)
		const result = validateQuestionnaireItem(requiredItem, '');
		expect(result.isValid).toBe(false);
		expect(result.message).toBeDefined();
	});
});