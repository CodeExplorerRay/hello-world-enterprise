package com.helloworld.enterprise;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/capitalize")
public class CapitalizationController {

    /**
     * Enterprise-grade capitalization endpoint.
     * 
     * This service exists because capitalizing a string is a 
     * cross-cutting concern that deserves its own deployment,
     * CI/CD pipeline, and on-call rotation.
     * 
     * @param request The text to capitalize
     * @return Capitalized text with extensive metadata
     */
    @GetMapping
    public Map<String, Object> capitalizeFromQuery(@RequestParam(required = false) String text) {
        if (text == null || text.trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("service", "capitalization-service");
            response.put("status", "running");
            response.put("usage", "POST /capitalize with JSON {\"text\":\"hello\"} or GET /capitalize?text=hello");
            return response;
        }

        return buildCapitalizationResponse(text);
    }

    @PostMapping
    public Map<String, Object> capitalize(@RequestBody Map<String, String> request) {
        return buildCapitalizationResponse(request.get("text"));
    }

    private Map<String, Object> buildCapitalizationResponse(String input) {
        String normalized = input == null ? "" : input.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }

        String result = normalized.substring(0, 1).toUpperCase() + normalized.substring(1);

        Map<String, Object> response = new HashMap<>();
        response.put("original", normalized);
        response.put("capitalized", result);
        response.put("charactersCapitalized", 1);
        response.put("jvmHeapUsedMB", Runtime.getRuntime().totalMemory() / (1024 * 1024));
        response.put("wasSpringBootOverkill", true);
        response.put("doWeRegretThis", "no");
        response.put("springBootStartupTimeMs", 4200);
        
        return response;
    }
}
