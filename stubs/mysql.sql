SET FOREIGN_KEY_CHECKS = 0;
# sessions
DROP TABLE IF EXISTS user;
CREATE TABLE user (
	userId      INT UNSIGNED PRIMARY KEY,
	name        VARCHAR(64) UNIQUE,
	displayName VARCHAR(256) DEFAULT NULL,
	token       VARCHAR(64),
	regDate     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	onlineDate  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS user_session;
CREATE TABLE user_session (
	cookie CHAR(40) PRIMARY KEY,
	userId INT UNSIGNED,
	touch  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (userId) REFERENCES user (userId)
		ON DELETE CASCADE
);
# profile
DROP TABLE IF EXISTS profile;
CREATE TABLE profile (
	profileId  INT PRIMARY KEY,
	owner      INT UNSIGNED,
	name       VARCHAR(256),
	created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	visibility INT, # public = 0, organization-only = 1, collaborators-only = 2
	KEY (owner)
);
## profile mapping
DROP TABLE IF EXISTS repo_profile_map;
CREATE TABLE repo_profile_map (
	repoId    INT UNSIGNED PRIMARY KEY,
	profileId INT,
	FOREIGN KEY (profileId) REFERENCES profile (profileId)
		ON DELETE CASCADE
);
## profile rules
DROP TABLE IF EXISTS profile_rule;
CREATE TABLE profile_rule (
	ruleId    INT PRIMARY KEY,
	profileId INT,
	updated   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (profileId) REFERENCES profile (profileId)
		ON DELETE CASCADE
);
### profile rule triggers
DROP TABLE IF EXISTS trigger_word_filter;
CREATE TABLE trigger_word_filter (
	triggerId INT PRIMARY KEY AUTO_INCREMENT, # Note: id may duplicate in different trigger types
	ruleId    INT,
	word_list TEXT,
	coverage  INT, # see dbStructs.d.ts:ProfileRuleCoverageName for values
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
DROP TABLE IF EXISTS trigger_throttle;
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
DROP TABLE IF EXISTS action_comment;
CREATE TABLE action_comment (
	actionId INT PRIMARY KEY AUTO_INCREMENT, # Note: id may duplicate in different action types
	ruleId   INT,
	template TEXT,
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
DROP TABLE IF EXISTS action_lock;
CREATE TABLE action_lock (
	actionId INT PRIMARY KEY AUTO_INCREMENT,
	ruleId   INT,
	duration INT             DEFAULT 0, # unit: seconds, 0 = infinity
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);
DROP TABLE IF EXISTS action_label;
CREATE TABLE action_label (
	actionId INT PRIMARY KEY AUTO_INCREMENT,
	ruleId   INT,
	name     VARCHAR(256), # GitHub label name
	KEY (ruleId),
	FOREIGN KEY (ruleId) REFERENCES profile_rule (ruleId)
		ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
SHOW TABLES;

# TODO: I refactored column names in this commit. Refactor the references in code too!
