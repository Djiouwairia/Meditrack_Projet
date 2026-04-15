package com.meditrack.dto;

import com.meditrack.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private UserRole role;
    private LocalDateTime createdAt;
}
