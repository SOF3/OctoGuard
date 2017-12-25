declare namespace GitHubAPI{
	type Timestamp = string
	type AuthorAssociation =
		"COLLABORATOR"
		| "CONTRIBUTOR"
		| "FIRST_TIMER"
		| "FIRST_TIME_CONTRIBUTOR"
		| "MEMBER"
		| "NONE"
		| "OWNER"

	interface Account{
		login: string
		id: number
		type: string
	}

	interface RepoOwner extends Account{
		name: string | null
		created_at: Timestamp
	}

	interface User extends RepoOwner{
		email: string | null
	}

	interface Repository{
		id: number
		name: string
		full_name: string // ${owner.login}/${name}
		owner: Account
		private: boolean
		description: string
		fork: boolean
		created_at: Timestamp
		updated_at: Timestamp
		pushed_at: Timestamp | null
		homepage: string | null
		size: number
		stargazers_count: number
		watchers_count: number
		language: string | null
		has_issues: boolean
		has_projects: boolean
		has_downloads: boolean
		has_wiki: boolean
		has_pages: boolean
		forks_count: number
		archived: boolean
		open_issues_comment: number
		license: string | null
		forks: number
		open_issues: number
		watchers: number
		default_branch: string
		permissions?: {
			admin: boolean
			push: boolean
			pull: boolean
		}
	}

	interface Label{
		id?: number
		name: string
		color: string
		default?: boolean
	}

	interface Milestone{
		id: number
		number: number
		state: "open" | "closed"
		title: string
		description: string
		creator: Account
		open_issues: number
		closed_issues: number
		created_at: Timestamp
		updated_at: Timestamp
		closed_at: Timestamp | null
		due_on: Timestamp | null
	}

	interface Issue{
		id: number
		number: number
		title: string
		user: Account
		labels: Label[]
		state: "open" | "closed"
		locked: boolean
		assignees: Account[]
		milestone: Milestone | null
		comments: number
		created_at: Timestamp
		updated_at: Timestamp
		closed_at: Timestamp | null
		author_association: AuthorAssociation
		body: string
	}

	interface IssueComment{

	}

	type RepositorySelection = ("selected" | "all") & string

	type Permission = ("read" | "write") & string

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
