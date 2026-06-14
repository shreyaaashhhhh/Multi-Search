package mth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.service.ShoppingCartService;

@RestController
@RequestMapping("/cart")
public class ShoppingCartController {
	@Autowired
	ShoppingCartService SCS;

	@PostMapping("/add")
	public Object addToCart(@RequestBody Map<String, Object> data, @RequestHeader("Token") String token) {
		return SCS.addToCart(data, token);
	}

	@GetMapping("/items")
	public Object getCart(@RequestHeader("Token") String token) {
		return SCS.getCart(token);
	}
}
