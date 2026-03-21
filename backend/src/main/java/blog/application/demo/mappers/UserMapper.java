package blog.application.demo.mappers;

import blog.application.demo.dto.RegisterDto;
import blog.application.demo.dto.UserDto;
import blog.application.demo.entities.Role;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.users.Viewer;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.utils.Constants;
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
    
    default AbstractUser toEntity(RegisterDto userDTO) {
        if (userDTO == null) {
            return null;
        }
        
        AbstractUser user;

        if (userDTO.adminRegisterCode() != null &&
            userDTO.adminRegisterCode().equals(Constants.ADMIN_REGISTER_CODE)) {
            user = new Writer();
        } else {
            user = new Viewer();
        }

        user.setUsername(userDTO.username());
        user.setPassword(userDTO.password());
        user.setEmail(userDTO.email());
        
        return user;
    }

    @Mapping(target = "roles", source = "authorities")
    UserDto toDTO(AbstractUser user);

    default Set<String> map(Collection<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Role::getAuthority)
                .collect(Collectors.toSet());
    }
}
