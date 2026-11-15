package vn.drinkool.auth;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByPhoneAndRole(String phone, Role role);

    Optional<AppUser> findByUsernameAndRoleIn(String username, Collection<Role> roles);

    List<AppUser> findByRoleInOrderByIdAsc(Collection<Role> roles);

    boolean existsByPhone(String phone);
}
