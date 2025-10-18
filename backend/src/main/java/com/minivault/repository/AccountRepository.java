package com.minivault.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.minivault.model.Account;

public interface AccountRepository extends JpaRepository<Account, Long> { 
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);
}