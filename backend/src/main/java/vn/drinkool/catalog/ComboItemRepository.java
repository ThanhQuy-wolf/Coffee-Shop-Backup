package vn.drinkool.catalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ComboItemRepository extends JpaRepository<ComboItem, ComboItem.Key> {

    List<ComboItem> findByComboIdOrderBySortOrderAscProductIdAsc(Long comboId);

    @Query("""
            select count(i) > 0 from ComboItem i, Combo c
            where i.comboId = c.id and c.deletedAt is null and i.productId = :productId""")
    boolean usedByLiveCombo(Long productId);
}
