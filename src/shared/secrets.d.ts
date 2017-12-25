///generated file
export namespace OctoGuard{
	interface Secrets{
		ghApp: {
			id: number
			clientId: string
			name: string
			secret: string
			webhookSecret: string
		}
		oAuthApp: {
			id: string
			secret: string
		}
		cookieSecrets: string[]
		mysql: {
			host: string
			username: string
			password: string
			schema: string
			port: number
			timeout: number
			poolSize: number
		}
		debug: {
			addresses: string[]
		}
	}
}
