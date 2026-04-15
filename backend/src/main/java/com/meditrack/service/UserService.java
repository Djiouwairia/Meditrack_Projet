package com.meditrack.service;

import com.meditrack.dto.UserDTO;
import com.meditrack.entity.User;
import com.meditrack.dto.LoginRequest;
import com.meditrack.dto.LoginResponse;
import com.meditrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse authenticate(LoginRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isPresent() && isPasswordValid(request.getPassword(), user.get().getPassword())) {
            return convertToLoginResponse(user.get());
        }

        return null;
    }

    private boolean isPasswordValid(String rawPassword, String storedPassword) {
        // Authentification basique: comparaison directe (production: utiliser BCrypt)
        return rawPassword.equals(storedPassword);
    }

    private LoginResponse convertToLoginResponse(User user) {
        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setNom(user.getNom());
        response.setPrenom(user.getPrenom());
        response.setTelephone(user.getTelephone());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public UserDTO getUserProfile(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return convertToDTO(user.get());
        }
        return null;
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setTelephone(user.getTelephone());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    // Dans UserService, ajoutez ces méthodes si elles n'existent pas :

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
