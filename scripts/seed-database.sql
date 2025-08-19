-- Insert sample admin user
INSERT INTO users (id, email, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  ('admin-1', 'admin@kld.edu.ph', 'System Administrator', 'ADMIN', true, NOW(), NOW()),
  ('officer-1', 'officer@kld.edu.ph', 'Election Officer', 'ELECTION_OFFICER', true, NOW(), NOW());

-- Insert sample election
INSERT INTO elections (id, title, description, "startDate", "endDate", status, positions, "isActive", "createdAt", "updatedAt")
VALUES 
  ('election-1', 'Student Council Election 2024', 'Annual student council election for academic year 2024-2025', 
   '2024-03-01 08:00:00', '2024-03-03 18:00:00', 'UPCOMING', 
   ARRAY['President', 'Vice President', 'Secretary', 'Treasurer'], false, NOW(), NOW());

-- Insert sample candidates
INSERT INTO users (id, email, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  ('candidate-1', 'john.doe@kld.edu.ph', 'John Doe', 'CANDIDATE', true, NOW(), NOW()),
  ('candidate-2', 'jane.smith@kld.edu.ph', 'Jane Smith', 'CANDIDATE', true, NOW(), NOW());

INSERT INTO candidates (id, "userId", position, party, platform, status, "electionId", "createdAt", "updatedAt")
VALUES 
  ('cand-1', 'candidate-1', 'President', 'Unity Party', 'Promoting student welfare and academic excellence', 'APPROVED', 'election-1', NOW(), NOW()),
  ('cand-2', 'candidate-2', 'Vice President', 'Progress Party', 'Innovation in student services and campus life', 'APPROVED', 'election-1', NOW(), NOW());
