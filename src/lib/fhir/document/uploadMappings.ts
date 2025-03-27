import type { Coding } from "fhir/r4";

export enum UploadCategory {
	Arztbrief = "upload_categories_arztbrief",
	Anamnesebogen = "upload_categories_anamnesebogen",
	Operationsbericht = "upload_categories_operationsbericht",
	MRTBefund = "upload_categories_mrt_befund",
	Röntgenbild = "upload_categories_roentgenbild",
	Sonographie = "upload_categories_sonographie",
	Laborbericht = "upload_categories_laborbericht",
}

export interface UploadCategoryMap {
	type: Coding;
	category: Coding;
	practiceSetting: Coding;
	facilityType: Coding;
}

export const uploadCategoryMappings: Record<UploadCategory, UploadCategoryMap> = {
	[UploadCategory.Arztbrief]: {
		type: { system: "1.3.6.1.4.1.19376.3.276.1.5.9", code: "BERI", display: "Arztberichte" },
		category: { system: "1.3.6.1.4.1.19376.3.276.1.5.8", code: "BRI", display: "Brief" },
		practiceSetting: {
			system: "1.3.6.1.4.1.19376.3.276.1.5.4",
			code: "ALLG",
			display: "Allgemeinmedizin",
		},
		facilityType: { system: "1.3.6.1.4.1.19376.3.276.1.5.2", code: "PRA", display: "Arztpraxis" },
	},
	[UploadCategory.Anamnesebogen]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "1.3.6.1.4.1.19376.3.276.1.5.2", code: "PRA", display: "Arztpraxis" },
	},
	[UploadCategory.Operationsbericht]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "1.3.6.1.4.1.19376.3.276.1.5.2", code: "KHS", display: "Krankenhaus" },
	},
	[UploadCategory.MRTBefund]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "1.3.6.1.4.1.19376.3.276.1.5.2", code: "KHS", display: "Krankenhaus" },
	},
	[UploadCategory.Röntgenbild]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "", code: "" },
	},
	[UploadCategory.Sonographie]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "", code: "" },
	},
	[UploadCategory.Laborbericht]: {
		type: { system: "", code: "" },
		category: { system: "", code: "" },
		practiceSetting: { system: "", code: "" },
		facilityType: { system: "", code: "" },
	},
};
