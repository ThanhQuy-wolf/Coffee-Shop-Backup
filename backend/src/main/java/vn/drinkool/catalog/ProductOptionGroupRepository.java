package vn.drinkool.catalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductOptionGroupRepository extends JpaRepository<ProductOptionGroup, ProductOptionGroup.Key> {

    List<ProductOptionGroup> findByProductIdOrderBySortOrderAsc(Long productId);

    @Query("""
            select count(pg) from ProductOptionGroup pg, Product p
            where pg.productId = p.id and p.deletedAt is null and pg.optionGroupId = :groupId""")
    long countLiveProductsUsing(Long groupId);
}
