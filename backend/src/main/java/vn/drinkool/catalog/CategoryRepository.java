package vn.drinkool.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByDeletedAtIsNullOrderBySortOrderAscIdAsc();

    Optional<Category> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
            select count(c) > 0 from Category c
            where lower(c.name) = lower(:name) and c.deletedAt is null and (:selfId is null or c.id <> :selfId)""")
    boolean nameTaken(String name, Long selfId);
}
