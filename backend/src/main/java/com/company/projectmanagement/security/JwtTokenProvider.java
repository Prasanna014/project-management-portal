package com.company.projectmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    private Key signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception ignored) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        this.signingKey = Keys.hmacShaKeyFor(normalizeKeyLength(keyBytes));
    }

    public String generateToken(SecurityUserPrincipal principal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String permissions = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .sorted()
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("uid", principal.userId())
                .claim("cid", principal.companyId())
                .claim("perms", permissions)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Object uid = getClaims(token).get("uid");
        if (uid instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(uid));
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] normalizeKeyLength(byte[] keyBytes) {
        if (keyBytes.length >= 32) {
            return keyBytes;
        }
        byte[] resized = new byte[32];
        for (int i = 0; i < resized.length; i++) {
            resized[i] = keyBytes[i % keyBytes.length];
        }
        return resized;
    }
}
