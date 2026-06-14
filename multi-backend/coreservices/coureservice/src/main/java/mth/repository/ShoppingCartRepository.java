package mth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.ShoppingCart;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
	List<ShoppingCart> findByCustomerIdOrderByIdDesc(Long customerId);

	Optional<ShoppingCart> findByCustomerIdAndProductId(Long customerId, Long productId);
}
