// generated stub from secrets/secrets.json

package secrets

type Type = struct {
	GitHub struct {
		Integration struct {
			ID            int
			ClientID      string
			ClientSecret  string
			Slug          string
			WebhookSecret string
		}
		OAuth struct {
			ID     string
			Secret string
		}
	}
	HTTP struct {
		Domain  string
		Secure  bool
		Port    int
		Cookies struct {
			Session string
			Use     string
		}
		Timeout struct {
			GitHubLogin int
			Session     int
			Ajax        int
		}
	}
	MySQL struct {
		Host     string
		Username string
		Password string
		Protocol string
		Schema   string
		Port     int
	}
	Log struct {
		Stderr string
	}
}
