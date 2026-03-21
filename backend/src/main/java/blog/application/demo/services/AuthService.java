package blog.application.demo.services;

import blog.application.demo.dto.AuthDto;
import blog.application.demo.dto.LoginDto;
import blog.application.demo.dto.RegisterDto;
import blog.application.demo.entities.Role;
import blog.application.demo.entities.RoleName;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.users.Viewer;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.mappers.UserMapper;
import blog.application.demo.repositories.RoleRepository;
import blog.application.demo.repositories.UserRepository;
import blog.application.demo.security.JwtGenerator;
import blog.application.demo.utils.Constants;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtGenerator jwtGenerator;
    private final Constants constants;

    @Transactional
    public void register(RegisterDto registerDTO) throws ExistingUsernameException, ExistingEmailException, ResourceNotFoundException {

        if (userRepository.findByUsername(registerDTO.username()).isPresent()) {
            throw new ExistingUsernameException("Username '" + registerDTO.username() + "' already exists");
        }

        if (userRepository.findByEmail(registerDTO.email()).isPresent()) {
            throw new ExistingEmailException("Email '" + registerDTO.email() + "' already exists");
        }

        AbstractUser user = userMapper.toEntity(registerDTO);

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(registerDTO.password()));

        List<RoleName> roleNames = (registerDTO.adminRegisterCode() != null &&
                registerDTO.adminRegisterCode().equals(Constants.ADMIN_REGISTER_CODE))
                ? List.of(RoleName.ROLE_ADMIN, RoleName.ROLE_VIEWER, RoleName.ROLE_WRITER)
                : List.of(RoleName.ROLE_VIEWER);

        // load role from database
        Set<Role> roles = roleNames.stream().map(roleName -> {
                    try {
                        return roleRepository.findByRoleName(roleName)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                    } catch (ResourceNotFoundException e) {
                        throw new RuntimeException("Role not found: " + roleName);
                    }
                })
                .collect(java.util.stream.Collectors.toSet());

        // Set roles on the user before saving
        user.setRoles(roles);

        userRepository.save(user);
    }

    @Transactional
    public AuthDto login(LoginDto loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.username(),
                        loginDTO.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtGenerator.generateToken(authentication);
        return new AuthDto(jwt);
    }

}
