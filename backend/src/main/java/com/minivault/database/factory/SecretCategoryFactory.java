package com.minivault.database.factory;

import com.minivault.model.Account;
import com.minivault.model.SecretCategory;
import com.minivault.repository.SecretCategoryRepository;
import org.springframework.stereotype.Component;

@Component
public class SecretCategoryFactory extends BaseEntityFactory<SecretCategory> {

    // Realistic paths that mirror real-world secret structures
    private static final String[] PATHS = {
            "production/database",
            "production/api-keys",
            "production/email",
            "production/payments",
            "staging/database",
            "staging/api-keys",
            "staging/email",
            "development/database",
            "development/api-keys",
            "personal/social",
            "personal/banking",
            "personal/cloud",
    };

    private Account account;

    public SecretCategoryFactory(SecretCategoryRepository repository) {
        super(repository);
    }

    // Call this before create() to associate with an account
    public SecretCategoryFactory forAccount(Account account) {
        this.account = account;
        return this;
    }

    @Override
    protected SecretCategory definition() {
        if (account == null) {
            throw new IllegalStateException("Account must be set via forAccount() before creating SecretCategory");
        }

        String path = faker.options().option(PATHS);

        return SecretCategory.builder()
                .account(account)
                .path(path)
                .build();
    }

    @Override
    protected void applyState(SecretCategory category) {
        if ("production".equals(currentState)) {
            category.setPath("production/" + faker.hacker().noun().toLowerCase().replace(" ", "-"));
        } else if ("staging".equals(currentState)) {
            category.setPath("staging/" + faker.hacker().noun().toLowerCase().replace(" ", "-"));
        } else if ("personal".equals(currentState)) {
            category.setPath("personal/" + faker.hacker().noun().toLowerCase().replace(" ", "-"));
        }
    }
}