package com.minivault.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minivault.model.Heartbeat;

public interface HeartbeatRepository extends JpaRepository<Heartbeat, Long> { }