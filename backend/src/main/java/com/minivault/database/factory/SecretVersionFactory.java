package com.minivault.database.factory;

import com.minivault.model.Secret;
import com.minivault.model.SecretVersion;
import com.minivault.repository.SecretVersionRepository;
import org.springframework.stereotype.Component;

@Component
public class SecretVersionFactory extends BaseEntityFactory<SecretVersion> {

    // Realistic values matching what each key type would hold
    private static final String[] DB_HOSTS     = { "db.prod.internal", "mysql.prod.company.io", "postgres.internal" };
    private static final String[] DB_NAMES     = { "app_production", "minivault_prod", "users_db", "analytics" };
    private static final String[] DB_USERS     = { "app_user", "db_admin", "readonly_user", "service_account" };
    private static final String[] REGIONS      = { "eu-west-1", "us-east-1", "ap-southeast-1" };

    private Secret secret;
    private int versionNumber = 1;

    public SecretVersionFactory(SecretVersionRepository repository) {
        super(repository);
    }

    public SecretVersionFactory forSecret(Secret secret) {
        this.secret = secret;
        return this;
    }

    public SecretVersionFactory withVersion(int version) {
        this.versionNumber = version;
        return this;
    }

    @Override
    protected SecretVersion definition() {
        if (secret == null) {
            throw new IllegalStateException(
                    "Secret must be set via forSecret() before creating SecretVersion");
        }

        // Value is plaintext here — SecretValueConverter encrypts it on save automatically
        String value = resolveValueForKey(secret.getKey());

        return SecretVersion.builder()
                .secret(secret)
                .value(value)
                .version(versionNumber)
                .build();
    }

    @Override
    protected void applyState(SecretVersion version) {
        if ("rotated".equals(currentState)) {
            // Simulate a rotated value — append suffix to distinguish from v1
            version.setValue(version.getValue() + "_rotated_v" + versionNumber);
        }
    }

    // Generate realistic values based on key name
    private String resolveValueForKey(String key) {
        if (key == null) return faker.internet().password(16, 32);

        return switch (key) {
            case "DB_HOST"              -> faker.options().option(DB_HOSTS);
            case "DB_PORT"              -> faker.options().option("3306", "5432", "27017", "6379");
            case "DB_NAME"              -> faker.options().option(DB_NAMES);
            case "DB_USERNAME"          -> faker.options().option(DB_USERS);
            case "DB_PASSWORD"          -> faker.internet().password(20, 32, true, true, true);
            case "DB_URL"               -> "jdbc:mysql://" + faker.options().option(DB_HOSTS) + ":3306/app_prod";
            case "DB_SSL_MODE"          -> faker.options().option("require", "verify-full", "disable");
            case "DB_MAX_POOL_SIZE"     -> String.valueOf(faker.number().numberBetween(5, 50));
            case "STRIPE_SECRET_KEY"    -> "sk_live_" + faker.regexify("[a-zA-Z0-9]{32}");
            case "STRIPE_PUBLIC_KEY"    -> "pk_live_" + faker.regexify("[a-zA-Z0-9]{32}");
            case "STRIPE_WEBHOOK_SECRET"-> "whsec_" + faker.regexify("[a-zA-Z0-9]{32}");
            case "SENDGRID_API_KEY"     -> "SG." + faker.regexify("[a-zA-Z0-9]{22}") + "." + faker.regexify("[a-zA-Z0-9]{43}");
            case "TWILIO_AUTH_TOKEN"    -> faker.regexify("[a-f0-9]{32}");
            case "TWILIO_ACCOUNT_SID"   -> "AC" + faker.regexify("[a-f0-9]{32}");
            case "GOOGLE_CLIENT_ID"     -> faker.regexify("[0-9]{12}") + "-" + faker.regexify("[a-z0-9]{32}") + ".apps.googleusercontent.com";
            case "GOOGLE_CLIENT_SECRET" -> "GOCSPX-" + faker.regexify("[a-zA-Z0-9_-]{28}");
            case "AWS_ACCESS_KEY_ID"    -> "AKIA" + faker.regexify("[A-Z0-9]{16}");
            case "AWS_SECRET_ACCESS_KEY"-> faker.regexify("[a-zA-Z0-9/+]{40}");
            case "AWS_REGION"           -> faker.options().option(REGIONS);
            case "GITHUB_TOKEN"         -> "ghp_" + faker.regexify("[a-zA-Z0-9]{36}");
            case "SLACK_WEBHOOK_URL"    -> "https://hooks.slack.com/services/T" + faker.regexify("[A-Z0-9]{8}") + "/B" + faker.regexify("[A-Z0-9]{8}") + "/" + faker.regexify("[a-zA-Z0-9]{24}");
            case "SMTP_HOST"            -> faker.options().option("smtp.sendgrid.net", "smtp.mailgun.org", "email-smtp.eu-west-1.amazonaws.com");
            case "SMTP_PORT"            -> faker.options().option("587", "465", "25");
            case "SMTP_USERNAME"        -> faker.internet().emailAddress();
            case "SMTP_PASSWORD"        -> faker.internet().password(16, 24);
            case "MAIL_FROM"            -> "noreply@" + faker.internet().domainName();
            case "MAIL_REPLY_TO"        -> "support@" + faker.internet().domainName();
            case "JWT_SECRET"           -> faker.regexify("[a-zA-Z0-9]{64}");
            case "APP_SECRET_KEY"       -> faker.regexify("[a-zA-Z0-9]{48}");
            case "ENCRYPTION_KEY"       -> faker.regexify("[a-f0-9]{64}");
            case "SESSION_SECRET"       -> faker.regexify("[a-zA-Z0-9]{32}");
            case "CSRF_SECRET"          -> faker.regexify("[a-zA-Z0-9]{32}");
            case "API_TOKEN"            -> faker.regexify("[a-zA-Z0-9_-]{40}");
            default                     -> faker.internet().password(16, 32);
        };
    }
}