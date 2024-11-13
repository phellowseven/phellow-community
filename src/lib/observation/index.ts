import type { Observation } from 'fhir/r4';
import { groupBy } from 'lodash-es';

export function groupByCoding(observations: Observation[]): _.Dictionary<Observation[]> {
	return groupBy(observations, (obs: Observation) => {
		return (
			obs.code.text ?? obs.code.coding?.at(0)?.display ?? obs.code.coding?.at(0)?.code ?? 'unknown'
		);
	});
}
