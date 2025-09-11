export type TNMPrefix = "a" | "c" | "p" | "u" | "r" | "y" | "m";

export type TNMStaging = {
	id?: string;
	date: Date;
	version?: "6" | "7" | "8";
	y_Symbol?: "y";
	r_Symbol?: "r";
	a_Symbol?: "a";
	prefix?: {
		t?: TNMPrefix;
		n?: TNMPrefix;
		m?: TNMPrefix;
	};
	t?: string; // Pattern: is.*|[01234X].*
	n?: string; // Pattern: [0123X].*
	m?: string; // Pattern: [01X].*
	l?: "LX" | "L0" | "L1";
	v?: "VX" | "V0" | "V1" | "V2";
	pn?: "PnX" | "Pn0" | "Pn1";
	s?: "SX" | "S0" | "S1" | "S2" | "S3";
	uiccStage?: string;
	mSymbol?: string | number; // Pattern for string: m(,is)?|is|[2-9](,is)?|[1-9][0-9]{1,2}(,is)?
};

export type hoverMarker =
	| "t"
	| "n"
	| "m"
	| "tPrefix"
	| "nPrefix"
	| "mPrefix"
	| "l"
	| "v"
	| "pn"
	| "s";
