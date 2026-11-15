package vn.drinkool.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OptionGroupRepository extends JpaRepository<OptionGroup, Long> {

    List<OptionGroup> findByDeletedAtIsNullOrderBySortOrderAscIdAsc();

    Optional<OptionGroup> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
            select count(g) > 0 from OptionGroup g
            where lower(g.name) = lower(:name) and g.deletedAt is null and (:selfId is null or g.id <> :selfId)""")
    boolean nameTaken(String name, Long selfId);
}
