declare namespace OctoGuard{
	interface Secrets{
		ghApp: {
			id: number
			clientId: string
			name: string
			secret: string
		}
		oAuthApp: {
			id: string
			secret: string
		}
		cookieSecrets: string[]
		debug: {
			addresses: string[]
		}
	}
}
