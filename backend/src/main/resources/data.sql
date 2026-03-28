-- Disable Foreign Key Checks for Truncation
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE team_secret_access;
TRUNCATE TABLE team_members;
TRUNCATE TABLE teams;
TRUNCATE TABLE organisation_invites;
TRUNCATE TABLE organisation_members;
TRUNCATE TABLE organisations;
TRUNCATE TABLE secret_versions;
TRUNCATE TABLE secrets;
TRUNCATE TABLE secret_categories;
TRUNCATE TABLE otp_tokens;
TRUNCATE TABLE accounts;
TRUNCATE TABLE heartbeat;
SET FOREIGN_KEY_CHECKS = 1;

-- HEARTBEAT
INSERT INTO heartbeat (id, note, created_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000001'), 'Full system seed successful', NOW());

-- ACCOUNTS (Password: Password1!)
INSERT INTO accounts (id, email, password, name, verified, created_at) VALUES (UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'ibrahim@minivault.io', '$2a$10$4XGkyJJy3aqr/h9TrBFl1OVemiuSLMX4IMk/drx517n2uuGU7UT9m', 'Ibrahim Ahmed', 1, NOW());
INSERT INTO accounts (id, email, password, name, verified, created_at) VALUES (UUID_TO_BIN('a1000000-0000-0000-0000-000000000002'), 'inaam@minivault.io', '$2a$10$4XGkyJJy3aqr/h9TrBFl1OVemiuSLMX4IMk/drx517n2uuGU7UT9m', 'Inaam Azmat', 1, NOW());
INSERT INTO accounts (id, email, password, name, verified, created_at) VALUES (UUID_TO_BIN('a1000000-0000-0000-0000-000000000003'), 'sarah@minivault.io', '$2a$10$4XGkyJJy3aqr/h9TrBFl1OVemiuSLMX4IMk/drx517n2uuGU7UT9m', 'Sarah Johnson', 1, NOW());
INSERT INTO accounts (id, email, password, name, verified, created_at) VALUES (UUID_TO_BIN('a1000000-0000-0000-0000-000000000004'), 'ali@minivault.io', '$2a$10$4XGkyJJy3aqr/h9TrBFl1OVemiuSLMX4IMk/drx517n2uuGU7UT9m', 'Ali Hassan', 1, NOW());

-- ORGANISATIONS & TEAMS
INSERT INTO organisations (id, name, slug, owner_id, created_at, updated_at) VALUES (UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'Compact Soft Ltd.', 'compact-soft-ltd', UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), NOW(), NOW());
INSERT INTO organisation_members (id, organisation_id, account_id, role, joined_at) VALUES (UUID_TO_BIN('d1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'OWNER', NOW());
INSERT INTO teams (id, organisation_id, name, description, created_at) VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'backend-team', 'Backend engineers', NOW());
INSERT INTO teams (id, organisation_id, name, description, created_at) VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000002'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'devops-team', 'Infrastructure', NOW());

-- SECRET CATEGORIES
INSERT INTO secret_categories (id, account_id, organisation_id, path, created_at, updated_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), NULL, 'personal/social', NOW(), NOW());
INSERT INTO secret_categories (id, account_id, organisation_id, path, created_at, updated_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000002'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), NULL, 'personal/banking', NOW(), NOW());
INSERT INTO secret_categories (id, account_id, organisation_id, path, created_at, updated_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000003'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'production/database', NOW(), NOW());
INSERT INTO secret_categories (id, account_id, organisation_id, path, created_at, updated_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000004'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'production/api-keys', NOW(), NOW());
INSERT INTO secret_categories (id, account_id, organisation_id, path, created_at, updated_at) VALUES (UUID_TO_BIN('e1000000-0000-0000-0000-000000000005'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('c1000000-0000-0000-0000-000000000001'), 'staging/database', NOW(), NOW());

-- SECRETS (Using 'b' prefix for valid hex)
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'TWITTER_PASSWORD', 1, NOW());
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000002'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'LINKEDIN_PASSWORD', 1, NOW());
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000003'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000002'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'HSBC_PIN', 1, NOW());
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000005'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000003'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'DB_HOST', 1, NOW());
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000009'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000003'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'DB_PASSWORD', 2, NOW());
INSERT INTO secrets (id, category_id, account_id, `key`, current_version, created_at) VALUES (UUID_TO_BIN('b1000000-0000-0000-0000-000000000011'), UUID_TO_BIN('e1000000-0000-0000-0000-000000000004'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'STRIPE_API_KEY', 1, NOW());

-- SECRET VERSIONS (Re-encrypted for your specific 32-byte key)
-- TWITTER_PASSWORD -> "P@ssword123"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000001'), ' sZ2JLCEo2DemWJFe7rvh/oH55Gbd7qzfw2kB/fmHNPX03zZfhpJZ', 1, NOW());

-- LINKEDIN_PASSWORD -> "Linked-Safe-99"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000002'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000002'), 'lp5XE1+1tKi1POMKnqpObMIlS1uWuq387SfnXsRn7dnIIw4JheG7ftLx', 1, NOW());

-- HSBC_PIN -> "4492"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000003'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000003'), '2Jc4Tu/uiEVg7jSCH4/3vxzr5To8YRgD20MLe/dersY=', 1, NOW());

-- DB_HOST -> "prod-db.minivault.io"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000005'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000005'), '9wbGZRRpbYp49qnoJ6RrS5YxE6VdFS5y5jOWKp0XV4hZKSnS8pJsHrxAtn4io26R', 1, NOW());

-- DB_PASSWORD V1 -> "old_db_pass"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000009'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000009'), '+xbkjaWfDPbUoMmCGDTJoB4V+lxxd8XxonWonIOGCO+S50tiAE+t', 1, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- DB_PASSWORD V2 -> "new_secure_pass_2026"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000010'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000009'), 'vqI3NLsaN4hp8hkfCH2C46v6jx4EnpntL3QtYwU7FM9oqxVpaRF5uvyhzi0aJOxw', 2, NOW());

-- STRIPE_API_KEY -> "sk_live_51Mabc12345efgh6"
INSERT INTO secret_versions (id, secret_id, value, version, created_at)
VALUES (UUID_TO_BIN('f1000000-0000-0000-0000-000000000011'), UUID_TO_BIN('b1000000-0000-0000-0000-000000000011'), 'VCK4d9SWkBhc94jDsqoXlr+B/xdXBbQQR4LJYqlUOTnr01jBDn2ZaYSa0EjJSL1pDdqj8Q==', 1, NOW());

-- AUDIT LOG (Using 'd' prefix)
INSERT INTO audit_log (id, account_id, action, resource, resource_id, description, success, created_at) VALUES (UUID_TO_BIN('d1000000-0000-0000-0000-000000000001'), UUID_TO_BIN('a1000000-0000-0000-0000-000000000001'), 'LOGIN_SUCCESS', 'AUTH', NULL, 'Initial seed login', 1, NOW());