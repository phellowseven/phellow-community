export interface EnrollmentToken {
	/**
	 * The SurrealDB id.
	 */
	id: string;
	/**
	 * The FHIR Resource id
	 */
	patientID: string;
	createdAt: string;
	expiresAt?: string;
}
