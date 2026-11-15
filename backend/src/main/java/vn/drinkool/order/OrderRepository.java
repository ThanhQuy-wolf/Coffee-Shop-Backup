package vn.drinkool.order;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByIdempotencyKey(String idempotencyKey);

    List<CustomerOrder> findByCustomerIdOrderByCreatedAtDescIdDesc(Long customerId, Pageable page);

    @Query("""
            select o from CustomerOrder o
            where o.createdAt >= :from and o.createdAt < :to
              and o.status in :statuses
              and (:code = '' or upper(o.code) like concat('%', :code, '%'))
            order by o.createdAt, o.id""")
    List<CustomerOrder> queue(Instant from, Instant to, Collection<OrderStatus> statuses, String code);
}
