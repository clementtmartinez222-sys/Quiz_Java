package com.example.backendquizz.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final JdbcTemplate jdbcTemplate;

    public ContactController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public String sendMessage(@Valid @RequestBody ContactRequest contact) {
        jdbcTemplate.update(
                "INSERT INTO contact_message (name, email, message) VALUES (?, ?, ?)",
                contact.name().trim(),
                contact.email().trim(),
                contact.message().trim()
        );
        return "Votre message a bien été enregistré.";
    }

    public record ContactRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 10, max = 2000) String message
    ) {
    }
}
