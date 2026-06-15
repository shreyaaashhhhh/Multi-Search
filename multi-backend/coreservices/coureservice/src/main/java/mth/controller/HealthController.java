package mth.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
	@GetMapping("/")
	public Map<String, Object> health() {
		return Map.of("code", 200, "message", "Core service started");
	}
}
