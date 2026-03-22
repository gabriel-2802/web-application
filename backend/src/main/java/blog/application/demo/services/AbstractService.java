package blog.application.demo.services;

import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RequiredArgsConstructor
public abstract class AbstractService {
    protected final UserRepository userRepository;

    protected Writer getCurrentWriter() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        String username = authentication.getName();

        if (username == null || username.isBlank()) {
            throw new UnauthorizedException("Invalid authentication credentials");
        }

        return userRepository.findByUsername(username)
                .filter(user -> user instanceof Writer)
                .map(user -> (Writer) user)
                .orElseThrow(() -> new UnauthorizedException("User not found or is not a Writer"));
    }

    protected AbstractUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
