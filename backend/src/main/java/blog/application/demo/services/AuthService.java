package blog.application.demo.services;

import blog.application.demo.dto.request.LoginRequest;
import blog.application.demo.dto.request.RegisterRequest;
import blog.application.demo.dto.response.AuthResponse;
import blog.application.demo.entities.Role;
import blog.application.demo.entities.RoleName;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.InvalidVerificationTokenException;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.WriterAlreadyExistsException;
import blog.application.demo.mappers.UserMapper;
import blog.application.demo.repositories.RoleRepository;
import blog.application.demo.repositories.UserRepository;
import blog.application.demo.security.JwtGenerator;
import blog.application.demo.utils.Constants;
import blog.application.demo.utils.TokenGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtGenerator jwtGenerator;
    private final EmailService emailService;
    private final Constants constants;

    @Value("${app.email.verification.expiration}")
    private long verificationTokenExpiration;

    @Transactional
    public void register(RegisterRequest registerRequest) throws ExistingUsernameException, ExistingEmailException, ResourceNotFoundException {

        if (userRepository.findByUsername(registerRequest.username()).isPresent()) {
            throw new ExistingUsernameException("Username '" + registerRequest.username() + "' already exists");
        }

        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            throw new ExistingEmailException("Email '" + registerRequest.email() + "' already exists");
        }

        AbstractUser user = userMapper.toEntity(registerRequest, constants.ADMIN_REGISTER_CODE);
        user.setPassword(passwordEncoder.encode(registerRequest.password()));

        // check if attempting to create a writer when one already exists
        if ("WRITER".equals(user.getUserType())) {
            if (userRepository.countWriters() > 0) {
                throw new WriterAlreadyExistsException("Only one writer account is allowed in the system. A writer already exists.");
            }
        }


        // generate verification token
        String verificationToken = TokenGenerator.generateVerificationToken();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusSeconds(verificationTokenExpiration / 1000));
        user.setEmailVerified(false);

        List<RoleName> roleNames = (registerRequest.adminRegisterCode() != null &&
                registerRequest.adminRegisterCode().equals(constants.ADMIN_REGISTER_CODE))
                ? List.of(RoleName.ROLE_ADMIN, RoleName.ROLE_VIEWER, RoleName.ROLE_WRITER)
                : List.of(RoleName.ROLE_VIEWER);

        Set<Role> roles = roleNames.stream().map(roleName -> {
                    try {
                        return roleRepository.findByRoleName(roleName)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                    } catch (ResourceNotFoundException e) {
                        throw new RuntimeException("Role not found: " + roleName);
                    }
                })
                .collect(java.util.stream.Collectors.toSet());

        user.setRoles(roles);

        userRepository.save(user);

        // send verification email, MUST succeed for registration to complete
        emailService.sendVerificationEmail(user.getEmail(), verificationToken, user.getUsername());
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.username(),
                        loginRequest.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtGenerator.generateToken(authentication);
        return new AuthResponse(jwt);
    }


    @Transactional
    public void verifyEmail(String token) throws InvalidVerificationTokenException {
        AbstractUser user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidVerificationTokenException("Invalid verification token"));

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidVerificationTokenException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
    }
}
