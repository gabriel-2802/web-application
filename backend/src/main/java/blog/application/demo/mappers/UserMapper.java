package blog.application.demo.mappers;

import blog.application.demo.dto.request.RegisterRequest;
import blog.application.demo.dto.response.UserResponse;
import blog.application.demo.entities.Role;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.users.Viewer;
import blog.application.demo.entities.users.Writer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(
    componentModel = "spring",
        uses = {RoleMapper.class}
)
public interface UserMapper {
    
    default AbstractUser toEntity(RegisterRequest registerRequest, Long adminCode) {
        if (registerRequest == null) {
            return null;
        }
        
        AbstractUser user;

        if (registerRequest.adminRegisterCode() != null &&
            registerRequest.adminRegisterCode().equals(adminCode)) {
            user = new Writer();
        } else {
            user = new Viewer();
        }

        user.setUsername(registerRequest.username());
        user.setPassword(registerRequest.password());
        user.setEmail(registerRequest.email());
        
        return user;
    }

    @Mapping(target = "roles", source = "authorities")
    UserResponse toResponse(AbstractUser user);

    default Set<String> map(Collection<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Role::getAuthority)
                .collect(Collectors.toSet());
    }
}
