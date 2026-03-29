package com.minivault.database.factory;

import com.minivault.model.Account;
import com.minivault.model.Secret;
import com.minivault.model.SecretCategory;
import com.minivault.repository.SecretRepository;
import org.springframework.stereotype.Component;

@Component
public class SecretFactory extends BaseEntityFactory<Secret> {

    // Realistic secret key names grouped by type
    private static final String[] DB_KEYS = {
            "DB_HOST", "DB_PORT", "DB_NAME", "DB_USERNAME", "DB_PASSWORD",
            "DB_URL", "DB_MAX_POOL_SIZE", "DB_SSL_MODE",
    };

    private static final String[] API_KEYS = {
            "STRIPE_SECRET_KEY", "STRIPE_PUBLIC_KEY", "STRIPE_WEBHOOK_SECRET",
            "SENDGRID_API_KEY", "TWILIO_AUTH_TOKEN", "TWILIO_ACCOUNT_SID",
            "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
            "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION",
            "GITHUB_TOKEN", "SLACK_WEBHOOK_URL",
    };

    private static final String[] EMAIL_KEYS = {
            "SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD",
            "MAIL_FROM", "MAIL_REPLY_TO",
    };

    private static final String[] GENERIC_KEYS = {
            "JWT_SECRET", "APP_SECRET_KEY", "ENCRYPTION_KEY",
            "SESSION_SECRET", "CSRF_SECRET", "API_TOKEN",
    };

    private Account account;
    private SecretCategory category;

    public SecretFactory(SecretRepository repository) {
        super(repository);
    }

    public SecretFactory forAccount(Account account) {
        this.account = account;
        return this;
    }

    public SecretFactory forCategory(SecretCategory category) {
        this.category = category;
        return this;
    }

    @Override
    protected Secret definition() {
        if (account == null || category == null) {
            throw new IllegalStateException(
                    "Account and Category must be set via forAccount() and forCategory() before creating Secret");
        }

        String key = resolveKeyForPath(category.getPath());

        return Secret.builder()
                .account(account)
                .category(category)
                .key(key)
                .currentVersion(1)
                .build();
    }

    @Override
    protected void applyState(Secret secret) {
        if ("versioned".equals(currentState)) {
            // Simulate a secret that has been updated multiple times
            secret.setCurrentVersion(faker.number().numberBetween(2, 5));
        }
    }

    // Pick a realistic key name based on the category path
    private String resolveKeyForPath(String path) {
        if (path != null && path.contains("database")) {
            return faker.options().option(DB_KEYS);
        } else if (path != null && path.contains("api")) {
            return faker.options().option(API_KEYS);
        } else if (path != null && path.contains("email")) {
            return faker.options().option(EMAIL_KEYS);
        } else {
            return faker.options().option(GENERIC_KEYS);
        }
    }
}