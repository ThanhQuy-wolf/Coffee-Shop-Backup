package vn.drinkool.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByDeletedAtIsNullOrderByIdAsc();

    List<Product> findByDeletedAtIsNullAndCategoryIdOrderByIdAsc(Long categoryId);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    long countByCategoryIdAndDeletedAtIsNull(Long categoryId);

    @Query("""
            select count(p) > 0 from Product p
            where lower(p.name) = lower(:name) and p.deletedAt is null and (:selfId is null or p.id <> :selfId)""")
    boolean nameTaken(String name, Long selfId);
}
