package blog.application.demo.repositories;

import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.users.Writer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AbstractUser, Long> {
    Optional<AbstractUser> findByUsername(String username);

    Optional<AbstractUser> findByEmail(String email);

    Optional<AbstractUser> findByVerificationToken(String verificationToken);

    /**
     * Count the number of writers in the system
     * @return Number of writers
     */
    @Query("SELECT COUNT(w) FROM Writer w")
    long countWriters();
}
