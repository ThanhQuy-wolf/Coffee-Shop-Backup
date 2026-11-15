package vn.drinkool.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboRepository extends JpaRepository<Combo, Long> {

    List<Combo> findByDeletedAtIsNullOrderByIdAsc();

    Optional<Combo> findByIdAndDeletedAtIsNull(Long id);
}
