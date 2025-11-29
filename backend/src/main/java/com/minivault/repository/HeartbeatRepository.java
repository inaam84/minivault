package com.minivault.repository;

import com.minivault.model.Heartbeat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HeartbeatRepository extends JpaRepository<Heartbeat, Long> {}
