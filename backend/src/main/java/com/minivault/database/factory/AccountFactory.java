package com.minivault.database.factory;

import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AccountFactory extends BaseEntityFactory<Account> {

    private final PasswordEncoder passwordEncoder;

    public AccountFactory(AccountRepository accountRepository,
                          PasswordEncoder passwordEncoder) {
        super(accountRepository); // ✅ FIX
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected Account definition() {
        String email = faker.internet().safeEmailAddress();
        String name = faker.name().fullName();
        String password = passwordEncoder.encode("Password123!");

        return Account.builder()
                .email(email)
                .name(name)
                .password(password)
                .verified(faker.bool().bool())
                .build();
    }

    @Override
    protected void applyState(Account account) {
        if ("verified".equals(currentState)) {
            account.setVerified(true);
        } else if ("unverified".equals(currentState)) {
            account.setVerified(false);
        } else if ("admin".equals(currentState)) {
            account.setEmail("admin@minivault.io");
            account.setVerified(true);
        }
    }
}