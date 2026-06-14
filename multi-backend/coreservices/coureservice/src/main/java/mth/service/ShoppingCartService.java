package mth.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.ShoppingCart;
import mth.models.Users;
import mth.repository.ShoppingCartRepository;
import mth.repository.UsersRepository;

@Service
public class ShoppingCartService {
	@Autowired
	ShoppingCartRepository SCR;

	@Autowired
	UsersRepository UR;

	@Autowired
	JwtService JWT;

	private Users authorizeCustomer(String token) throws Exception {
		Map<String, Object> payload = JWT.validateJWT(token);
		Number role = (Number) payload.get("role");
		if(role == null || role.longValue() != 1)
			throw new Exception("Only customer accounts can add products to cart");

		String email = (String) payload.get("username");
		return (Users) UR.findByEmail(email);
	}

	public Object addToCart(Map<String, Object> data, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Users customer = authorizeCustomer(token);
			Long productId = Long.valueOf(data.get("productId").toString());
			String productName = data.get("productName").toString();
			int actualAmount = Integer.valueOf(data.get("actualAmount").toString());
			int amount = Integer.valueOf(data.get("amount").toString());
			if(amount <= 0)
				throw new Exception("Amount must be greater than zero");
			if(actualAmount <= 0)
				throw new Exception("Actual amount must be greater than zero");

			ShoppingCart item = SCR.findByCustomerIdAndProductId(customer.getId(), productId)
					.orElseGet(ShoppingCart::new);
			int existingAmount = item.getAmount() == null ? 0 : item.getAmount();
			item.setCustomerId(customer.getId());
			item.setProductId(productId);
			item.setProductName(productName);
			item.setActualAmount(actualAmount);
			item.setAmount(existingAmount + amount);
			SCR.save(item);

			response.put("code", 200);
			response.put("message", "Product added to cart");
			response.put("cartItem", item);
		}catch(Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getCart(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Users customer = authorizeCustomer(token);
			response.put("code", 200);
			response.put("cartItems", SCR.findByCustomerIdOrderByIdDesc(customer.getId()));
		}catch(Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
