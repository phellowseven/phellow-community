import dayjs from 'dayjs';
import type { Appointment } from 'fhir/r4';
import { groupBy, sortBy } from 'lodash-es';

export function groupByMonth(documentReferences: Appointment[]): _.Dictionary<Appointment[]> {
	return groupBy(sortBy(documentReferences, (doc) => doc.start).reverse(), (doc: Appointment) => {
		const date = dayjs(doc.start);
		return date.format('YYYY-MM');
	});
}
