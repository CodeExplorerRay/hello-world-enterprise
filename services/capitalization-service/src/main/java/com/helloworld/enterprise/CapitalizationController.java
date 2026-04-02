package com.helloworld.enterprise;

import org.springframework.web.bind.annotation.*;
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
    @PostMapping
    public Map<String, Object> capitalize(@RequestBody Map<String, String> request) {
        String input = request.get("text");
        String result = input.substring(0, 1).toUpperCase() + input.substring(1);
        
        Map<String, Object> response = new HashMap<>();
        response.put("original", input);
        response.put("capitalized", result);
        response.put("charactersCapitalized", 1);
        response.put("jvmHeapUsedMB", Runtime.getRuntime().totalMemory() / (1024 * 1024));
        response.put("wasSpringBootOverkill", true);
        response.put("doWeRegretThis", "no");
        response.put("springBootStartupTimeMs", 4200);
        
        return response;
    }
}