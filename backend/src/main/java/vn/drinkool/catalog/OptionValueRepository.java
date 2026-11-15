package vn.drinkool.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OptionValueRepository extends JpaRepository<OptionValue, Long> {

    List<OptionValue> findByDeletedAtIsNullOrderBySortOrderAscIdAsc();

    List<OptionValue> findByOptionGroupIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(Long optionGroupId);

    List<OptionValue> findByOptionGroupId(Long optionGroupId);

    Optional<OptionValue> findByIdAndDeletedAtIsNull(Long id);
}
