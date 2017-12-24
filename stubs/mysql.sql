DROP TABLE IF EXISTS profile_rule;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS user;
CREATE TABLE user (
	uid        BIGINT UNSIGNED PRIMARY KEY,
	name       VARCHAR(64) UNIQUE,
	regDate    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	onlineDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE profile (
	pid        INT PRIMARY KEY,
	owner      BIGINT UNSIGNED,
	name       VARCHAR(256),
	created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	visibility INT, # public = 0, readers-only = 1, writers-only = 2, admins-only = 3
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
show tables;
