package com.helloworld.enterprise;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
public class HealthController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("health", "/health");
        endpoints.put("capitalize", "/capitalize");

        response.put("service", "capitalization-service");
        response.put("status", "running");
        response.put("usage", "POST /capitalize with JSON {\"text\":\"hello\"} or GET /capitalize?text=hello");
        response.put("endpoints", endpoints);
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "capitalization-service");
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
