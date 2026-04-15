package com.meditrack.controller;

import com.meditrack.dto.LoginRequest;
import com.meditrack.dto.LoginResponse;
import com.meditrack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.authenticate(request);
        
        if (response != null) {
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Email ou mot de passe incorrect"));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        var userDTO = userService.getUserProfile(id);
        if (userDTO != null) {
            return ResponseEntity.ok(userDTO);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Utilisateur non trouvé"));
    }

    @PostMapping("/check")
    public ResponseEntity<?> checkAuth(@RequestBody Long userId) {
        var user = userService.getUserById(userId);
        if (user != null) {
            return ResponseEntity.ok(new MessageResponse("Authentification valide"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Non authentifié"));
    }

    // Classes internes pour les réponses
    public static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    public static class MessageResponse {
        public String message;
        public MessageResponse(String message) {
            this.message = message;
        }
    }
}
