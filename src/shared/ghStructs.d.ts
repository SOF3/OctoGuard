declare namespace GitHubAPI{
	interface Account{
		login: string;
		id: number;
		type: string;
	}

	interface RepoOwner extends Account{
		name: string | null
		created_at: string
	}

	interface User extends RepoOwner{
		email: string | null
	}

	interface Repository{
		name: string;
	}

	type RepositorySelection = ("selected" | "all") & string;

	type Permission = ("read" | "write") & string;

	interface Installation{
		id: number
		account: Account
		repository_selection: string & RepositorySelection
		html_url: string
		app_id: number
		target_id: number
		target_type: string
		permissions: {
			pull_requests: Permission
			issues: Permission
			members: Permission
			single_file: Permission
			metadata: Permission
		}
		events: string[]
		created_at: string
		updated_at: string
		single_file_name: string // = .octoguard.yml
	}
}
