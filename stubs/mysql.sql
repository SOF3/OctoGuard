DROP TABLE IF EXISTS rule_word_filter;
DROP TABLE IF EXISTS rule_throttle;
DROP TABLE IF EXISTS profile_rule;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS user;
CREATE TABLE user (
	uid        BIGINT UNSIGNED PRIMARY KEY,
	name       VARCHAR(64) UNIQUE,
	regDate    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	onlineDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_profile (
	cookie CHAR(40) PRIMARY KEY,
	uid BIGINT UNSIGNED,
	creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (uid) REFERENCES user(uid)
	ON DELETE CASCADE
);
CREATE TABLE profile (
	pid        INT PRIMARY KEY,
	owner      BIGINT UNSIGNED,
	name       VARCHAR(256),
	created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	visibility INT, # public = 0, organization-only = 1, collaborators-only = 2
	FOREIGN KEY (owner) REFERENCES user (uid)
		ON DELETE SET NULL
);
CREATE TABLE profile_rule (
	rid     INT PRIMARY KEY,
	pid     INT,
	type    VARCHAR(32),
	updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (pid) REFERENCES profile (pid)
		ON DELETE CASCADE
);
CREATE TABLE rule_word_filter (
	rid       INT PRIMARY KEY,
	word_list TEXT,
	coverage INT, # see dbStructs.d.ts:ProfileRuleCoverageName for values
	FOREIGN KEY (rid) REFERENCES profile_rule (rid)
		ON DELETE CASCADE
);
CREATE TABLE rule_throttle (
	rid    INT PRIMARY KEY,
	max    INT,
	period INT, # in milliseconds
	FOREIGN KEY (rid) REFERENCES profile_rule (rid)
		ON DELETE CASCADE
);
SHOW TABLES;
