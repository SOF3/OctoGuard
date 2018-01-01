SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_session;
DROP TABLE IF EXISTS install;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS repo_profile_map;
DROP TABLE IF EXISTS profile_rule;
DROP TABLE IF EXISTS trigger_word_filter;
DROP TABLE IF EXISTS trigger_throttle;
DROP TABLE IF EXISTS action_comment;
DROP TABLE IF EXISTS action_lock;
DROP TABLE IF EXISTS action_label;
SET FOREIGN_KEY_CHECKS = 1;

# sessions
CREATE TABLE user (
	userId      INT PRIMARY KEY,
	name        VARCHAR(64) UNIQUE,
	displayName VARCHAR(256) DEFAULT NULL,
	token       VARCHAR(64),
	regDate     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
	onlineDate  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_session (
	cookie CHAR(40) PRIMARY KEY,
	userId INT,
	touch  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (userId) REFERENCES user (userId)
		ON DELETE CASCADE
);
# installation
CREATE TABLE install (
	installId INT UNIQUE KEY,
	# This should be the only place an installation ID appears in the database.
	# Blame GitHub for making this so confusing.
	orgId     INT PRIMARY KEY
);
# profile
CREATE TABLE profile (
	profileId  INT PRIMARY KEY,
	owner      INT,
	name       VARCHAR(256),
	created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	visibility INT, # public = 0, organization-only = 1, collaborators-only = 2
	KEY (owner)
);
## profile mapping
CREATE TABLE repo_profile_map (
	repoId    INT PRIMARY KEY,
	profileId INT,
	FOREIGN KEY (profileId) REFERENCES profile (profileId)
		ON DELETE CASCADE
);
## profile rules
CREATE TABLE profile_rule (
	ruleId    INT PRIMARY KEY,
	profileId INT,
	updated   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (profileId) REFERENCES profile (profileId)
		ON DELETE CASCADE
);
### profile rule triggers
CREATE TABLE trigger_word_filter (
	triggerId INT PRIMARY KEY AUTO_INCREMENT, # Note: id may duplicate in different trigger types
	ruleId    INT,
	word_list TEXT,
	coverage  INT, # see dbStructs.d.ts:ProfileRuleCoverageName for values
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
CREATE TABLE trigger_throttle (
	triggerId INT PRIMARY KEY AUTO_INCREMENT,
	ruleId    INT,
	max       INT,
	period    INT, # in milliseconds
	coverage  INT,
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
### profile actions
CREATE TABLE action_comment (
	actionId INT PRIMARY KEY AUTO_INCREMENT, # Note: id may duplicate in different action types
	ruleId   INT,
	template TEXT,
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
CREATE TABLE action_lock (
	actionId INT PRIMARY KEY AUTO_INCREMENT,
	ruleId   INT,
	duration INT             DEFAULT 0, # unit: seconds, 0 = infinity
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
CREATE TABLE action_label (
	actionId INT PRIMARY KEY AUTO_INCREMENT,
	ruleId   INT,
	name     VARCHAR(256), # GitHub label name
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);

SHOW TABLES;
