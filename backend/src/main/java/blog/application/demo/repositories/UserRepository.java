package blog.application.demo.repositories;

import blog.application.demo.entities.users.AbstractUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AbstractUser, Long> {
    Optional<AbstractUser> findByUsername(String username);

    Optional<AbstractUser> findByEmail(String email);

    Optional<AbstractUser> findByVerificationToken(String verificationToken);
}
