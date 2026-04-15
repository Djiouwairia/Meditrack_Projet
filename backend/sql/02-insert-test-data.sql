-- Insertion des données de test
USE meditrack_db;

-- Insérer les utilisateurs de test
INSERT INTO users (email, password, nom, prenom, telephone, role, user_type, created_at, updated_at) VALUES
('admin@meditrack.com', 'test123', 'BA', 'Diouweratou', '+221 77 123 4567', 'ADMIN', 'ADMIN', NOW(), NOW()),
('dr.diallo@meditrack.com', 'test123', 'Diallo', 'Amadou', '+221 77 234 5678', 'MEDECIN', 'MEDECIN', NOW(), NOW()),
('patient@test.com', 'test123', 'Sow', 'Fatou', '+221 77 345 6789', 'PATIENT', 'PATIENT', NOW(), NOW());

-- Remplir les colonnes spécifiques pour le médecin (id = 2)
UPDATE users SET specialite = 'Cardiologie', numero_identification = 'MED001', adresse_cabinet = '123 Rue de la Paix, Dakar' WHERE id = 2;

-- Remplir les colonnes spécifiques pour le patient (id = 3)
UPDATE users SET 
    date_naissance = '1990-05-15',
    numero_securite_sociale = 'SS123456789',
    adresse = 'Dakar, Sénégal',
    medecin_traitant_id = 2,
    groupe_sanguin = 'O+',
    allergies = 'Pénicilline'
WHERE id = 3;

-- Remplir les colonnes spécifiques pour l'admin (id = 1)
UPDATE users SET departement = 'Administration' WHERE id = 1;
