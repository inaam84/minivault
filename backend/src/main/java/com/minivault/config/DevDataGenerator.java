package com.minivault.config;

import com.minivault.util.EncryptionUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevDataGenerator {
    @Bean
    public CommandLineRunner generateSeeds(EncryptionUtil enc) {
        return args -> {
            System.out.println("==== GENERATED ENCRYPTED VALUES ====");
            System.out.println("TWITTER_PASSWORD: " + enc.encrypt("P@ssword123"));
            System.out.println("LINKEDIN_PASSWORD: " + enc.encrypt("Linked-Safe-99"));
            System.out.println("HSBC_PIN: " + enc.encrypt("4492"));
            System.out.println("DB_HOST: " + enc.encrypt("prod-db.minivault.io"));
            System.out.println("DB_PASSWORD_V1: " + enc.encrypt("old_db_pass"));
            System.out.println("DB_PASSWORD_V2: " + enc.encrypt("new_secure_pass_2026"));
            System.out.println("STRIPE_API_KEY: " + enc.encrypt("sk_live_51Mabc12345efgh6"));
            System.out.println("====================================");
        };
    }
}
