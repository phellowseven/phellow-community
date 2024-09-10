import { oauth2Client } from '$lib/server/auth/auth';
import { auth } from '$lib/server/auth/lucia';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const sessionId = cookies.get(auth.sessionCookieName);
	if (sessionId) {
		const { session } = await auth.validateSession(sessionId);
		if (session) redirect(307, '/');
	}

	if (url.searchParams.has('autologin')) {
		const authURL = oauth2Client.authorizationUrl({
			scope:
				'patient/Appointment.read patient/DocumentReference.read patient/DocumentManifest.write openid email offline_access patient/Observation.write patient/QuestionnaireResponse.write patient/Questionnaire.read patient/RecordAssociation.read patient/RecordAssociation.confirm patient/Location.read'
		});

		redirect(307, authURL);
	}

	return {
		autologin: url.searchParams.get('autologin')
	};
};

export const actions: Actions = {
	login: async ({}) => {
		const url = oauth2Client.authorizationUrl({
			scope:
				'patient/Appointment.read patient/DocumentReference.read patient/DocumentManifest.write openid email offline_access patient/Observation.write patient/QuestionnaireResponse.write patient/Questionnaire.read patient/RecordAssociation.read patient/RecordAssociation.confirm patient/Location.read'
		});

		redirect(307, url);
	}
};
