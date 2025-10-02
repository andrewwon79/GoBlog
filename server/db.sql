CREATE TABLE Todo (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    body VARCHAR(50) NOT NULL,
    completed boolean DEFAULT FALSE
);

INSERT INTO todo (body) VALUES ('Dentist tomorrow at 1 PM'); 