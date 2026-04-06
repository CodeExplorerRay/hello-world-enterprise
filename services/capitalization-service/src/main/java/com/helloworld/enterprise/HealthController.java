package com.helloworld.enterprise;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "capitalization-service");
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
