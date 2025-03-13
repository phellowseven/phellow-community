import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { pino, type Logger } from "pino";

export const logger: Logger = pino({
	transport: dev
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "yyyy-mm-dd HH:MM:ss",
					ignore: "module,pid,hostname",
					messageFormat: "[{module}] {msg}",
					redact: ["encryptedAccessToken", "encryptedRefreshToken", "encryptedIdToken"],
				},
			}
		: undefined,
	level: env.PINO_LOG_LEVEL || "info",

	redact: [], // prevent logging of sensitive data
});
