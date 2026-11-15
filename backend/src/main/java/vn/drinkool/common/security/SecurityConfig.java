package vn.drinkool.common.security;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class SecurityConfig {

    private static final String V1 = "/api/v1";

    @Bean
    public SecurityFilterChain api(HttpSecurity http, ProblemAuthHandlers handlers) throws Exception {
        http
                .csrf(c -> c.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/actuator/health/**", "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer/login").permitAll()
                        .requestMatchers(HttpMethod.POST, V1 + "/auth/staff/login", V1 + "/auth/otp/request",
                                V1 + "/auth/register", V1 + "/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.GET, V1 + "/shop", V1 + "/menu").permitAll()
                        .requestMatchers(V1 + "/shop", V1 + "/shop/settings").hasRole("MANAGER")
                        // Nhóm C: nhân viên xem danh mục và tắt/bật món, giá trị tuỳ chọn khi hết nguyên liệu
                        .requestMatchers(HttpMethod.GET, V1 + "/categories", V1 + "/products", V1 + "/combos",
                                V1 + "/option-groups").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, V1 + "/products/*/availability",
                                V1 + "/option-values/*/availability").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers(V1 + "/categories/**", V1 + "/products/**", V1 + "/combos/**",
                                V1 + "/option-groups/**", V1 + "/option-values/**").hasRole("MANAGER")
                        .requestMatchers(V1 + "/reports/**").hasRole("MANAGER")
                        // Nhóm R
                        .requestMatchers(HttpMethod.POST, V1 + "/orders/*/review").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, V1 + "/reviews").hasRole("MANAGER")
                        // Nhóm W: nhân viên xem lịch, tự đăng ký, huỷ đăng ký, xin nghỉ; còn lại là việc của quản lý
                        .requestMatchers(HttpMethod.GET, V1 + "/departments", V1 + "/shifts").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers(V1 + "/shifts/*/registrations", V1 + "/shifts/*/registrations/me",
                                V1 + "/shift-assignments/*/leave-request").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers(V1 + "/staff", V1 + "/shifts", V1 + "/shifts/**",
                                V1 + "/shift-assignments/**").hasRole("MANAGER")
                        // Nhóm O: khách vãng lai đặt, xem, huỷ đơn bằng guestToken; quyền chi tiết kiểm trong service
                        .requestMatchers(HttpMethod.POST, V1 + "/orders", V1 + "/orders/*/cancel").permitAll()
                        .requestMatchers(HttpMethod.GET, V1 + "/orders/*").permitAll()
                        .requestMatchers(HttpMethod.GET, V1 + "/me/orders").hasRole("CUSTOMER")
                        .requestMatchers(V1 + "/orders", V1 + "/orders/**").hasAnyRole("STAFF", "MANAGER")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(handlers)
                        .accessDeniedHandler(handlers))
                .exceptionHandling(e -> e.authenticationEntryPoint(handlers).accessDeniedHandler(handlers));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecretKey jwtKey(JwtProperties props) {
        byte[] bytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("drinkool.jwt.secret phải dài ít nhất 32 byte");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtKey) {
        return NimbusJwtDecoder.withSecretKey(jwtKey).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtKey));
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("role");
        roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }
}
