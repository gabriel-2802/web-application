package blog.application.demo.security;

import blog.application.demo.utils.Constants;
import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtGenerator {

    private final Constants constants;

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date(System.currentTimeMillis());
        Date expire = new Date(now.getTime() + constants.JWT_EXPIRATION);

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expire)
                .signWith(constants.getKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException | MalformedJwtException e) {
            log.error("Invalid JWT: {}", e.getMessage());
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Fatal exception while validating JWT: {}", e.getMessage());
        }
        return false;
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(constants.getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}