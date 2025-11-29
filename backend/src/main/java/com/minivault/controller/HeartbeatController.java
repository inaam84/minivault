package com.minivault.controller;

import com.minivault.model.Heartbeat;
import com.minivault.repository.HeartbeatRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/heartbeat")
@RequiredArgsConstructor
public class HeartbeatController {

  @Autowired private HeartbeatRepository heartbeatRepository;

  private final JdbcTemplate jdbc;

  @GetMapping
  public Map<String, Object> get() {
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("status", "ok");
    res.put("app", "minivault-backend");
    res.put("time", Instant.now().toString());
    try {
      Timestamp dbNow = jdbc.queryForObject("SELECT NOW()", Timestamp.class);
      res.put(
          "db",
          Map.of("connected", true, "now", dbNow != null ? dbNow.toInstant().toString() : null));

      // Save the heartbeat
      Heartbeat hb = new Heartbeat();
      hb.setNote("API heartbeat at " + Instant.now());
      heartbeatRepository.save(hb);

    } catch (Exception e) {
      res.put("db", Map.of("connected", false, "error", e.getMessage()));
    }
    return res;
  }

  @PostMapping
  public Heartbeat post(@RequestBody(required = false) Map<String, String> body) {
    String note = body != null ? body.getOrDefault("note", null) : null;
    return heartbeatRepository.save(new Heartbeat(null, note, null));
  }

  @GetMapping("/simple")
  public Map<String, Object> heartbeat() {
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("time", Instant.now().toString());
    res.put("app", "Backend is up and running!");
    return res;
  }
}
