-- Insert Movies (including all required films)
INSERT INTO movies (title) VALUES
                               ('Anora'),
                               ('The Brutalist'),
                               ('A Complete Unknown'),
                               ('Conclave'),
                               ('Dune: Part Two'),
                               ('Emilia Pérez'),
                               ('I''m Still Here'),
                               ('Nickel Boys'),
                               ('The Substance'),
                               ('Wicked'),
                               ('The Apprentice'),
                               ('A Real Pain'),
                               ('Flow'),
                               ('Inside Out 2'),
                               ('Memoir of a Snail'),
                               ('Wallace & Gromit: Vengeance Most Fowl'),
                               ('The Wild Robot'),
                               ('Maria'),
                               ('Nosferatu'),
                               ('Gladiator II'),
                               ('Black Box Diaries'),
                               ('No Other Land'),
                               ('Porcelain War'),
                               ('Soundtrack to a Coup d''Etat'),
                               ('Sugarcane'),
                               ('The Girl with the Needle'),
                               ('The Seed of the Sacred Fig'),
                               ('A Different Man'),
                               ('Alien: Romulus'),
                               ('Better Man'),
                               ('Kingdom of the Planet of the Apes'),
                               ('Sing Sing'),
                               ('Elton John: Never Too Late'),
                               ('The Six Triple Eight'),
                               ('September 5');

-- Insert Categories
INSERT INTO categories (name, type) VALUES
                                        ('Best Picture', 'picture'),
                                        ('Performance by an Actor in a Leading Role', 'performance'),
                                        ('Performance by an Actor in a Supporting Role', 'performance'),
                                        ('Performance by an Actress in a Leading Role', 'performance'),
                                        ('Performance by an Actress in a Supporting Role', 'performance'),
                                        ('Best Animated Feature Film', 'picture'),
                                        ('Best Animated Short Film', 'short'),
                                        ('Achievement in Cinematography', 'technical'),
                                        ('Achievement in Costume Design', 'technical'),
                                        ('Achievement in Directing', 'creative'),
                                        ('Best Documentary Feature Film', 'documentary'),
                                        ('Best Documentary Short Film', 'short'),
                                        ('Achievement in Film Editing', 'technical'),
                                        ('Best International Feature Film', 'international'),
                                        ('Achievement in Makeup and Hairstyling', 'technical'),
                                        ('Original Score', 'creative'),
                                        ('Original Song', 'creative'),
                                        ('Achievement in Production Design', 'technical'),
                                        ('Best Live Action Short Film', 'short'),
                                        ('Achievement in Sound', 'technical'),
                                        ('Achievement in Visual Effects', 'technical'),
                                        ('Adapted Screenplay', 'writing'),
                                        ('Original Screenplay', 'writing');

-- Insert Nominees
WITH
    movies AS (SELECT id, title FROM movies),
    categories AS (SELECT id, name FROM categories)
INSERT INTO nominees (name, movie_id, category_id)
-- Best Picture
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Best Picture'
WHERE m.title IN ('Anora', 'The Brutalist', 'A Complete Unknown', 'Conclave', 'Dune: Part Two',
                  'Emilia Pérez', 'I''m Still Here', 'Nickel Boys', 'The Substance', 'Wicked')

UNION ALL
-- Actor in a Leading Role
SELECT nom.name, m.id, c.id FROM (VALUES
                                      ('Adrien Brody', 'The Brutalist'),
                                      ('Timothée Chalamet', 'A Complete Unknown'),
                                      ('Colman Domingo', 'Sing Sing'),
                                      ('Ralph Fiennes', 'Conclave'),
                                      ('Sebastian Stan', 'The Apprentice')
                                 ) AS nom(name, movie)
                                     JOIN movies m ON m.title = nom.movie
                                     JOIN categories c ON c.name = 'Performance by an Actor in a Leading Role'

UNION ALL
-- Actor in a Supporting Role
SELECT nom.name, m.id, c.id FROM (VALUES
                                      ('Yura Borisov', 'Anora'),
                                      ('Kieran Culkin', 'A Real Pain'),
                                      ('Edward Norton', 'A Complete Unknown'),
                                      ('Guy Pearce', 'The Brutalist'),
                                      ('Jeremy Strong', 'The Apprentice')
                                 ) AS nom(name, movie)
                                     JOIN movies m ON m.title = nom.movie
                                     JOIN categories c ON c.name = 'Performance by an Actor in a Supporting Role'

UNION ALL
-- Actress in a Leading Role
SELECT nom.name, m.id, c.id FROM (VALUES
                                      ('Cynthia Erivo', 'Wicked'),
                                      ('Karla Sofía Gascón', 'Emilia Pérez'),
                                      ('Mikey Madison', 'Anora'),
                                      ('Demi Moore', 'The Substance'),
                                      ('Fernanda Torres', 'I''m Still Here')
                                 ) AS nom(name, movie)
                                     JOIN movies m ON m.title = nom.movie
                                     JOIN categories c ON c.name = 'Performance by an Actress in a Leading Role'

UNION ALL
-- Actress in a Supporting Role
SELECT nom.name, m.id, c.id FROM (VALUES
                                      ('Monica Barbaro', 'A Complete Unknown'),
                                      ('Ariana Grande', 'Wicked'),
                                      ('Felicity Jones', 'The Brutalist'),
                                      ('Isabella Rossellini', 'Conclave'),
                                      ('Zoe Saldaña', 'Emilia Pérez')
                                 ) AS nom(name, movie)
                                     JOIN movies m ON m.title = nom.movie
                                     JOIN categories c ON c.name = 'Performance by an Actress in a Supporting Role'

UNION ALL
-- Animated Feature Film
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Best Animated Feature Film'
WHERE m.title IN ('Flow', 'Inside Out 2', 'Memoir of a Snail',
                  'Wallace & Gromit: Vengeance Most Fowl', 'The Wild Robot')

UNION ALL
-- Animated Short Film (Updated with creators)
SELECT nom.name, NULL, c.id FROM (VALUES
                                      ('Beautiful Men by Nicolas Keppens'),
                                      ('In the Shadow of the Cypress by Hossein Molayemi & Shirin Sohani'),
                                      ('Magic Candies by Daisuke Nishio'),
                                      ('Wander to Wonder by Nina Gantz'),
                                      ('Yuck! by Loïc Espuche')
                                 ) AS nom(name)
                                     JOIN categories c ON c.name = 'Best Animated Short Film'

UNION ALL
-- Cinematography
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Achievement in Cinematography'
WHERE m.title IN ('The Brutalist', 'Dune: Part Two', 'Emilia Pérez', 'Maria', 'Nosferatu')

UNION ALL
-- Costume Design
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Achievement in Costume Design'
WHERE m.title IN ('A Complete Unknown', 'Conclave', 'Gladiator II', 'Nosferatu', 'Wicked')

UNION ALL
-- Directing
SELECT CONCAT(m.title, ', ', d.director), m.id, c.id FROM (VALUES
                                                               ('Anora', 'Sean Baker'),
                                                               ('The Brutalist', 'Brady Corbet'),
                                                               ('A Complete Unknown', 'James Mangold'),
                                                               ('Emilia Pérez', 'Jacques Audiard'),
                                                               ('The Substance', 'Coralie Fargeat')
                                                          ) AS d(movie, director)
                                                              JOIN movies m ON m.title = d.movie
                                                              JOIN categories c ON c.name = 'Achievement in Directing'

UNION ALL
-- Documentary Feature
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Best Documentary Feature Film'
WHERE m.title IN ('Black Box Diaries', 'No Other Land', 'Porcelain War',
                  'Soundtrack to a Coup d''Etat', 'Sugarcane')

UNION ALL
-- Documentary Short Film (Updated with creators)
SELECT nom.name, NULL, c.id FROM (VALUES
                                      ('Death by Numbers by Kim A. Snyder'),
                                      ('I Am Ready, Warden by Smriti Mundhra'),
                                      ('Incident by Bill Morrison'),
                                      ('Instruments of a Beating Heart by Ema Ryan Yamazaki'),
                                      ('The Only Girl in the Orchestra by Molly O’Brien')
                                 ) AS nom(name)
                                     JOIN categories c ON c.name = 'Best Documentary Short Film'

UNION ALL
-- Film Editing
SELECT CONCAT(m.title, ', ', e.editor), m.id, c.id FROM (VALUES
                                                             ('Anora', 'Sean Baker'),
                                                             ('The Brutalist', 'David Jancso'),
                                                             ('Conclave', 'Nick Emerson'),
                                                             ('Emilia Pérez', 'Juliette Welfling'),
                                                             ('Wicked', 'Myron Kerstein')
                                                        ) AS e(movie, editor)
                                                            JOIN movies m ON m.title = e.movie
                                                            JOIN categories c ON c.name = 'Achievement in Film Editing'

UNION ALL
-- International Feature
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Best International Feature Film'
WHERE m.title IN ('I''m Still Here', 'The Girl with the Needle', 'Emilia Pérez',
                  'The Seed of the Sacred Fig', 'Flow')

UNION ALL
-- Makeup & Hairstyling
SELECT CONCAT(m.title, ', ', t.team), m.id, c.id FROM (VALUES
                                                           ('A Different Man', 'Mike Marino, David Presto, Crystal Jurado'),
                                                           ('Emilia Pérez', 'Julia Floch Carbonel, Emmanuel Janvier, Jean-Christophe Spadaccini'),
                                                           ('Nosferatu', 'David White, Traci Loader, Suzanne Stokes-Munton'),
                                                           ('The Substance', 'Pierre-Olivier Persin, Stéphanie Guillon, Marilyne Scarselli'),
                                                           ('Wicked', 'Frances Hannon, Laura Blount, Sarah Nuth')
                                                      ) AS t(movie, team)
                                                          JOIN movies m ON m.title = t.movie
                                                          JOIN categories c ON c.name = 'Achievement in Makeup and Hairstyling'

UNION ALL
-- Original Score
SELECT CONCAT(m.title, ', ', s.composer), m.id, c.id FROM (VALUES
                                                               ('The Brutalist', 'Daniel Blumberg'),
                                                               ('Conclave', 'Volker Bertelmann'),
                                                               ('Emilia Pérez', 'Clément Ducol, Camille'),
                                                               ('Wicked', 'John Powell, Stephen Schwartz'),
                                                               ('The Wild Robot', 'Kris Bowers')
                                                          ) AS s(movie, composer)
                                                              JOIN movies m ON m.title = s.movie
                                                              JOIN categories c ON c.name = 'Original Score'

UNION ALL
-- Original Song
SELECT CONCAT(s.song, ' from ', m.title), m.id, c.id FROM (VALUES
                                                               ('El Mal', 'Emilia Pérez'),
                                                               ('The Journey', 'The Six Triple Eight'),
                                                               ('Like A Bird', 'Sing Sing'),
                                                               ('Mi Camino', 'Emilia Pérez'),
                                                               ('Never Too Late', 'Elton John: Never Too Late')
                                                          ) AS s(song, movie)
                                                              JOIN movies m ON m.title = s.movie
                                                              JOIN categories c ON c.name = 'Original Song'

UNION ALL
-- Production Design
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Achievement in Production Design'
WHERE m.title IN ('The Brutalist', 'Conclave', 'Dune: Part Two', 'Nosferatu', 'Wicked')

UNION ALL
-- Live Action Short Film (Updated with creators)
SELECT nom.name, NULL, c.id FROM (VALUES
                                      ('A Lien by David Cutler-Kreutz & Sam Cutler-Kreutz'),
                                      ('Anuja by Adam J. Graves'),
                                      ('I''m Not a Robot by Victoria Warmerdam'),
                                      ('The Last Ranger by Cindy Lee'),
                                      ('The Man Who Could Not Remain Silent by Nebojša Slijepčević')
                                 ) AS nom(name)
                                     JOIN categories c ON c.name = 'Best Live Action Short Film'

UNION ALL
-- Sound
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Achievement in Sound'
WHERE m.title IN ('A Complete Unknown', 'Dune: Part Two', 'Emilia Pérez', 'Wicked', 'The Wild Robot')

UNION ALL
-- Visual Effects
SELECT m.title, m.id, c.id FROM movies m
                                    JOIN categories c ON c.name = 'Achievement in Visual Effects'
WHERE m.title IN ('Alien: Romulus', 'Better Man', 'Dune: Part Two',
                  'Kingdom of the Planet of the Apes', 'Wicked')

UNION ALL
-- Adapted Screenplay
SELECT CONCAT(m.title, ', ', w.writers), m.id, c.id FROM (VALUES
                                                              ('A Complete Unknown', 'James Mangold, Jay Cocks'),
                                                              ('Conclave', 'Peter Straughan'),
                                                              ('Emilia Pérez', 'Jacques Audiard, Thomas Bidegain, Léa Mysius, Nicolas Livecchi'),
                                                              ('Nickel Boys', 'RaMell Ross, Joslyn Barnes'),
                                                              ('Sing Sing', 'Clint Bentley, Greg Kwedar, Clarence Maclin, John "Divine G" Whitfield')
                                                         ) AS w(movie, writers)
                                                             JOIN movies m ON m.title = w.movie
                                                             JOIN categories c ON c.name = 'Adapted Screenplay'

UNION ALL
-- Original Screenplay
SELECT CONCAT(m.title, ', ', w.writers), m.id, c.id FROM (VALUES
                                                              ('Anora', 'Sean Baker'),
                                                              ('The Brutalist', 'Brady Corbet, Mona Fastvold'),
                                                              ('A Real Pain', 'Jesse Eisenberg'),
                                                              ('September 5', 'Moritz Binder, Tim Fehlbaum, Alex David'),
                                                              ('The Substance', 'Coralie Fargeat')
                                                         ) AS w(movie, writers)
                                                             JOIN movies m ON m.title = w.movie
                                                             JOIN categories c ON c.name = 'Original Screenplay';