const episodes = [
{
title: "Rose",
season: 1,
episode: 1,
released: new Date("2005-03-26").toISOString(),
overview: "Ordinary shop assistant Rose Tyler's life is turned upside down when a mysterious stranger called the Doctor saves her from an attack by living mannequins. Drawn into his dangerous world, she must help him stop an alien consciousness from taking over London.",
thumbnail: "https://archive.org/download/nw_S01/E01_rose.jpg",
streamUrl: "https://archive.org/download/nw_S01/E01_rose.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E01_rose.srt"
},
{
title: "The End of the World",
season: 1,
episode: 2,
released: new Date("2005-04-02").toISOString(),
overview: "For her first trip through time, the Doctor takes Rose to the year five billion to witness the final destruction of Earth from a luxurious space station. But when a deadly saboteur strikes, the station's guests are put in mortal danger.",
thumbnail: "https://archive.org/download/nw_S01/E02_the_end_of_the_world.jpg",
streamUrl: "https://archive.org/download/nw_S01/E02_the_end_of_the_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E02_the_end_of_the_world.srt"
},
{
title: "The Unquiet Dead",
season: 1,
episode: 3,
released: new Date("2005-04-09").toISOString(),
overview: "The Doctor and Rose travel to 1869 Cardiff, where the dead are walking and specters haunt a local funeral parlor. Teaming up with Charles Dickens, they must uncover the ghostly truth behind the seemingly reanimated corpses.",
thumbnail: "https://archive.org/download/nw_S01/E03_the_unquiet_dead.jpg",
streamUrl: "https://archive.org/download/nw_S01/E03_the_unquiet_dead.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E03_the_unquiet_dead.srt"
},
{
title: "Aliens of London",
season: 1,
episode: 4,
released: new Date("2005-04-16").toISOString(),
overview: "After returning Rose home a year late, the Doctor's reunion with her family is cut short when a spaceship crash-lands in the Thames. The incident triggers a global state of alert, but the real threat is already inside the government.",
thumbnail: "https://archive.org/download/nw_S01/E04_aliens_of_london.jpg",
streamUrl: "https://archive.org/download/nw_S01/E04_aliens_of_london.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E04_aliens_of_london.srt"
},
{
title: "World War Three",
season: 1,
episode: 5,
released: new Date("2005-04-23").toISOString(),
overview: "With the alien Slitheen in control of 10 Downing Street, the Doctor, Rose, and Harriet Jones are trapped and declared international fugitives. They must find a way to expose the conspiracy and stop Earth from being sold for scrap.",
thumbnail: "https://archive.org/download/nw_S01/E05_world_war_three.jpg",
streamUrl: "https://archive.org/download/nw_S01/E05_world_war_three.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E05_world_war_three.srt"
},
{
title: "Dalek",
season: 1,
episode: 6,
released: new Date("2005-04-30").toISOString(),
overview: "In a secret underground vault in Utah, the Doctor confronts the last survivor of the Time War: a lone, captive Dalek. But when the creature escapes, the Doctor is forced to face the horror of his past and the darkness within himself.",
thumbnail: "https://archive.org/download/nw_S01/E06_dalek.jpg",
streamUrl: "https://archive.org/download/nw_S01/E06_dalek.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E06_dalek.srt"
},
{
title: "The Long Game",
season: 1,
episode: 7,
released: new Date("2005-05-07").toISOString(),
overview: "The Doctor, Rose, and new companion Adam Mitchell visit Satellite Five in the year 200,000, a space station that broadcasts news across the entire human empire. But a sinister force on Floor 500 is manipulating humanity's development.",
thumbnail: "https://archive.org/download/nw_S01/E07_the_long_game.jpg",
streamUrl: "https://archive.org/download/nw_S01/E07_the_long_game.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E07_the_long_game.srt"
},
{
title: "Father's Day",
season: 1,
episode: 8,
released: new Date("2005-05-14").toISOString(),
overview: "Rose asks the Doctor to take her to the day her father died in 1987, hoping to be there for him in his final moments. But when she impulsively changes history, deadly Reapers are unleashed to sterilize the wound in time.",
thumbnail: "https://archive.org/download/nw_S01/E08_fathers_day.jpg",
streamUrl: "https://archive.org/download/nw_S01/E08_fathers_day.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E08_fathers_day.srt"
},
{
title: "The Empty Child",
season: 1,
episode: 9,
released: new Date("2005-05-21").toISOString(),
overview: "The TARDIS lands in London during the Blitz, where the Doctor and Rose encounter a terrifying plague sweeping through the city. A mysterious child in a gas mask wanders the streets, asking the same chilling question: 'Are you my mummy?'",
thumbnail: "https://archive.org/download/nw_S01/E09_the_empty_child.jpg",
streamUrl: "https://archive.org/download/nw_S01/E09_the_empty_child.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E09_the_empty_child.srt"
},
{
title: "The Doctor Dances",
season: 1,
episode: 10,
released: new Date("2005-05-28").toISOString(),
overview: "The gas-mask plague is spreading across war-torn London, and the Doctor discovers the epidemic's source is an alien hospital ship. With time running out, he, Rose, and Captain Jack must stop the nanogenes before they consume the entire human race.",
thumbnail: "https://archive.org/download/nw_S01/E10_the_doctor_dances.jpg",
streamUrl: "https://archive.org/download/nw_S01/E10_the_doctor_dances.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E10_the_doctor_dances.srt"
},
{
title: "Boom Town",
season: 1,
episode: 11,
released: new Date("2005-06-04").toISOString(),
overview: "The TARDIS team makes a pit stop in modern-day Cardiff, only to find a familiar enemy, a Slitheen, has survived and is plotting a new, catastrophic scheme. The Doctor is faced with a moral dilemma: should he show mercy to a remorseless killer?",
thumbnail: "https://archive.org/download/nw_S01/E11_boom_town.jpg",
streamUrl: "https://archive.org/download/nw_S01/E11_boom_town.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E11_boom_town.srt"
},
{
title: "Bad Wolf",
season: 1,
episode: 12,
released: new Date("2005-06-11").toISOString(),
overview: "The Doctor, Rose, and Captain Jack find themselves trapped in twisted, futuristic versions of popular reality TV shows. But this is no game; losers are disintegrated. A familiar, ancient enemy is pulling the strings from behind the scenes.",
thumbnail: "https://archive.org/download/nw_S01/E12_bad_wolf.jpg",
streamUrl: "https://archive.org/download/nw_S01/E12_bad_wolf.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E12_bad_wolf.srt"
},
{
title: "The Parting of the Ways",
season: 1,
episode: 13,
released: new Date("2005-06-18").toISOString(),
overview: "The Dalek fleet prepares to invade Earth, and the Doctor is faced with an impossible choice to save the universe. As he sends Rose home for her safety, he must confront the Dalek Emperor in a final, devastating showdown.",
thumbnail: "https://archive.org/download/nw_S01/E13_the_parting_of_the_ways.jpg",
streamUrl: "https://archive.org/download/nw_S01/E13_the_parting_of_the_ways.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E13_the_parting_of_the_ways.srt"
},
{
title: "Born Again (Minisode)",
season: 1,
episode: 14,
released: new Date("2005-11-18").toISOString(),
overview: "Immediately following his regeneration, the new Doctor must explain his radical change in appearance to a shocked and disbelieving Rose. As he struggles with his new body, the TARDIS hurtles towards London on Christmas Eve.",
thumbnail: "https://archive.org/download/nw_S01/E14_born_again_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S01/E14_born_again_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E14_born_again_minisode.srt"
},
{
title: "The Christmas Invasion (Special)",
season: 1,
episode: 15,
released: new Date("2005-12-25").toISOString(),
overview: "It's Christmas, but the newly regenerated Doctor is in a coma, leaving Rose and her family to defend Earth from the Sycorax. As the aliens threaten to release a deadly virus, humanity's only hope lies with a Doctor who can't even wake up.",
thumbnail: "https://archive.org/download/nw_S01/E15_the_christmas_invasion_special.jpg",
streamUrl: "https://archive.org/download/nw_S01/E15_the_christmas_invasion_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E15_the_christmas_invasion_special.srt"
},
{
title: "New Earth",
season: 2,
episode: 1,
released: new Date("2006-04-15").toISOString(),
overview: "The Doctor and Rose journey to humanity's new home planet, where they visit a state-of-the-art hospital run by cat-like nuns. They soon uncover a dark secret: the hospital's miraculous cures come at an unspeakable price.",
thumbnail: "https://archive.org/download/nw_S02/E01_new_earth.jpg",
streamUrl: "https://archive.org/download/nw_S02/E01_new_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E01_new_earth.srt"
},
{
title: "Tooth and Claw",
season: 2,
episode: 2,
released: new Date("2006-04-22").toISOString(),
overview: "Landing in 19th-century Scotland, the Doctor and Rose must protect Queen Victoria from a band of warrior monks and a ravenous werewolf. Their investigation leads to the founding of the Torchwood Institute, an organization created to fight alien threats.",
thumbnail: "https://archive.org/download/nw_S02/E02_tooth_and_claw.jpg",
streamUrl: "https://archive.org/download/nw_S02/E02_tooth_and_claw.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E02_tooth_and_claw.srt"
},
{
title: "School Reunion",
season: 2,
episode: 3,
released: new Date("2006-04-29").toISOString(),
overview: "Investigating a school run by strange, bat-like aliens, the Doctor and Rose are shocked to find two familiar faces working undercover: former companion Sarah Jane Smith and her robot dog, K-9. The reunited team must stop the Krillitanes from cracking the 'God-Maker' paradigm.",
thumbnail: "https://archive.org/download/nw_S02/E03_school_reunion.jpg",
streamUrl: "https://archive.org/download/nw_S02/E03_school_reunion.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E03_school_reunion.srt"
},
{
title: "The Girl in the Fireplace",
season: 2,
episode: 4,
released: new Date("2006-05-06").toISOString(),
overview: "The Doctor finds a time window to 18th-century France on a derelict spaceship and becomes entangled in the life of Madame de Pompadour. He must fight clockwork droids who seek to complete their ship by using her as a final component.",
thumbnail: "https://archive.org/download/nw_S02/E04_the_girl_in_the_fireplace.jpg",
streamUrl: "https://archive.org/download/nw_S02/E04_the_girl_in_the_fireplace.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E04_the_girl_in_the_fireplace.srt"
},
{
title: "Rise of the Cybermen",
season: 2,
episode: 5,
released: new Date("2006-05-13").toISOString(),
overview: "The TARDIS crash-lands on a parallel Earth where Rose's father is alive and humanity is being forcibly 'upgraded' by the emotionless Cybermen. Trapped in a world not their own, the Doctor and his friends must fight the dawn of a new steel age.",
thumbnail: "https://archive.org/download/nw_S02/E05_rise_of_the_cybermen.jpg",
streamUrl: "https://archive.org/download/nw_S02/E05_rise_of_the_cybermen.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E05_rise_of_the_cybermen.srt"
},
{
title: "The Age of Steel",
season: 2,
episode: 6,
released: new Date("2006-05-20").toISOString(),
overview: "The Cybermen have seized control of London, and the Doctor, Rose, and Mickey have become fugitives. They join a small band of rebels in a desperate attempt to shut down the Cyber-conversion factories and save humanity from deletion.",
thumbnail: "https://archive.org/download/nw_S02/E06_the_age_of_steel.jpg",
streamUrl: "https://archive.org/download/nw_S02/E06_the_age_of_steel.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E06_the_age_of_steel.srt"
},
{
title: "The Idiot's Lantern",
season: 2,
episode: 7,
released: new Date("2006-05-27").toISOString(),
overview: "It's 1953, the year of Queen Elizabeth II's coronation, and a malevolent alien entity known as the Wire is stealing people's faces through their television sets. The Doctor and Rose must stop it before it consumes the minds of millions watching the broadcast.",
thumbnail: "https://archive.org/download/nw_S02/E07_the_idiots_lantern.jpg",
streamUrl: "https://archive.org/download/nw_S02/E07_the_idiots_lantern.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E07_the_idiots_lantern.srt"
},
{
title: "The Impossible Planet",
season: 2,
episode: 8,
released: new Date("2006-06-03").toISOString(),
overview: "The TARDIS lands on a sanctuary base impossibly orbiting a black hole, where a human crew works alongside their servants, the Ood. As an ancient evil begins to awaken from deep within the planet, the Doctor and Rose face a terrifying enemy.",
thumbnail: "https://archive.org/download/nw_S02/E08_the_impossible_planet.jpg",
streamUrl: "https://archive.org/download/nw_S02/E08_the_impossible_planet.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E08_the_impossible_planet.srt"
},
{
title: "The Satan Pit",
season: 2,
episode: 9,
released: new Date("2006-06-10").toISOString(),
overview: "With the Beast possessing the Ood, Rose and the surviving crew members fight for their lives against the Legion of the Beast. The Doctor descends into the planet's core to confront the ancient creature, facing a choice that could mean his own demise.",
thumbnail: "https://archive.org/download/nw_S02/E09_the_satan_pit.jpg",
streamUrl: "https://archive.org/download/nw_S02/E09_the_satan_pit.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E09_the_satan_pit.srt"
},
{
title: "Love & Monsters",
season: 2,
episode: 10,
released: new Date("2006-06-17").toISOString(),
overview: "From the perspective of an ordinary man named Elton Pope, we see the impact the Doctor has on the lives of those he encounters. Elton joins a group of Doctor-enthusiasts, but their hobby takes a dark turn when a mysterious man takes over their meetings.",
thumbnail: "https://archive.org/download/nw_S02/E10_love_and_monsters.jpg",
streamUrl: "https://archive.org/download/nw_S02/E10_love_and_monsters.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E10_love_and_monsters.srt"
},
{
title: "Fear Her",
season: 2,
episode: 11,
released: new Date("2006-06-24").toISOString(),
overview: "On the eve of the 2012 London Olympics, the Doctor and Rose investigate a quiet suburban street where children are mysteriously vanishing. They discover a lonely girl whose drawings can trap living people, and a hidden alien presence feeding on fear.",
thumbnail: "https://archive.org/download/nw_S02/E11_fear_her.jpg",
streamUrl: "https://archive.org/download/nw_S02/E11_fear_her.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E11_fear_her.srt"
},
{
title: "Army of Ghosts",
season: 2,
episode: 12,
released: new Date("2006-07-01").toISOString(),
overview: "Ghostly apparitions are appearing all over the world, but they are not what they seem. The Doctor traces the phenomenon to the Torchwood Institute, where he discovers an alien sphere that heralds the arrival of his deadliest enemies.",
thumbnail: "https://archive.org/download/nw_S02/E12_army_of_ghosts.jpg",
streamUrl: "https://archive.org/download/nw_S02/E12_army_of_ghosts.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E12_army_of_ghosts.srt"
},
{
title: "Doomsday",
season: 2,
episode: 13,
released: new Date("2006-07-08").toISOString(),
overview: "Earth becomes the battleground for a war between the Daleks and the Cybermen. With the planet at stake, the Doctor must make a heart-wrenching sacrifice to close the void between worlds, leading to a devastating farewell.",
thumbnail: "https://archive.org/download/nw_S02/E13_doomsday.jpg",
streamUrl: "https://archive.org/download/nw_S02/E13_doomsday.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E13_doomsday.srt"
},
{
title: "The Runaway Bride (Special)",
season: 2,
episode: 14,
released: new Date("2006-12-25").toISOString(),
overview: "Still reeling from the loss of Rose, the Doctor is stunned when a bride named Donna Noble suddenly materializes inside the TARDIS. He must uncover how she is connected to an ancient alien plot to destroy the Earth.",
thumbnail: "https://archive.org/download/nw_S02/E14_the_runaway_bride_special.jpg",
streamUrl: "https://archive.org/download/nw_S02/E14_the_runaway_bride_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E14_the_runaway_bride_special.srt"
},
{
title: "Smith and Jones",
season: 3,
episode: 1,
released: new Date("2007-03-31").toISOString(),
overview: "When her hospital is transported to the moon, medical student Martha Jones teams up with the Doctor to find a fugitive alien hiding among the patients. They must expose the creature before the rhino-like Judoon police destroy the entire building.",
thumbnail: "https://archive.org/download/nw_S03/E01_smith_and_jones.jpg",
streamUrl: "https://archive.org/download/nw_S03/E01_smith_and_jones.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E01_smith_and_jones.srt"
},
{
title: "The Shakespeare Code",
season: 3,
episode: 2,
released: new Date("2007-04-07").toISOString(),
overview: "The Doctor takes Martha to Elizabethan England, where they meet William Shakespeare at the Globe Theatre. They soon discover that three powerful witches are using his new play to open a portal for their species to conquer Earth.",
thumbnail: "https://archive.org/download/nw_S03/E02_the_shakespeare_code.jpg",
streamUrl: "https://archive.org/download/nw_S03/E02_the_shakespeare_code.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E02_the_shakespeare_code.srt"
},
{
title: "Gridlock",
season: 3,
episode: 3,
released: new Date("2007-04-14").toISOString(),
overview: "The Doctor and Martha visit New Earth, only for Martha to be kidnapped and taken into the dark underbelly of New New York. There, the population is trapped in a perpetual traffic jam, and a monstrous secret lurks in the fast lane.",
thumbnail: "https://archive.org/download/nw_S03/E03_gridlock.jpg",
streamUrl: "https://archive.org/download/nw_S03/E03_gridlock.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E03_gridlock.srt"
},
{
title: "Daleks in Manhattan",
season: 3,
episode: 4,
released: new Date("2007-04-21").toISOString(),
overview: "In 1930s New York City, people are disappearing from Hooverville, and a mysterious Pig-Slave army serves a hidden master. The Doctor and Martha uncover a plot by the Cult of Skaro to create a new race of Dalek-human hybrids.",
thumbnail: "https://archive.org/download/nw_S03/E04_daleks_in_manhattan.jpg",
streamUrl: "https://archive.org/download/nw_S03/E04_daleks_in_manhattan.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E04_daleks_in_manhattan.srt"
},
{
title: "Evolution of the Daleks",
season: 3,
episode: 5,
released: new Date("2007-04-28").toISOString(),
overview: "The Daleks' final experiment is in full swing at the Empire State Building, and the first Dalek-human hybrid has been created. The Doctor must convince his oldest enemies to choose a new path, or face the destruction of both races.",
thumbnail: "https://archive.org/download/nw_S03/E05_evolution_of_the_daleks.jpg",
streamUrl: "https://archive.org/download/nw_S03/E05_evolution_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E05_evolution_of_the_daleks.srt"
},
{
title: "The Infinite Quest (Animated Series)",
season: 3,
episode: 6,
released: new Date("2007-04-29").toISOString(),
overview: "The Doctor and Martha embark on an animated adventure across the galaxy to find the location of the legendary lost starship, the Infinite. They must outwit the evil Baltazar, who seeks the ship's power to grant his heart's desire: control of the universe.",
thumbnail: "https://archive.org/download/nw_S03/E06_the_infinite_quest_animated_series.jpg",
streamUrl: "https://archive.org/download/nw_S03/E06_the_infinite_quest_animated_series.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E06_the_infinite_quest_animated_series.srt"
},
{
title: "The Lazarus Experiment",
season: 3,
episode: 7,
released: new Date("2007-05-05").toISOString(),
overview: "Back in modern-day London, Martha's family gets caught up in the work of an elderly scientist who claims to have reversed the aging process. But his experiment has a terrible side effect, unleashing a monstrous creature with an insatiable appetite.",
thumbnail: "https://archive.org/download/nw_S03/E07_the_lazarus_experiment.jpg",
streamUrl: "https://archive.org/download/nw_S03/E07_the_lazarus_experiment.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E07_the_lazarus_experiment.srt"
},
{
title: "42",
season: 3,
episode: 8,
released: new Date("2007-05-19").toISOString(),
overview: "The Doctor and Martha find themselves on a spaceship hurtling towards a sun, with only 42 minutes until impact. As the crew becomes possessed by a living star, they must solve a series of cryptic puzzles to survive.",
thumbnail: "https://archive.org/download/nw_S03/E08_42.jpg",
streamUrl: "https://archive.org/download/nw_S03/E08_42.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E08_42.srt"
},
{
title: "Human Nature",
season: 3,
episode: 9,
released: new Date("2007-05-26").toISOString(),
overview: "To escape a family of hunters, the Doctor transforms himself into a human schoolteacher named John Smith in 1913 England, storing his Time Lord essence in a fob watch. But as he falls in love, he forgets his true identity, leaving Martha to protect him alone.",
thumbnail: "https://archive.org/download/nw_S03/E09_human_nature.jpg",
streamUrl: "https://archive.org/download/nw_S03/E09_human_nature.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E09_human_nature.srt"
},
{
title: "The Family of Blood",
season: 3,
episode: 10,
released: new Date("2007-06-02").toISOString(),
overview: "The relentless Family of Blood has cornered John Smith and Martha, demanding he become the Doctor again. As war breaks out at the school, John must confront the terrible choice between his human life and his Time Lord destiny.",
thumbnail: "https://archive.org/download/nw_S03/E10_the_family_of_blood.jpg",
streamUrl: "https://archive.org/download/nw_S03/E10_the_family_of_blood.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E10_the_family_of_blood.srt"
},
{
title: "Blink",
season: 3,
episode: 11,
released: new Date("2007-06-09").toISOString(),
overview: "In 2007, Sally Sparrow finds cryptic messages from a man called the Doctor, whom she's never met. She must unravel the mystery of the Weeping Angels, terrifying statues that move only when you're not looking, to save the world and the Doctor himself.",
thumbnail: "https://archive.org/download/nw_S03/E11_blink.jpg",
streamUrl: "https://archive.org/download/nw_S03/E11_blink.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E11_blink.srt"
},
{
title: "Utopia",
season: 3,
episode: 12,
released: new Date("2007-06-16").toISOString(),
overview: "The TARDIS is forced to the end of the universe, where the last remnants of humanity struggle to reach a fabled paradise called Utopia. Reunited with Captain Jack Harkness, the Doctor uncovers a chilling secret: he is not the only Time Lord left.",
thumbnail: "https://archive.org/download/nw_S03/E12_utopia.jpg",
streamUrl: "https://archive.org/download/nw_S03/E12_utopia.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E12_utopia.srt"
},
{
title: "The Sound of Drums",
season: 3,
episode: 13,
released: new Date("2007-06-23").toISOString(),
overview: "The Master has become the Prime Minister of Great Britain and brands the Doctor a wanted man. As the Doctor, Martha, and Jack become fugitives, they must uncover the Master's sinister plan for the human race and the mysterious Toclafane.",
thumbnail: "https://archive.org/download/nw_S03/E13_the_sound_of_drums.jpg",
streamUrl: "https://archive.org/download/nw_S03/E13_the_sound_of_drums.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E13_the_sound_of_drums.srt"
},
{
title: "Last of the Time Lords",
season: 3,
episode: 14,
released: new Date("2007-06-30").toISOString(),
overview: "A year after the Master conquered Earth, an aged and captive Doctor is helpless. It falls to Martha Jones, who has traveled the world spreading a legend, to unite humanity and defeat the Master's terrifying reign.",
thumbnail: "https://archive.org/download/nw_S03/E14_last_of_the_time_lords.jpg",
streamUrl: "https://archive.org/download/nw_S03/E14_last_of_the_time_lords.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E14_last_of_the_time_lords.srt"
},
{
title: "Time Crash (Minisode)",
season: 3,
episode: 15,
released: new Date("2007-11-16").toISOString(),
overview: "Worlds collide when the Tenth Doctor's TARDIS inexplicably merges with the Fifth Doctor's. The two incarnations must work together to prevent a temporal paradox from creating a black hole the size of Belgium.",
thumbnail: "https://archive.org/download/nw_S03/E15_time_crash_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S03/E15_time_crash_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E15_time_crash_minisode.srt"
},
{
title: "Voyage of the Damned (Special)",
season: 3,
episode: 16,
released: new Date("2007-12-25").toISOString(),
overview: "A luxurious space-liner replica of the Titanic is on a collision course with Earth. The Doctor must team up with a waitress named Astrid Peth to save the passengers from killer robotic angels and stop the ship from causing planetary annihilation.",
thumbnail: "https://archive.org/download/nw_S03/E16_voyage_of_the_damned_special.jpg",
streamUrl: "https://archive.org/download/nw_S03/E16_voyage_of_the_damned_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E16_voyage_of_the_damned_special.srt"
},
{
title: "Partners in Crime",
season: 4,
episode: 1,
released: new Date("2008-04-05").toISOString(),
overview: "Investigating a revolutionary weight-loss pill, the Doctor is reunited with Donna Noble, who is conducting her own inquiry into Adipose Industries. Together, they must stop a scheme that turns human fat into adorable, but potentially dangerous, alien creatures.",
thumbnail: "https://archive.org/download/nw_S04/E01_partners_in_crime.jpg",
streamUrl: "https://archive.org/download/nw_S04/E01_partners_in_crime.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E01_partners_in_crime.srt"
},
{
title: "The Fires of Pompeii",
season: 4,
episode: 2,
released: new Date("2008-04-12").toISOString(),
overview: "The Doctor and Donna land in Pompeii on the eve of the eruption of Mount Vesuvius, a fixed point in time. They discover that the volcano's power is being harnessed by stony aliens, forcing the Doctor to decide whether to save the city or let history run its course.",
thumbnail: "https://archive.org/download/nw_S04/E02_the_fires_of_pompeii.jpg",
streamUrl: "https://archive.org/download/nw_S04/E02_the_fires_of_pompeii.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E02_the_fires_of_pompeii.srt"
},
{
title: "Planet of the Ood",
season: 4,
episode: 3,
released: new Date("2008-04-19").toISOString(),
overview: "The Doctor and Donna travel to the Ood-Sphere, the home planet of the seemingly docile Ood. They uncover the horrific truth behind the Ood's servitude to humanity and must fight to liberate the species from corporate enslavement.",
thumbnail: "https://archive.org/download/nw_S04/E03_planet_of_the_ood.jpg",
streamUrl: "https://archive.org/download/nw_S04/E03_planet_of_the_ood.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E03_planet_of_the_ood.srt"
},
{
title: "The Sontaran Stratagem",
season: 4,
episode: 4,
released: new Date("2008-04-26").toISOString(),
overview: "Martha Jones, now a UNIT officer, summons the Doctor back to Earth to investigate a new technology called ATMOS that is installed in cars worldwide. They discover it is a plot by the warlike Sontarans to choke the planet with poison gas.",
thumbnail: "https://archive.org/download/nw_S04/E04_the_sontaran_stratagem.jpg",
streamUrl: "https://archive.org/download/nw_S04/E04_the_sontaran_stratagem.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E04_the_sontaran_stratagem.srt"
},
{
title: "The Poison Sky",
season: 4,
episode: 5,
released: new Date("2008-05-03").toISOString(),
overview: "As the Sontarans' poison gas fills the atmosphere, the Doctor and UNIT must find a way to clear the sky and repel the invasion. With a traitor in their midst and the Sontaran fleet descending, the Doctor must make a dangerous gamble.",
thumbnail: "https://archive.org/download/nw_S04/E05_the_poison_sky.jpg",
streamUrl: "https://archive.org/download/nw_S04/E05_the_poison_sky.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E05_the_poison_sky.srt"
},
{
title: "The Doctor's Daughter",
season: 4,
episode: 6,
released: new Date("2008-05-10").toISOString(),
overview: "On the planet Messaline, a cloning machine instantly creates a soldier from the Doctor's DNA: his daughter, Jenny. Thrown into a brutal war between humans and the fish-like Hath, the Doctor must come to terms with his unexpected fatherhood.",
thumbnail: "https://archive.org/download/nw_S04/E06_the_doctors_daughter.jpg",
streamUrl: "https://archive.org/download/nw_S04/E06_the_doctors_daughter.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E06_the_doctors_daughter.srt"
},
{
title: "The Unicorn and the Wasp",
season: 4,
episode: 7,
released: new Date("2008-05-17").toISOString(),
overview: "In 1926, the Doctor and Donna join a dinner party with famed mystery author Agatha Christie. When a murder occurs, they find themselves in a real-life whodunit involving a jewel thief, a mysterious vicar, and a giant alien wasp.",
thumbnail: "https://archive.org/download/nw_S04/E07_the_unicorn_and_the_wasp.jpg",
streamUrl: "https://archive.org/download/nw_S04/E07_the_unicorn_and_the_wasp.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E07_the_unicorn_and_the_wasp.srt"
},
{
title: "Silence in the Library",
season: 4,
episode: 8,
released: new Date("2008-05-31").toISOString(),
overview: "The Doctor and Donna arrive at The Library, a planet-sized database, only to find it deserted. They soon encounter a team of archaeologists led by the enigmatic River Song, a woman who knows the Doctor's future, and face a deadly, flesh-eating shadow.",
thumbnail: "https://archive.org/download/nw_S04/E08_silence_in_the_library.jpg",
streamUrl: "https://archive.org/download/nw_S04/E08_silence_in_the_library.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E08_silence_in_the_library.srt"
},
{
title: "Forest of the Dead",
season: 4,
episode: 9,
released: new Date("2008-06-07").toISOString(),
overview: "As the Vashta Nerada shadows close in, the Doctor races to save the archaeological team. Meanwhile, Donna finds herself trapped in a bizarre simulated reality, and the Doctor must come to terms with his tragic future with River Song.",
thumbnail: "https://archive.org/download/nw_S04/E09_forest_of_the_dead.jpg",
streamUrl: "https://archive.org/download/nw_S04/E09_forest_of_the_dead.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E09_forest_of_the_dead.srt"
},
{
title: "Midnight",
season: 4,
episode: 10,
released: new Date("2008-06-14").toISOString(),
overview: "While on a leisure cruise on the diamond planet Midnight, the Doctor is trapped with a group of terrified tourists. An unseen creature from outside begins to knock, and as paranoia sets in, the greatest threat may come from within.",
thumbnail: "https://archive.org/download/nw_S04/E10_midnight.jpg",
streamUrl: "https://archive.org/download/nw_S04/E10_midnight.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E10_midnight.srt"
},
{
title: "Turn Left",
season: 4,
episode: 11,
released: new Date("2008-06-21").toISOString(),
overview: "A single decision in Donna's past creates a dark, alternate timeline where she never met the Doctor. As Earth spirals into chaos, a familiar face from a parallel world arrives to show Donna the importance of her journey and help set things right.",
thumbnail: "https://archive.org/download/nw_S04/E11_turn_left.jpg",
streamUrl: "https://archive.org/download/nw_S04/E11_turn_left.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E11_turn_left.srt"
},
{
title: "The Stolen Earth",
season: 4,
episode: 12,
released: new Date("2008-06-28").toISOString(),
overview: "Earth and 26 other planets have vanished from the universe, and the Doctor's past companions must unite to fight back. As the Doctor and Donna race to find the missing Earth, they discover it is at the heart of Davros' new Dalek empire.",
thumbnail: "https://archive.org/download/nw_S04/E12_the_stolen_earth.jpg",
streamUrl: "https://archive.org/download/nw_S04/E12_the_stolen_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E12_the_stolen_earth.srt"
},
{
title: "Journey's End",
season: 4,
episode: 13,
released: new Date("2008-07-05").toISOString(),
overview: "As Davros prepares to detonate a reality bomb that will destroy all of existence, the Doctor and his companions converge for a final battle. With sacrifices and prophecies coming to pass, the universe's fate rests on their shoulders.",
thumbnail: "https://archive.org/download/nw_S04/E13_journeys_end.jpg",
streamUrl: "https://archive.org/download/nw_S04/E13_journeys_end.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E13_journeys_end.srt"
},
{
title: "Music of the Spheres (Minisode)",
season: 4,
episode: 14,
released: new Date("2008-07-27").toISOString(),
overview: "The Doctor attempts to compose his 'Ode to the Universe' inside the TARDIS, only to be interrupted by a mischievous Graske. Their antics are broadcast live to the audience at the Doctor Who Proms, bridging the gap between fiction and reality.",
thumbnail: "https://archive.org/download/nw_S04/E14_music_of_the_spheres_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S04/E14_music_of_the_spheres_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E14_music_of_the_spheres_minisode.srt"
},
{
title: "The Next Doctor (Special)",
season: 4,
episode: 15,
released: new Date("2008-12-25").toISOString(),
overview: "Arriving in Victorian London on Christmas Eve, the Doctor is shocked to meet another man who claims to be 'the Doctor'. Together, they must investigate a series of mysterious deaths and stop a Cyberman plot to raise a new army.",
thumbnail: "https://archive.org/download/nw_S04/E15_the_next_doctor_special.jpg",
streamUrl: "https://archive.org/download/nw_S04/E15_the_next_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E15_the_next_doctor_special.srt"
},
{
title: "Planet of the Dead (Special)",
season: 4,
episode: 16,
released: new Date("2009-04-11").toISOString(),
overview: "When a London double-decker bus is transported to a desert planet, the Doctor and a mysterious cat burglar, Lady Christina de Souza, must lead the surviving passengers to safety. They discover the planet is being consumed by a swarm of metallic aliens.",
thumbnail: "https://archive.org/download/nw_S04/E16_planet_of_the_dead_special.jpg",
streamUrl: "https://archive.org/download/nw_S04/E16_planet_of_the_dead_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E16_planet_of_the_dead_special.srt"
},
{
title: "The Waters of Mars (Special)",
season: 4,
episode: 17,
released: new Date("2009-11-15").toISOString(),
overview: "On Mars, the Doctor encounters the first human colony, whose members are being infected by a sentient water virus. He faces a terrible dilemma: should he obey the laws of time and let the crew die, or break the rules and change a fixed point in history?",
thumbnail: "https://archive.org/download/nw_S04/E17_the_waters_of_mars_special.jpg",
streamUrl: "https://archive.org/download/nw_S04/E17_the_waters_of_mars_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E17_the_waters_of_mars_special.srt"
},
{
title: "Dreamland (Animated Series)",
season: 4,
episode: 18,
released: new Date("2009-11-21").toISOString(),
overview: "In this animated adventure, the Doctor lands in the Nevada desert in 1958 and uncovers a sinister alien conspiracy at the infamous Area 51. He must team up with two local diner workers to stop the Men in Black and their reptilian masters.",
thumbnail: "https://archive.org/download/nw_S04/E18_dreamland_animated_series.jpg",
streamUrl: "https://archive.org/download/nw_S04/E18_dreamland_animated_series.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E18_dreamland_animated_series.srt"
},
{
title: "The End of Time, Part One (Special)",
season: 4,
episode: 19,
released: new Date("2009-12-25").toISOString(),
overview: "As a prophecy foretells his death, the Doctor learns that his old nemesis, the Master, has been resurrected. With the help of Donna's grandfather, Wilf, he must confront his returning foe and the even greater threat of the Time Lords themselves.",
thumbnail: "https://archive.org/download/nw_S04/E19_the_end_of_time_part_one_special.jpg",
streamUrl: "https://archive.org/download/nw_S04/E19_the_end_of_time_part_one_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E19_the_end_of_time_part_one_special.srt"
},
{
title: "The End of Time, Part Two (Special)",
season: 4,
episode: 20,
released: new Date("2010-01-01").toISOString(),
overview: "With the Master's plan revealed and the Time Lords returning from the Time War, the Doctor faces his final battle. To save his friends and the universe, he must make the ultimate sacrifice, leading to a spectacular and emotional regeneration.",
thumbnail: "https://archive.org/download/nw_S04/E20_the_end_of_time_part_two_special.jpg",
streamUrl: "https://archive.org/download/nw_S04/E20_the_end_of_time_part_two_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E20_the_end_of_time_part_two_special.srt"
},
{
title: "The Eleventh Hour",
season: 5,
episode: 1,
released: new Date("2010-04-03").toISOString(),
overview: "A newly regenerated Doctor crashes his TARDIS in the garden of a young Amelia Pond. Years later, he returns to find a grown-up Amy, and together they must stop an alien fugitive from destroying Earth in just twenty minutes.",
thumbnail: "https://archive.org/download/nw_S05/E01_the_eleventh_hour.jpg",
streamUrl: "https://archive.org/download/nw_S05/E01_the_eleventh_hour.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E01_the_eleventh_hour.srt"
},
{
title: "Meanwhile in the TARDIS, Part 1 (Minisode)",
season: 5,
episode: 2,
released: new Date("2010-04-04").toISOString(),
overview: "On her very first trip in the TARDIS, Amy Pond grills the Doctor about his past, his alien nature, and why his time machine looks like a police box. As he explains, he opens the doors to reveal the wonders and dangers of outer space.",
thumbnail: "https://archive.org/download/nw_S05/E02_meanwhile_in_the_tardis_1_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S05/E02_meanwhile_in_the_tardis_1_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E02_meanwhile_in_the_tardis_1_minisode.srt"
},
{
title: "The Beast Below",
season: 5,
episode: 3,
released: new Date("2010-04-10").toISOString(),
overview: "The Doctor takes Amy to Starship UK, a massive spacecraft carrying the last of the British people. They discover a dark secret at the heart of the ship: the entire civilization is built on the suffering of a gentle, ancient creature.",
thumbnail: "https://archive.org/download/nw_S05/E03_the_beast_below.jpg",
streamUrl: "https://archive.org/download/nw_S05/E03_the_beast_below.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E03_the_beast_below.srt"
},
{
title: "Victory of the Daleks",
season: 5,
episode: 4,
released: new Date("2010-04-17").toISOString(),
overview: "The Doctor and Amy arrive in London during World War II, where Winston Churchill has a new secret weapon: the Daleks. The Doctor must convince Churchill of the Daleks' true nature before they unleash their new, more powerful paradigm.",
thumbnail: "https://archive.org/download/nw_S05/E04_victory_of_the_daleks.jpg",
streamUrl: "https://archive.org/download/nw_S05/E04_victory_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E04_victory_of_the_daleks.srt"
},
{
title: "The Time of Angels",
season: 5,
episode: 5,
released: new Date("2010-04-24").toISOString(),
overview: "A message from River Song summons the Doctor and Amy to the crashed starship Byzantium, where an army of Weeping Angels is awakening. With the help of Father Octavian and his military clerics, they must navigate a deadly maze of statues.",
thumbnail: "https://archive.org/download/nw_S05/E05_the_time_of_angels.jpg",
streamUrl: "https://archive.org/download/nw_S05/E05_the_time_of_angels.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E05_the_time_of_angels.srt"
},
{
title: "Flesh and Stone",
season: 5,
episode: 6,
released: new Date("2010-05-01").toISOString(),
overview: "Trapped in the forest of the Byzantium, the Doctor must outwit the relentless Weeping Angels. As a crack in time threatens to erase them from existence, Amy discovers that looking at an Angel is not the only danger they pose.",
thumbnail: "https://archive.org/download/nw_S05/E06_flesh_and_stone.jpg",
streamUrl: "https://archive.org/download/nw_S05/E06_flesh_and_stone.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E06_flesh_and_stone.srt"
},
{
title: "Meanwhile in the TARDIS, Part 2 (Minisode)",
season: 5,
episode: 7,
released: new Date("2010-05-02").toISOString(),
overview: "As Amy continues her attempts to seduce him, the Doctor explains why he travels with companions, showing her glimpses of his past friends. He then decides it's time to pick up her fiancé, Rory, from his bachelor party.",
thumbnail: "https://archive.org/download/nw_S05/E07_meanwhile_in_the_tardis_2_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S05/E07_meanwhile_in_the_tardis_2_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E07_meanwhile_in_the_tardis_2_minisode.srt"
},
{
title: "The Vampires of Venice",
season: 5,
episode: 8,
released: new Date("2010-05-08").toISOString(),
overview: "To patch things up with Amy and Rory, the Doctor takes them on a romantic trip to 16th-century Venice. They soon discover the city is under the control of strange, fish-like vampires who are converting young women for a sinister purpose.",
thumbnail: "https://archive.org/download/nw_S05/E08_the_vampires_of_venice.jpg",
streamUrl: "https://archive.org/download/nw_S05/E08_the_vampires_of_venice.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E08_the_vampires_of_venice.srt"
},
{
title: "Amy's Choice",
season: 5,
episode: 9,
released: new Date("2010-05-15").toISOString(),
overview: "The Doctor, Amy, and Rory are tormented by the mysterious Dream Lord, who forces them to switch between two realities: one in the TARDIS, and one in their future married life. They must figure out which reality is real before one of them kills them.",
thumbnail: "https://archive.org/download/nw_S05/E09_amys_choice.jpg",
streamUrl: "https://archive.org/download/nw_S05/E09_amys_choice.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E09_amys_choice.srt"
},
{
title: "The Hungry Earth",
season: 5,
episode: 10,
released: new Date("2010-05-22").toISOString(),
overview: "In a Welsh village in 2020, a drilling operation awakens a sleeping race of reptilian humanoids, the Silurians. As the ground swallows people up, the Doctor must negotiate a fragile peace between two species claiming ownership of the Earth.",
thumbnail: "https://archive.org/download/nw_S05/E10_the_hungry_earth.jpg",
streamUrl: "https://archive.org/download/nw_S05/E10_the_hungry_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E10_the_hungry_earth.srt"
},
{
title: "Cold Blood",
season: 5,
episode: 11,
released: new Date("2010-05-29").toISOString(),
overview: "The Silurians have declared war on humanity, and the Doctor is caught in the middle. He must prevent a global conflict while dealing with a familiar crack in time, which leads to a heartbreaking sacrifice for one of his companions.",
thumbnail: "https://archive.org/download/nw_S05/E11_cold_blood.jpg",
streamUrl: "https://archive.org/download/nw_S05/E11_cold_blood.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E11_cold_blood.srt"
},
{
title: "Good as Gold (Minisode)",
season: 5,
episode: 12,
released: new Date("2010-05-30").toISOString(),
overview: "The Doctor's plans for a quiet moment are interrupted when the TARDIS materializes in the path of the Olympic Torch. Aided by a school athletics team, he must outsmart a determined Weeping Angel intent on stealing the historic flame.",
thumbnail: "https://archive.org/download/nw_S05/E12_good_as_gold_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S05/E12_good_as_gold_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E12_good_as_gold_minisode.srt"
},
{
title: "Vincent and the Doctor",
season: 5,
episode: 13,
released: new Date("2010-06-05").toISOString(),
overview: "The Doctor and Amy travel to Provence to meet Vincent van Gogh, hoping to find an alien creature hidden in his paintings. They join the troubled artist in his battle against a monster that only he can see, and against his own inner demons.",
thumbnail: "https://archive.org/download/nw_S05/E13_vincent_and_the_doctor.jpg",
streamUrl: "https://archive.org/download/nw_S05/E13_vincent_and_the_doctor.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E13_vincent_and_the_doctor.srt"
},
{
title: "The Lodger",
season: 5,
episode: 14,
released: new Date("2010-06-12").toISOString(),
overview: "Separated from the TARDIS by a temporal anomaly, the Doctor must move in with a man named Craig and attempt to live a normal human life. He soon discovers a sinister force lurking in the apartment upstairs, luring people to their doom.",
thumbnail: "https://archive.org/download/nw_S05/E14_the_lodger.jpg",
streamUrl: "https://archive.org/download/nw_S05/E14_the_lodger.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E14_the_lodger.srt"
},
{
title: "The Pandorica Opens",
season: 5,
episode: 15,
released: new Date("2010-06-19").toISOString(),
overview: "The Doctor's enemies, including Daleks, Cybermen, and Sontarans, form an alliance to trap him in the Pandorica, a legendary prison. As they converge on Stonehenge, the Doctor must unravel a plot that threatens all of reality.",
thumbnail: "https://archive.org/download/nw_S05/E15_the_pandorica_opens.jpg",
streamUrl: "https://archive.org/download/nw_S05/E15_the_pandorica_opens.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E15_the_pandorica_opens.srt"
},
{
title: "The Big Bang",
season: 5,
episode: 16,
released: new Date("2010-06-26").toISOString(),
overview: "With the Doctor trapped in the Pandorica and the universe collapsing, a young Amelia Pond and a Roman Centurion must help restart reality. The Doctor races through time to close the cracks, leading to a wedding and a final, cryptic warning.",
thumbnail: "https://archive.org/download/nw_S05/E16_the_big_bang.jpg",
streamUrl: "https://archive.org/download/nw_S05/E16_the_big_bang.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E16_the_big_bang.srt"
},
{
title: "Death is the Only Answer (Minisode)",
season: 5,
episode: 17,
released: new Date("2010-06-27").toISOString(),
overview: "While experimenting with a fez once owned by Albert Einstein, the Doctor is interrupted by the scientist himself, who materializes from a strange goo. Einstein reveals a sinister plan involving a species called the Ogrons, forcing a bizarre confrontation.",
thumbnail: "https://archive.org/download/nw_S05/E17_death_is_the_only_answer_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S05/E17_death_is_the_only_answer_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E17_death_is_the_only_answer_minisode.srt"
},
{
title: "A Christmas Carol (Special)",
season: 5,
episode: 18,
released: new Date("2010-12-25").toISOString(),
overview: "To save Amy and Rory from a crashing star-liner, the Doctor must convince a bitter old miser to change his ways. He uses the TARDIS to travel through the man's past, present, and future, but discovers a dark secret lurking in the Christmas fog.",
thumbnail: "https://archive.org/download/nw_S05/E18_a_christmas_carol_special.jpg",
streamUrl: "https://archive.org/download/nw_S05/E18_a_christmas_carol_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E18_a_christmas_carol_special.srt"
},
{
title: "Space (Minisode)",
season: 6,
episode: 1,
released: new Date("2011-03-18").toISOString(),
overview: "A simple moment in the TARDIS goes awry when a 'spatial loop' causes the exterior shell to materialize inside the console room. This leads to a confusing encounter between Amy and a future version of herself, setting up a timey-wimey paradox.",
thumbnail: "https://archive.org/download/nw_S06/E01_space_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E01_space_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E01_space_minisode.srt"
},
{
title: "Time (Minisode)",
season: 6,
episode: 2,
released: new Date("2011-03-18").toISOString(),
overview: "Continuing from 'Space,' the TARDIS crew, now with two Amys, must resolve their paradoxical predicament. As the Doctor tries to reboot the system, they must work together to prevent the TARDIS from collapsing in on itself.",
thumbnail: "https://archive.org/download/nw_S06/E02_time_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E02_time_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E02_time_minisode.srt"
},
{
title: "The Impossible Astronaut (Prequel)",
season: 6,
episode: 3,
released: new Date("2011-03-22").toISOString(),
overview: "President Nixon receives a mysterious phone call from a terrified little girl, setting the stage for the Doctor's arrival. This brief prequel shows the strange events in the Oval Office that lead to the Doctor being summoned to America.",
thumbnail: "https://archive.org/download/nw_S06/E03_the_impossible_astronaut_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E03_the_impossible_astronaut_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E03_the_impossible_astronaut_prequel.srt"
},
{
title: "The Impossible Astronaut",
season: 6,
episode: 4,
released: new Date("2011-04-23").toISOString(),
overview: "The Doctor, Amy, Rory, and River Song are summoned to the Utah desert, where they witness a shocking event that must not be changed. Their investigation leads them to 1969 and a terrifying new enemy, the Silence, who are forgotten the moment they are unseen.",
thumbnail: "https://archive.org/download/nw_S06/E04_the_impossible_astronaut.jpg",
streamUrl: "https://archive.org/download/nw_S06/E04_the_impossible_astronaut.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E04_the_impossible_astronaut.srt"
},
{
title: "Day of the Moon",
season: 6,
episode: 5,
released: new Date("2011-04-30").toISOString(),
overview: "With the Doctor imprisoned, Amy, Rory, and River must uncover the truth about the Silence and their control over humanity. They mount a rebellion that culminates during the Apollo 11 moon landing, forcing them to make a terrible choice.",
thumbnail: "https://archive.org/download/nw_S06/E05_day_of_the_moon.jpg",
streamUrl: "https://archive.org/download/nw_S06/E05_day_of_the_moon.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E05_day_of_the_moon.srt"
},
{
title: "The Curse of the Black Spot (Prequel)",
season: 6,
episode: 6,
released: new Date("2011-04-30").toISOString(),
overview: "Aboard a 17th-century pirate ship, the TARDIS scanner reveals a terrifying sea-siren. This short scene sets up the mystery as Captain Avery's ship is becalmed and his crew begins to vanish one by one.",
thumbnail: "https://archive.org/download/nw_S06/E06_the_curse_of_the_black_spot_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E06_the_curse_of_the_black_spot_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E06_the_curse_of_the_black_spot_prequel.srt"
},
{
title: "The Curse of the Black Spot",
season: 6,
episode: 7,
released: new Date("2011-05-07").toISOString(),
overview: "The TARDIS lands on a pirate ship in the 17th century, where the crew is being marked for death by a mysterious siren. The Doctor, Amy, and Rory must uncover the siren's true nature before they all fall victim to her song.",
thumbnail: "https://archive.org/download/nw_S06/E07_the_curse_of_the_black_spot.jpg",
streamUrl: "https://archive.org/download/nw_S06/E07_the_curse_of_the_black_spot.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E07_the_curse_of_the_black_spot.srt"
},
{
title: "Bad Night (Minisode)",
season: 6,
episode: 8,
released: new Date("2011-05-08").toISOString(),
overview: "Amy is awoken by a frantic Doctor, who needs her help dealing with a time-traveling goldfish, a misunderstanding with British royalty, and a housefly that might alter the course of history. All while Rory sleeps through the chaos.",
thumbnail: "https://archive.org/download/nw_S06/E08_bad_night_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E08_bad_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E08_bad_night_minisode.srt"
},
{
title: "The Doctor's Wife",
season: 6,
episode: 9,
released: new Date("2011-05-14").toISOString(),
overview: "A Time Lord distress signal lures the Doctor to a junkyard asteroid outside the universe. There, the TARDIS's matrix is placed into a human body, allowing the Doctor to talk to his ship for the first time, but at a terrible cost.",
thumbnail: "https://archive.org/download/nw_S06/E09_the_doctors_wife.jpg",
streamUrl: "https://archive.org/download/nw_S06/E09_the_doctors_wife.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E09_the_doctors_wife.srt"
},
{
title: "Good Night (Minisode)",
season: 6,
episode: 10,
released: new Date("2011-05-15").toISOString(),
overview: "Amy ponders how she can remember two different pasts, prompting the Doctor to take her on a trip to visit her younger self. This quiet moment offers a chance for a small act of kindness and a glimpse into the Doctor's own lonely past.",
thumbnail: "https://archive.org/download/nw_S06/E10_good_night_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E10_good_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E10_good_night_minisode.srt"
},
{
title: "The Rebel Flesh",
season: 6,
episode: 11,
released: new Date("2011-05-21").toISOString(),
overview: "The Doctor, Amy, and Rory land in a 22nd-century factory where workers use flesh avatars called Gangers to handle dangerous acid. When a solar tsunami hits, the Gangers gain independence and declare war on their human counterparts.",
thumbnail: "https://archive.org/download/nw_S06/E11_the_rebel_flesh.jpg",
streamUrl: "https://archive.org/download/nw_S06/E11_the_rebel_flesh.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E11_the_rebel_flesh.srt"
},
{
title: "The Almost People",
season: 6,
episode: 12,
released: new Date("2011-05-28").toISOString(),
overview: "As the battle between humans and their Ganger duplicates rages on, the Doctor must convince both sides to find a peaceful solution. The situation becomes more complex when a Ganger version of the Doctor is created, leading to a shocking revelation about Amy.",
thumbnail: "https://archive.org/download/nw_S06/E12_the_almost_people.jpg",
streamUrl: "https://archive.org/download/nw_S06/E12_the_almost_people.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E12_the_almost_people.srt"
},
{
title: "A Good Man Goes to War (Prequel)",
season: 6,
episode: 13,
released: new Date("2011-05-28").toISOString(),
overview: "Dorium Maldovar tries to warn the Doctor against raising an army to rescue Amy Pond from Demon's Run. Despite the warnings, the Doctor prepares to call in every favor he's owed across time and space for a climactic battle.",
thumbnail: "https://archive.org/download/nw_S06/E13_a_good_man_goes_to_war_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E13_a_good_man_goes_to_war_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E13_a_good_man_goes_to_war_prequel.srt"
},
{
title: "A Good Man Goes to War",
season: 6,
episode: 14,
released: new Date("2011-06-04").toISOString(),
overview: "The Doctor assembles an army of allies to storm the asteroid fortress Demon's Run and rescue Amy and her newborn child, Melody. The battle reveals the Doctor's darker side and uncovers a devastating secret about River Song's true identity.",
thumbnail: "https://archive.org/download/nw_S06/E14_a_good_man_goes_to_war.jpg",
streamUrl: "https://archive.org/download/nw_S06/E14_a_good_man_goes_to_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E14_a_good_man_goes_to_war.srt"
},
{
title: "Let's Kill Hitler (Prequel)",
season: 6,
episode: 15,
released: new Date("2011-08-15").toISOString(),
overview: "Amy leaves a message for her childhood friend Mels, wondering where she is and why she hasn't responded. This short prequel sets the stage for the search for Melody Pond, teasing the arrival of a character who will change everything.",
thumbnail: "https://archive.org/download/nw_S06/E15_lets_kill_hitler_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E15_lets_kill_hitler_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E15_lets_kill_hitler_prequel.srt"
},
{
title: "Let's Kill Hitler",
season: 6,
episode: 16,
released: new Date("2011-08-27").toISOString(),
overview: "Amy and Rory's search for Melody leads them to 1930s Berlin, where they crash a dinner party with Adolf Hitler. The situation escalates when they confront a time-traveling justice department and witness Melody Pond's shocking regeneration.",
thumbnail: "https://archive.org/download/nw_S06/E16_lets_kill_hitler.jpg",
streamUrl: "https://archive.org/download/nw_S06/E16_lets_kill_hitler.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E16_lets_kill_hitler.srt"
},
{
title: "Night Terrors",
season: 6,
episode: 17,
released: new Date("2011-09-03").toISOString(),
overview: "The Doctor follows a distress call from a terrified boy named George, whose fears have become reality. Trapped in a dollhouse with creepy peg dolls, the Doctor must uncover the source of George's psychic powers to save everyone.",
thumbnail: "https://archive.org/download/nw_S06/E17_night_terrors.jpg",
streamUrl: "https://archive.org/download/nw_S06/E17_night_terrors.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E17_night_terrors.srt"
},
{
title: "First Night (Minisode)",
season: 6,
episode: 18,
released: new Date("2011-09-04").toISOString(),
overview: "On the night of her imprisonment, the Doctor arrives to take River Song on a date to the Singing Towers of Darillium. Their plans are complicated when a future version of River shows up, creating a chaotic temporal encounter.",
thumbnail: "https://archive.org/download/nw_S06/E18_first_night_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E18_first_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E18_first_night_minisode.srt"
},
{
title: "Last Night (Minisode)",
season: 6,
episode: 19,
released: new Date("2011-09-04").toISOString(),
overview: "With no fewer than three River Songs from different times now in the TARDIS, the Doctor must prevent them from meeting to avoid contaminating the timeline. The chaotic situation culminates in a surprisingly poignant moment for River.",
thumbnail: "https://archive.org/download/nw_S06/E19_last_night_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E19_last_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E19_last_night_minisode.srt"
},
{
title: "The Girl Who Waited",
season: 6,
episode: 20,
released: new Date("2011-09-10").toISOString(),
overview: "Amy becomes trapped in a quarantine facility where time moves faster, leaving her to fend for herself for decades. The Doctor and Rory must race against time to save her, but they are faced with a bitter, older Amy who refuses to be rescued.",
thumbnail: "https://archive.org/download/nw_S06/E20_the_girl_who_waited.jpg",
streamUrl: "https://archive.org/download/nw_S06/E20_the_girl_who_waited.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E20_the_girl_who_waited.srt"
},
{
title: "The God Complex",
season: 6,
episode: 21,
released: new Date("2011-09-17").toISOString(),
overview: "The TARDIS lands in a strange hotel with shifting corridors, where a minotaur-like creature feeds on the faith of its victims. The Doctor must break his companions' faith in him to save them from becoming the next meal.",
thumbnail: "https://archive.org/download/nw_S06/E21_the_god_complex.jpg",
streamUrl: "https://archive.org/download/nw_S06/E21_the_god_complex.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E21_the_god_complex.srt"
},
{
title: "Up All Night (Minisode)",
season: 6,
episode: 22,
released: new Date("2011-09-18").toISOString(),
overview: "Craig Owens struggles with the anxieties of being a new father, confiding in his baby, Alfie, about his fears. This brief scene provides a glimpse into Craig's life before the Doctor's unexpected return.",
thumbnail: "https://archive.org/download/nw_S06/E22_up_all_night_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S06/E22_up_all_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E22_up_all_night_minisode.srt"
},
{
title: "Closing Time",
season: 6,
episode: 23,
released: new Date("2011-09-24").toISOString(),
overview: "On a farewell tour before his impending death, the Doctor visits his old friend Craig. He soon discovers a Cyberman infestation in a local department store and must stop their plan to convert humanity, all while babysitting.",
thumbnail: "https://archive.org/download/nw_S06/E23_closing_time.jpg",
streamUrl: "https://archive.org/download/nw_S06/E23_closing_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E23_closing_time.srt"
},
{
title: "The Wedding of River Song (Prequel)",
season: 6,
episode: 24,
released: new Date("2011-09-24").toISOString(),
overview: "In Area 52, the Silent prisoner known as 'the Doctor' is about to be released by River Song. This short prequel shows the moments leading up to the shocking event at Lake Silencio, as the clock ticks down to 5:02 PM.",
thumbnail: "https://archive.org/download/nw_S06/E24_the_wedding_of_river_song_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E24_the_wedding_of_river_song_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E24_the_wedding_of_river_song_prequel.srt"
},
{
title: "The Wedding of River Song",
season: 6,
episode: 25,
released: new Date("2011-10-01").toISOString(),
overview: "River Song's refusal to kill the Doctor creates an alternate timeline where all of history is happening at once. The Doctor must convince River to correct time, leading to their wedding and a clever plan to cheat his own death.",
thumbnail: "https://archive.org/download/nw_S06/E25_the_wedding_of_river_song.jpg",
streamUrl: "https://archive.org/download/nw_S06/E25_the_wedding_of_river_song.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E25_the_wedding_of_river_song.srt"
},
{
title: "The Doctor, the Widow and the Wardrobe (Prequel)",
season: 6,
episode: 26,
released: new Date("2011-12-06").toISOString(),
overview: "The Doctor, alone in the TARDIS, holds a red button that could destroy a hostile spaceship. His dilemma over whether to press it leads to a decision that will put him in debt to a family on Earth during Christmas 1941.",
thumbnail: "https://archive.org/download/nw_S06/E26_the_doctor_the_widow_and_the_wardrobe_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S06/E26_the_doctor_the_widow_and_the_wardrobe_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E26_the_doctor_the_widow_and_the_wardrobe_prequel.srt"
},
{
title: "The Doctor, the Widow and the Wardrobe (Special)",
season: 6,
episode: 27,
released: new Date("2011-12-25").toISOString(),
overview: "Posing as a caretaker, the Doctor gives a grieving war widow and her two children a magical Christmas gift: a portal to a snowy forest planet. But the idyllic world holds a dangerous secret, and the family is soon caught in a fight for survival.",
thumbnail: "https://archive.org/download/nw_S06/E27_the_doctor_the_widow_and_the_wardrobe_special.jpg",
streamUrl: "https://archive.org/download/nw_S06/E27_the_doctor_the_widow_and_the_wardrobe_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E27_the_doctor_the_widow_and_the_wardrobe_special.srt"
},
{
title: "Pond Life (Prequel)",
season: 7,
episode: 1,
released: new Date("2012-08-27").toISOString(),
overview: "A series of voicemails from the Doctor charts his chaotic adventures, from surfing on a solar wave to encountering an Ood in their bathroom. This prequel shows the humorous and sometimes dangerous reality of life for Amy and Rory between TARDIS trips.",
thumbnail: "https://archive.org/download/nw_S07/E01_pond_life_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E01_pond_life_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E01_pond_life_prequel.srt"
},
{
title: "Asylum of the Daleks (Prequel)",
season: 7,
episode: 2,
released: new Date("2012-09-01").toISOString(),
overview: "A hooded messenger journeys through the ruins of Skaro to deliver a cryptic message to the Doctor. The message warns of a coming mission to the most dangerous place in the universe: the Asylum of the Daleks.",
thumbnail: "https://archive.org/download/nw_S07/E02_asylum_of_the_daleks_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E02_asylum_of_the_daleks_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E02_asylum_of_the_daleks_prequel.srt"
},
{
title: "Asylum of the Daleks",
season: 7,
episode: 3,
released: new Date("2012-09-01").toISOString(),
overview: "Kidnapped by the Daleks, the Doctor, Amy, and Rory are forced to enter the Dalek Asylum, a planet where the most insane and battle-scarred Daleks are imprisoned. There, they meet the enigmatic Oswin Oswald, who may hold the key to their survival.",
thumbnail: "https://archive.org/download/nw_S07/E03_asylum_of_the_daleks.jpg",
streamUrl: "https://archive.org/download/nw_S07/E03_asylum_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E03_asylum_of_the_daleks.srt"
},
{
title: "The Inforarium (Minisode)",
season: 7,
episode: 4,
released: new Date("2012-09-02").toISOString(),
overview: "To erase himself from every database in the universe, the Doctor visits the Inforarium, a place of forbidden knowledge. In this brief adventure, he cleverly deletes all records of his existence, one memory-wiped informant at a time.",
thumbnail: "https://archive.org/download/nw_S07/E04_the_inforarium_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E04_the_inforarium_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E04_the_inforarium_minisode.srt"
},
{
title: "Dinosaurs on a Spaceship",
season: 7,
episode: 5,
released: new Date("2012-09-08").toISOString(),
overview: "The Doctor assembles a gang, including Queen Nefertiti and Rory's dad, to investigate a Silurian spaceship filled with dinosaurs that is on a collision course with Earth. They must stop a ruthless trader from claiming the precious cargo.",
thumbnail: "https://archive.org/download/nw_S07/E05_dinosaurs_on_a_spaceship.jpg",
streamUrl: "https://archive.org/download/nw_S07/E05_dinosaurs_on_a_spaceship.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E05_dinosaurs_on_a_spaceship.srt"
},
{
title: "The Making of the Gunslinger (Prequel)",
season: 7,
episode: 6,
released: new Date("2012-09-08").toISOString(),
overview: "This prequel offers a glimpse into the creation of the Gunslinger, the cyborg antagonist from 'A Town Called Mercy'. We see the reluctant subject being converted into a weapon, setting up his tragic backstory and quest for justice.",
thumbnail: "https://archive.org/download/nw_S07/E06_the_making_of_the_gunslinger_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E06_the_making_of_the_gunslinger_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E06_the_making_of_the_gunslinger_prequel.srt"
},
{
title: "A Town Called Mercy",
season: 7,
episode: 7,
released: new Date("2012-09-15").toISOString(),
overview: "The Doctor becomes the reluctant sheriff of a Wild West town that is being terrorized by a relentless cyborg, the Gunslinger. He discovers the town is protecting a fugitive alien doctor, forcing him to make a difficult moral choice.",
thumbnail: "https://archive.org/download/nw_S07/E07_a_town_called_mercy.jpg",
streamUrl: "https://archive.org/download/nw_S07/E07_a_town_called_mercy.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E07_a_town_called_mercy.srt"
},
{
title: "The Power of Three",
season: 7,
episode: 8,
released: new Date("2012-09-22").toISOString(),
overview: "Millions of mysterious black cubes appear overnight across the globe, and the Doctor decides to stay with Amy and Rory to investigate. As humanity adapts to the strange objects, the Doctor uncovers a sinister, slow-burning invasion.",
thumbnail: "https://archive.org/download/nw_S07/E08_the_power_of_three.jpg",
streamUrl: "https://archive.org/download/nw_S07/E08_the_power_of_three.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E08_the_power_of_three.srt"
},
{
title: "The Angels Take Manhattan",
season: 7,
episode: 9,
released: new Date("2012-09-29").toISOString(),
overview: "The Weeping Angels have taken over New York City, creating a temporal farm that traps their victims in the past. When Rory becomes their next victim, the Doctor and Amy must face a heartbreaking paradox to save him, leading to a final, tragic farewell.",
thumbnail: "https://archive.org/download/nw_S07/E09_the_angels_take_manhattan.jpg",
streamUrl: "https://archive.org/download/nw_S07/E09_the_angels_take_manhattan.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E09_the_angels_take_manhattan.srt"
},
{
title: "P.S. (Minisode)",
season: 7,
episode: 10,
released: new Date("2012-10-12").toISOString(),
overview: "In this animated storyboard, Rory's father, Brian, receives a final letter from his son, delivered by a man from the past. The letter explains what happened to Amy and Rory and asks him to look after a very special new member of the family.",
thumbnail: "https://archive.org/download/nw_S07/E10_p.s._minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E10_p.s._minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E10_p.s._minisode.srt"
},
{
title: "The Battle of Demon's Run: Two Days Later (Prequel)",
season: 7,
episode: 11,
released: new Date("2012-12-25").toISOString(),
overview: "Two days after the battle at Demon's Run, Strax the Sontaran reports to Madame Vastra about his recent adventures. This prequel connects past events to the present as Strax relays his encounters with a 'Great Detective' and a mysterious governess.",
thumbnail: "https://archive.org/download/nw_S07/E11_the_battle_of_demons_run_two_days_later_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E11_the_battle_of_demons_run_two_days_later_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E11_the_battle_of_demons_run_two_days_later_prequel.srt"
},
{
title: "The Great Detective (Prequel)",
season: 7,
episode: 12,
released: new Date("2012-12-25").toISOString(),
overview: "In Victorian London, the Paternoster Gang—Vastra, Jenny, and Strax—discuss the Doctor's recent reclusive behavior. Their conversation reveals that the Doctor has withdrawn from the universe, setting the stage for his reluctant return to action.",
thumbnail: "https://archive.org/download/nw_S07/E12_the_great_detective_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E12_the_great_detective_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E12_the_great_detective_prequel.srt"
},
{
title: "Vastra Investigates (Prequel)",
season: 7,
episode: 13,
released: new Date("2012-12-25").toISOString(),
overview: "Madame Vastra and Jenny investigate a mysterious case involving people whose memories have been wiped. Their investigation leads them to a clue about the Doctor's next adventure and the sinister 'memory worms' at play.",
thumbnail: "https://archive.org/download/nw_S07/E13_vastra_investigates_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E13_vastra_investigates_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E13_vastra_investigates_prequel.srt"
},
{
title: "The Snowmen (Special)",
season: 7,
episode: 14,
released: new Date("2012-12-25").toISOString(),
overview: "A grieving, reclusive Doctor is drawn back into action by a curious governess named Clara Oswald. Together, they must stop the Great Intelligence from creating an army of sentient snowmen to take over Victorian London.",
thumbnail: "https://archive.org/download/nw_S07/E14_the_snowmen_special.jpg",
streamUrl: "https://archive.org/download/nw_S07/E14_the_snowmen_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E14_the_snowmen_special.srt"
},
{
title: "The Bells of Saint John (Prequel)",
season: 7,
episode: 15,
released: new Date("2013-03-23").toISOString(),
overview: "Still searching for Clara Oswald, the Doctor sits on a swing in a playground, where he has a conversation with a little girl. This encounter reminds him of his purpose and sets him on the path to finding the impossible girl once more.",
thumbnail: "https://archive.org/download/nw_S07/E15_the_bells_of_saint_john_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E15_the_bells_of_saint_john_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E15_the_bells_of_saint_john_prequel.srt"
},
{
title: "The Bells of Saint John",
season: 7,
episode: 16,
released: new Date("2013-03-30").toISOString(),
overview: "The Doctor finally finds a version of Clara in modern-day London, only to discover she's connected to a sinister plot to upload human minds via WiFi. He must save her from the Great Intelligence before she is deleted forever.",
thumbnail: "https://archive.org/download/nw_S07/E16_the_bells_of_saint_john.jpg",
streamUrl: "https://archive.org/download/nw_S07/E16_the_bells_of_saint_john.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E16_the_bells_of_saint_john.srt"
},
{
title: "The Rings of Akhaten",
season: 7,
episode: 17,
released: new Date("2013-04-06").toISOString(),
overview: "For her first proper trip, Clara asks the Doctor to take her somewhere awesome, so he brings her to the vibrant rings of Akhaten. They must help a young girl face a parasitic old god that feeds on memories and emotions.",
thumbnail: "https://archive.org/download/nw_S07/E17_the_rings_of_akhaten.jpg",
streamUrl: "https://archive.org/download/nw_S07/E17_the_rings_of_akhaten.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E17_the_rings_of_akhaten.srt"
},
{
title: "Rain Gods (Minisode)",
season: 7,
episode: 18,
released: new Date("2013-04-07").toISOString(),
overview: "In a deleted scene from 'The Rings of Akhaten', the Doctor and River Song find themselves on the planet of the Rain Gods, trying to escape a ritual sacrifice. This short, humorous exchange highlights their chaotic and intertwined relationship.",
thumbnail: "https://archive.org/download/nw_S07/E18_rain_gods_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E18_rain_gods_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E18_rain_gods_minisode.srt"
},
{
title: "Cold War",
season: 7,
episode: 19,
released: new Date("2013-04-13").toISOString(),
overview: "The TARDIS lands on a damaged Russian submarine during the Cold War in 1983. The Doctor and Clara must prevent a revived Ice Warrior from launching nuclear missiles and starting a global catastrophe.",
thumbnail: "https://archive.org/download/nw_S07/E19_cold_war.jpg",
streamUrl: "https://archive.org/download/nw_S07/E19_cold_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E19_cold_war.srt"
},
{
title: "Hide",
season: 7,
episode: 20,
released: new Date("2013-04-20").toISOString(),
overview: "The Doctor and Clara visit a haunted mansion in 1974 to investigate a ghost with a psychic and a ghost hunter. They discover the 'ghost' is actually a stranded time traveler, and they must venture into a dangerous pocket universe to save her.",
thumbnail: "https://archive.org/download/nw_S07/E20_hide.jpg",
streamUrl: "https://archive.org/download/nw_S07/E20_hide.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E20_hide.srt"
},
{
title: "Journey to the Centre of the TARDIS",
season: 7,
episode: 21,
released: new Date("2013-04-27").toISOString(),
overview: "When the TARDIS is damaged by a space salvage crew, Clara becomes lost in its infinite corridors. The Doctor must recruit the salvagers to help him find her before the ship's self-destruct sequence activates, all while hiding a dark secret.",
thumbnail: "https://archive.org/download/nw_S07/E21_journey_to_the_centre_of_the_tardis.jpg",
streamUrl: "https://archive.org/download/nw_S07/E21_journey_to_the_centre_of_the_tardis.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E21_journey_to_the_centre_of_the_tardis.srt"
},
{
title: "Clara and the TARDIS (Minisode)",
season: 7,
episode: 22,
released: new Date("2013-04-28").toISOString(),
overview: "While alone in the TARDIS, Clara has a conversation with the ship itself, which displays holographic images of past companions and even herself. This minisode explores the TARDIS's consciousness and its apparent distrust of the Doctor's newest friend.",
thumbnail: "https://archive.org/download/nw_S07/E22_clara_and_the_tardis_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E22_clara_and_the_tardis_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E22_clara_and_the_tardis_minisode.srt"
},
{
title: "The Crimson Horror",
season: 7,
episode: 23,
released: new Date("2013-05-04").toISOString(),
overview: "In 19th-century Yorkshire, the Paternoster Gang investigates a utopian community where bodies are turning up bright red and petrified. They discover the Doctor is a captive of the sinister Mrs. Gillyflower and her parasitic 'Mr. Sweet'.",
thumbnail: "https://archive.org/download/nw_S07/E23_the_crimson_horror.jpg",
streamUrl: "https://archive.org/download/nw_S07/E23_the_crimson_horror.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E23_the_crimson_horror.srt"
},
{
title: "Nightmare in Silver",
season: 7,
episode: 24,
released: new Date("2013-05-11").toISOString(),
overview: "The Doctor and Clara visit an alien theme park, only to find it's the hunting ground for a new, upgraded generation of Cybermen. The Doctor is forced into a deadly game of chess for control of his own mind against the Cyber-Planner.",
thumbnail: "https://archive.org/download/nw_S07/E24_nightmare_in_silver.jpg",
streamUrl: "https://archive.org/download/nw_S07/E24_nightmare_in_silver.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E24_nightmare_in_silver.srt"
},
{
title: "Clarence and the Whispermen (Prequel)",
season: 7,
episode: 25,
released: new Date("2013-05-18").toISOString(),
overview: "A convicted murderer in prison receives a visit from the faceless Whispermen. They offer him a deal: his freedom in exchange for information about the Doctor's greatest secret—his grave on the planet Trenzalore.",
thumbnail: "https://archive.org/download/nw_S07/E25_clarence_and_the_whispermen_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E25_clarence_and_the_whispermen_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E25_clarence_and_the_whispermen_prequel.srt"
},
{
title: "She Said, He Said (Prequel)",
season: 7,
episode: 26,
released: new Date("2013-05-18").toISOString(),
overview: "In separate monologues, the Doctor and Clara reflect on their relationship and the mystery surrounding the 'impossible girl'. They both know they have a secret, but neither understands the other's, leading them towards a fateful confrontation.",
thumbnail: "https://archive.org/download/nw_S07/E26_she_said_he_said_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S07/E26_she_said_he_said_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E26_she_said_he_said_prequel.srt"
},
{
title: "The Name of the Doctor",
season: 7,
episode: 27,
released: new Date("2013-05-18").toISOString(),
overview: "The Great Intelligence kidnaps the Doctor's friends and lures him to Trenzalore, the site of his future grave. There, his greatest secret is revealed, and Clara must make a devastating sacrifice to save him by entering his own timeline.",
thumbnail: "https://archive.org/download/nw_S07/E27_the_name_of_the_doctor.jpg",
streamUrl: "https://archive.org/download/nw_S07/E27_the_name_of_the_doctor.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E27_the_name_of_the_doctor.srt"
},
{
title: "The Night of the Doctor (Minisode)",
season: 7,
episode: 28,
released: new Date("2013-11-14").toISOString(),
overview: "On the eve of the Time War, the Eighth Doctor tries to rescue a pilot from a crashing ship but is rejected for being a Time Lord. Mortally wounded, he is given a choice by the Sisterhood of Karn: regenerate into a warrior who can end the war.",
thumbnail: "https://archive.org/download/nw_S07/E28_the_night_of_the_doctor_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E28_the_night_of_the_doctor_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E28_the_night_of_the_doctor_minisode.srt"
},
{
title: "The Last Day (Minisode)",
season: 7,
episode: 29,
released: new Date("2013-11-21").toISOString(),
overview: "From the first-person perspective of a Gallifreyan soldier on his first day on the front lines of the Time War, we witness the fall of the city of Arcadia. This brief but intense prequel shows the sheer destructive power of the Dalek invasion.",
thumbnail: "https://archive.org/download/nw_S07/E29_the_last_day_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S07/E29_the_last_day_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E29_the_last_day_minisode.srt"
},
{
title: "The Day of the Doctor (Special)",
season: 7,
episode: 30,
released: new Date("2013-11-23").toISOString(),
overview: "Three incarnations of the Doctor—the Tenth, Eleventh, and the forgotten War Doctor—converge to stop a Zygon invasion and confront a terrible decision from the Time War. They must unite to rewrite their own history and save Gallifrey.",
thumbnail: "https://archive.org/download/nw_S07/E30_the_day_of_the_doctor_special.jpg",
streamUrl: "https://archive.org/download/nw_S07/E30_the_day_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E30_the_day_of_the_doctor_special.srt"
},
{
title: "The Time of the Doctor (Special)",
season: 7,
episode: 31,
released: new Date("2013-12-25").toISOString(),
overview: "Orbiting a quiet backwater planet, the massed forces of the Doctor's deadliest enemies gather, drawn to a mysterious message that echoes out to the stars. The Doctor must defend the town of Christmas for centuries, leading to his final battle and the end of his eleventh life.",
thumbnail: "https://archive.org/download/nw_S07/E31_the_time_of_the_doctor_special.jpg",
streamUrl: "https://archive.org/download/nw_S07/E31_the_time_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E31_the_time_of_the_doctor_special.srt"
},
{
title: "Deep Breath (Prequel)",
season: 8,
episode: 1,
released: new Date("2014-08-18").toISOString(),
overview: "Madame Vastra, Jenny, and Strax discuss the Doctor's unpredictable new regeneration. They express their concern over his erratic behavior and wonder if this new, more volatile incarnation can be trusted to save the day.",
thumbnail: "https://archive.org/download/nw_S08/E01_deep_breath_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S08/E01_deep_breath_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E01_deep_breath_prequel.srt"
},
{
title: "Deep Breath",
season: 8,
episode: 2,
released: new Date("2014-08-23").toISOString(),
overview: "A newly regenerated, and highly unstable, Doctor arrives in Victorian London with a confused Clara. They must stop a clockwork droid from harvesting human organs, all while Clara grapples with whether this new, older Doctor is still her friend.",
thumbnail: "https://archive.org/download/nw_S08/E02_deep_breath.jpg",
streamUrl: "https://archive.org/download/nw_S08/E02_deep_breath.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E02_deep_breath.srt"
},
{
title: "Into the Dalek",
season: 8,
episode: 3,
released: new Date("2014-08-30").toISOString(),
overview: "The Doctor and Clara are miniaturized and sent on a mission inside a damaged Dalek that has turned 'good'. As they navigate the deadly interior, the Doctor is forced to confront his own hatred and question whether he is a good man.",
thumbnail: "https://archive.org/download/nw_S08/E03_into_the_dalek.jpg",
streamUrl: "https://archive.org/download/nw_S08/E03_into_the_dalek.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E03_into_the_dalek.srt"
},
{
title: "Robot of Sherwood",
season: 8,
episode: 4,
released: new Date("2014-09-06").toISOString(),
overview: "The Doctor and Clara meet Robin Hood in Sherwood Forest, but the Doctor insists the legendary hero is a myth. Their rivalry is put to the test when they uncover a plot by the Sheriff of Nottingham and his robot knights to take over England.",
thumbnail: "https://archive.org/download/nw_S08/E04_robot_of_sherwood.jpg",
streamUrl: "https://archive.org/download/nw_S08/E04_robot_of_sherwood.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E04_robot_of_sherwood.srt"
},
{
title: "Listen",
season: 8,
episode: 5,
released: new Date("2014-09-13").toISOString(),
overview: "The Doctor becomes obsessed with the idea of a creature that is perfectly evolved to hide. His search takes him and Clara to the end of the universe and into their own pasts, where they confront a fear that has haunted the Doctor his entire life.",
thumbnail: "https://archive.org/download/nw_S08/E05_listen.jpg",
streamUrl: "https://archive.org/download/nw_S08/E05_listen.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E05_listen.srt"
},
{
title: "Time Heist",
season: 8,
episode: 6,
released: new Date("2014-09-20").toISOString(),
overview: "The Doctor and Clara, along with two strangers, wake up with their memories erased, tasked with robbing the most secure bank in the universe. They must outsmart a telepathic security chief and a creature that detects guilt to pull off the ultimate heist.",
thumbnail: "https://archive.org/download/nw_S08/E06_time_heist.jpg",
streamUrl: "https://archive.org/download/nw_S08/E06_time_heist.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E06_time_heist.srt"
},
{
title: "The Caretaker",
season: 8,
episode: 7,
released: new Date("2014-09-27").toISOString(),
overview: "The Doctor goes undercover as a caretaker at Clara's school to stop a deadly robot, the Skovox Blitzer. His presence complicates Clara's double life, forcing a tense and awkward meeting with her boyfriend, Danny Pink.",
thumbnail: "https://archive.org/download/nw_S08/E07_the_caretaker.jpg",
streamUrl: "https://archive.org/download/nw_S08/E07_the_caretaker.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E07_the_caretaker.srt"
},
{
title: "Kill the Moon",
season: 8,
episode: 8,
released: new Date("2014-10-04").toISOString(),
overview: "The Doctor and Clara join a suicide mission to the Moon, which has suddenly gained mass and is causing catastrophic tides on Earth. They discover the Moon is a giant egg, forcing Clara to make an impossible decision for all of humanity.",
thumbnail: "https://archive.org/download/nw_S08/E08_kill_the_moon.jpg",
streamUrl: "https://archive.org/download/nw_S08/E08_kill_the_moon.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E08_kill_the_moon.srt"
},
{
title: "Mummy on the Orient Express",
season: 8,
episode: 9,
released: new Date("2014-10-11").toISOString(),
overview: "On a lavish replica of the Orient Express in space, passengers are being killed by a mummy that only its victims can see. The Doctor must solve the mystery in 66 seconds before he becomes the next target, all while navigating a strained relationship with Clara.",
thumbnail: "https://archive.org/download/nw_S08/E09_mummy_on_the_orient_express.jpg",
streamUrl: "https://archive.org/download/nw_S08/E09_mummy_on_the_orient_express.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E09_mummy_on_the_orient_express.srt"
},
{
title: "Flatline",
season: 8,
episode: 10,
released: new Date("2014-10-18").toISOString(),
overview: "When the TARDIS shrinks, the Doctor is trapped inside, leaving Clara to face a new threat from another dimension. She must become the Doctor to stop the two-dimensional creatures, known as the Boneless, from flattening all of humanity.",
thumbnail: "https://archive.org/download/nw_S08/E10_flatline.jpg",
streamUrl: "https://archive.org/download/nw_S08/E10_flatline.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E10_flatline.srt"
},
{
title: "In the Forest of the Night",
season: 8,
episode: 11,
released: new Date("2014-10-25").toISOString(),
overview: "The entire world wakes up to find that a massive forest has grown overnight, covering every city and town. The Doctor, Clara, and Danny must unravel the mystery of the sudden woodland invasion while searching for a missing schoolgirl.",
thumbnail: "https://archive.org/download/nw_S08/E11_in_the_forest_of_the_night.jpg",
streamUrl: "https://archive.org/download/nw_S08/E11_in_the_forest_of_the_night.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E11_in_the_forest_of_the_night.srt"
},
{
title: "Dark Water",
season: 8,
episode: 12,
released: new Date("2014-11-01").toISOString(),
overview: "Following a tragic accident, a grieving Clara forces the Doctor to take her to the afterlife. They discover the Nethersphere, a mysterious world where the dead are conscious, and uncover a sinister plot orchestrated by a familiar face: Missy.",
thumbnail: "https://archive.org/download/nw_S08/E12_dark_water.jpg",
streamUrl: "https://archive.org/download/nw_S08/E12_dark_water.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E12_dark_water.srt"
},
{
title: "Death in Heaven",
season: 8,
episode: 13,
released: new Date("2014-11-08").toISOString(),
overview: "With Cybermen on the streets of London and Missy revealed as the Master, the Doctor faces his greatest challenge yet. As old friends unite and sacrifices are made, the Doctor must confront two impossible choices in a battle for the soul of humanity.",
thumbnail: "https://archive.org/download/nw_S08/E13_death_in_heaven.jpg",
streamUrl: "https://archive.org/download/nw_S08/E13_death_in_heaven.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E13_death_in_heaven.srt"
},
{
title: "Last Christmas (Special)",
season: 8,
episode: 14,
released: new Date("2014-12-25").toISOString(),
overview: "The Doctor and Clara are trapped on an Arctic base with Santa Claus, under attack from terrifying Dream Crabs. They soon realize they are caught in a multi-layered dream, and must find a way to wake up before the creatures consume their minds.",
thumbnail: "https://archive.org/download/nw_S08/E14_last_christmas_special.jpg",
streamUrl: "https://archive.org/download/nw_S08/E14_last_christmas_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E14_last_christmas_special.srt"
},
{
title: "Prologue (Prequel)",
season: 9,
episode: 1,
released: new Date("2015-09-11").toISOString(),
overview: "On the planet Karn, the Doctor confides in Ohila of the Sisterhood about a past mistake he must atone for. This brief prologue sets a somber tone, revealing that the Doctor is preparing to face an old and dangerous acquaintance.",
thumbnail: "https://archive.org/download/nw_S09/E01_prologue_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S09/E01_prologue_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E01_prologue_prequel.srt"
},
{
title: "The Doctor's Meditation (Prequel)",
season: 9,
episode: 2,
released: new Date("2015-09-15").toISOString(),
overview: "In medieval times, the Doctor attempts to meditate before facing his 'old friend' Davros, but he's constantly interrupted. This humorous prequel shows his struggle to prepare for a confrontation that could have devastating consequences.",
thumbnail: "https://archive.org/download/nw_S09/E02_the_doctors_meditation_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S09/E02_the_doctors_meditation_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E02_the_doctors_meditation_prequel.srt"
},
{
title: "The Magician's Apprentice",
season: 9,
episode: 3,
released: new Date("2015-09-19").toISOString(),
overview: "When the skies of Earth are frozen by a mysterious alien force, Clara and Missy must team up to find the Doctor. Their search leads them to the planet Skaro, where the Doctor has gone to confront Davros, the creator of the Daleks.",
thumbnail: "https://archive.org/download/nw_S09/E03_the_magicians_apprentice.jpg",
streamUrl: "https://archive.org/download/nw_S09/E03_the_magicians_apprentice.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E03_the_magicians_apprentice.srt"
},
{
title: "The Witch's Familiar",
season: 9,
episode: 4,
released: new Date("2015-09-26").toISOString(),
overview: "Trapped in the heart of a Dalek city without his TARDIS or sonic screwdriver, the Doctor faces his greatest temptation. He must use his cunning to survive and save Clara, while confronting the dying Davros about the nature of mercy.",
thumbnail: "https://archive.org/download/nw_S09/E04_the_witchs_familiar.jpg",
streamUrl: "https://archive.org/download/nw_S09/E04_the_witchs_familiar.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E04_the_witchs_familiar.srt"
},
{
title: "Under the Lake",
season: 9,
episode: 5,
released: new Date("2015-10-03").toISOString(),
overview: "The Doctor and Clara arrive at an underwater mining base that is being haunted by ghostly apparitions. They must solve the mystery of an alien craft and its cryptic message before the ghosts can add them to their ranks.",
thumbnail: "https://archive.org/download/nw_S09/E05_under_the_lake.jpg",
streamUrl: "https://archive.org/download/nw_S09/E05_under_the_lake.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E05_under_the_lake.srt"
},
{
title: "Before the Flood",
season: 9,
episode: 6,
released: new Date("2015-10-10").toISOString(),
overview: "To save the present, the Doctor travels back in time to before the flood, where he confronts the alien Fisher King. He must create a bootstrap paradox to outsmart the creature and save Clara, all while facing his own ghostly future.",
thumbnail: "https://archive.org/download/nw_S09/E06_before_the_flood.jpg",
streamUrl: "https://archive.org/download/nw_S09/E06_before_the_flood.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E06_before_the_flood.srt"
},
{
title: "The Girl Who Died",
season: 9,
episode: 7,
released: new Date("2015-10-17").toISOString(),
overview: "Captured by Vikings, the Doctor and Clara must help a small village defend itself against one of the deadliest warrior races in the galaxy, the Mire. A tragic event forces the Doctor to make a choice that will have repercussions for centuries.",
thumbnail: "https://archive.org/download/nw_S09/E07_the_girl_who_died.jpg",
streamUrl: "https://archive.org/download/nw_S09/E07_the_girl_who_died.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E07_the_girl_who_died.srt"
},
{
title: "The Woman Who Lived",
season: 9,
episode: 8,
released: new Date("2015-10-24").toISOString(),
overview: "In 17th-century England, the Doctor encounters Ashildr, the Viking girl he made immortal, now living as a lonely highwayman. Together, they must stop a leonine alien from opening a portal that would destroy Earth.",
thumbnail: "https://archive.org/download/nw_S09/E08_the_woman_who_lived.jpg",
streamUrl: "https://archive.org/download/nw_S09/E08_the_woman_who_lived.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E08_the_woman_who_lived.srt"
},
{
title: "The Zygon Invasion",
season: 9,
episode: 9,
released: new Date("2015-10-31").toISOString(),
overview: "A fragile peace treaty between humans and shape-shifting Zygons is threatened by a radical splinter group. The Doctor and UNIT must stop the rebellion before it escalates into a full-scale war, but with Zygons able to duplicate anyone, trust is impossible.",
thumbnail: "https://archive.org/download/nw_S09/E09_the_zygon_invasion.jpg",
streamUrl: "https://archive.org/download/nw_S09/E09_the_zygon_invasion.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E09_the_zygon_invasion.srt"
},
{
title: "The Zygon Inversion",
season: 9,
episode: 10,
released: new Date("2015-11-07").toISOString(),
overview: "With the Zygon rebellion escalating, the Doctor races against time to prevent a war that would devastate both species. He must appeal to the humanity in both sides to stop a catastrophe, culminating in a powerful speech about the futility of conflict.",
thumbnail: "https://archive.org/download/nw_S09/E10_the_zygon_inversion.jpg",
streamUrl: "https://archive.org/download/nw_S09/E10_the_zygon_inversion.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E10_the_zygon_inversion.srt"
},
{
title: "Sleep No More",
season: 9,
episode: 11,
released: new Date("2015-11-14").toISOString(),
overview: "The Doctor and Clara arrive on a space station in the 38th century where a rescue team is investigating why the crew has vanished. They discover the station's sleep-replacement pods have created monstrous creatures from sleep dust, and that nothing is as it seems.",
thumbnail: "https://archive.org/download/nw_S09/E11_sleep_no_more.jpg",
streamUrl: "https://archive.org/download/nw_S09/E11_sleep_no_more.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E11_sleep_no_more.srt"
},
{
title: "Face the Raven",
season: 9,
episode: 12,
released: new Date("2015-11-21").toISOString(),
overview: "When their old friend Rigsy is marked for death, the Doctor and Clara's investigation leads them to a secret alien refugee camp hidden in London. They soon discover Clara has unknowingly taken on Rigsy's death sentence, forcing her to bravely face her final moments.",
thumbnail: "https://archive.org/download/nw_S09/E12_face_the_raven.jpg",
streamUrl: "https://archive.org/download/nw_S09/E12_face_the_raven.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E12_face_the_raven.srt"
},
{
title: "Heaven Sent",
season: 9,
episode: 13,
released: new Date("2015-11-28").toISOString(),
overview: "Following Clara's death, the Doctor is teleported to a strange castle-like prison, pursued by a terrifying creature from his worst nightmares. Trapped in a cycle of death and rebirth, he must solve the puzzle of the confession dial to escape, a process that takes billions of years.",
thumbnail: "https://archive.org/download/nw_S09/E13_heaven_sent.jpg",
streamUrl: "https://archive.org/download/nw_S09/E13_heaven_sent.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E13_heaven_sent.srt"
},
{
title: "Hell Bent",
season: 9,
episode: 14,
released: new Date("2015-12-05").toISOString(),
overview: "Having escaped his prison, the Doctor returns to Gallifrey and confronts the Time Lords who trapped him. He will stop at nothing to save Clara, even if it means breaking the laws of time and risking the entire universe to bring her back.",
thumbnail: "https://archive.org/download/nw_S09/E14_hell_bent.jpg",
streamUrl: "https://archive.org/download/nw_S09/E14_hell_bent.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E14_hell_bent.srt"
},
{
title: "The Husbands of River Song (Special)",
season: 9,
episode: 15,
released: new Date("2015-12-25").toISOString(),
overview: "On Christmas Day, the Doctor is unwittingly recruited by River Song for a heist, but she fails to recognize his new face. Their chaotic adventure leads to a final, long-awaited date at the Singing Towers of Darillium, bringing their story full circle.",
thumbnail: "https://archive.org/download/nw_S09/E15_the_husbands_of_river_song_special.jpg",
streamUrl: "https://archive.org/download/nw_S09/E15_the_husbands_of_river_song_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E15_the_husbands_of_river_song_special.srt"
},
{
title: "The Return of Doctor Mysterio (Special)",
season: 9,
episode: 16,
released: new Date("2016-12-25").toISOString(),
overview: "In New York, the Doctor teams up with an investigative journalist and a superhero known as 'The Ghost' to combat brain-swapping aliens. He soon discovers the superhero is a man he accidentally gave powers to as a child, and must help him save the city.",
thumbnail: "https://archive.org/download/nw_S09/E16_the_return_of_doctor_mysterio_special.jpg",
streamUrl: "https://archive.org/download/nw_S09/E16_the_return_of_doctor_mysterio_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E16_the_return_of_doctor_mysterio_special.srt"
},
{
title: "Friend from the Future (Prequel)",
season: 10,
episode: 1,
released: new Date("2017-04-14").toISOString(),
overview: "The Doctor introduces his new companion, Bill Potts, as she hides from Daleks in the TARDIS. This exclusive scene offers a first look at their dynamic as the Doctor tries to explain his long and complicated history with his greatest enemies.",
thumbnail: "https://archive.org/download/nw_S10/E01_friend_from_the_future_prequel.jpg",
streamUrl: "https://archive.org/download/nw_S10/E01_friend_from_the_future_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E01_friend_from_the_future_prequel.srt"
},
{
title: "The Pilot",
season: 10,
episode: 2,
released: new Date("2017-04-15").toISOString(),
overview: "The Doctor is living under cover as a university professor, guarding a mysterious vault. He befriends a curious canteen worker named Bill Potts, and their friendship leads them into a chase across time and space against a sinister, fluid-like alien.",
thumbnail: "https://archive.org/download/nw_S10/E02_the_pilot.jpg",
streamUrl: "https://archive.org/download/nw_S10/E02_the_pilot.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E02_the_pilot.srt"
},
{
title: "Smile",
season: 10,
episode: 3,
released: new Date("2017-04-22").toISOString(),
overview: "The Doctor takes Bill to a future Earth colony where cute EmojiBots ensure everyone is happy. But if you show any sign of sadness, you are 'deleted'. They must find a way to coexist with the deadly robots before the colonists awaken.",
thumbnail: "https://archive.org/download/nw_S10/E03_smile.jpg",
streamUrl: "https://archive.org/download/nw_S10/E03_smile.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E03_smile.srt"
},
{
title: "Thin Ice",
season: 10,
episode: 4,
released: new Date("2017-04-29").toISOString(),
overview: "In Regency London, the Doctor and Bill attend the last of the great frost fairs on the frozen River Thames. They discover a giant creature trapped beneath the ice, being exploited for fuel, forcing them to confront a dark moral question.",
thumbnail: "https://archive.org/download/nw_S10/E04_thin_ice.jpg",
streamUrl: "https://archive.org/download/nw_S10/E04_thin_ice.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E04_thin_ice.srt"
},
{
title: "Knock Knock",
season: 10,
episode: 5,
released: new Date("2017-05-06").toISOString(),
overview: "Bill and her friends move into a strange, creaky old house offered by a mysterious landlord. The Doctor suspects something is wrong, and they soon discover the house is infested with terrifying alien lice that consume its tenants.",
thumbnail: "https://archive.org/download/nw_S10/E05_knock_knock.jpg",
streamUrl: "https://archive.org/download/nw_S10/E05_knock_knock.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E05_knock_knock.srt"
},
{
title: "Oxygen",
season: 10,
episode: 6,
released: new Date("2017-05-13").toISOString(),
overview: "The Doctor, Bill, and Nardole are trapped on a space station where oxygen is a commodity and the automated spacesuits are killing the crew. In a world where capitalism has run rampant, they must fight for every breath.",
thumbnail: "https://archive.org/download/nw_S10/E06_oxygen.jpg",
streamUrl: "https://archive.org/download/nw_S10/E06_oxygen.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E06_oxygen.srt"
},
{
title: "Extremis",
season: 10,
episode: 7,
released: new Date("2017-05-20").toISOString(),
overview: "The Vatican calls on the Doctor to investigate the Veritas, a forbidden text that causes its readers to take their own lives. His investigation reveals a shocking truth about his own reality and the nature of the threat hidden in the vault.",
thumbnail: "https://archive.org/download/nw_S10/E07_extremis.jpg",
streamUrl: "https://archive.org/download/nw_S10/E07_extremis.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E07_extremis.srt"
},
{
title: "The Pyramid at the End of the World",
season: 10,
episode: 8,
released: new Date("2017-05-27").toISOString(),
overview: "A 5,000-year-old pyramid mysteriously appears overnight, and its alien occupants, the Monks, offer to save humanity from an impending catastrophe. The Doctor must discover their true motives before humanity willingly consents to its own enslavement.",
thumbnail: "https://archive.org/download/nw_S10/E08_the_pyramid_at_the_end_of_the_world.jpg",
streamUrl: "https://archive.org/download/nw_S10/E08_the_pyramid_at_the_end_of_the_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E08_the_pyramid_at_the_end_of_the_world.srt"
},
{
title: "The Lie of the Land",
season: 10,
episode: 9,
released: new Date("2017-06-03").toISOString(),
overview: "With the Monks in control of Earth and the Doctor seemingly on their side, Bill and Nardole must mount a resistance. As humanity lives under a veil of fake history, they must find a way to break the Monks' psychic hold and free the planet.",
thumbnail: "https://archive.org/download/nw_S10/E09_the_lie_of_the_land.jpg",
streamUrl: "https://archive.org/download/nw_S10/E09_the_lie_of_the_land.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E09_the_lie_of_the_land.srt"
},
{
title: "Empress of Mars",
season: 10,
episode: 10,
released: new Date("2017-06-10").toISOString(),
overview: "The Doctor, Bill, and Nardole travel to Mars and discover a group of Victorian soldiers have befriended an Ice Warrior. Their fragile peace is shattered when the soldiers awaken the Ice Warrior Empress, leading to a clash of empires.",
thumbnail: "https://archive.org/download/nw_S10/E10_empress_of_mars.jpg",
streamUrl: "https://archive.org/download/nw_S10/E10_empress_of_mars.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E10_empress_of_mars.srt"
},
{
title: "The Eaters of Light",
season: 10,
episode: 11,
released: new Date("2017-06-17").toISOString(),
overview: "The Doctor and his friends travel to ancient Scotland to solve the mystery of the missing Ninth Legion. They find the soldiers were sacrificed to stop a dimension-hopping monster, and now must convince two warring tribes to unite against the creature.",
thumbnail: "https://archive.org/download/nw_S10/E11_the_eaters_of_light.jpg",
streamUrl: "https://archive.org/download/nw_S10/E11_the_eaters_of_light.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E11_the_eaters_of_light.srt"
},
{
title: "World Enough and Time",
season: 10,
episode: 12,
released: new Date("2017-06-24").toISOString(),
overview: "The Doctor puts Missy's redemption to the test by sending her on a rescue mission. The team arrives on a massive colony ship reversing away from a black hole, where they encounter the original Mondasian Cybermen and an old, familiar enemy.",
thumbnail: "https://archive.org/download/nw_S10/E12_world_enough_and_time.jpg",
streamUrl: "https://archive.org/download/nw_S10/E12_world_enough_and_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E12_world_enough_and_time.srt"
},
{
title: "The Doctor Falls",
season: 10,
episode: 13,
released: new Date("2017-07-01").toISOString(),
overview: "Facing an army of Cybermen, two versions of the Master, and his own impending regeneration, the Doctor makes a final, desperate stand. He must protect the last of a human colony, leading to a heroic sacrifice and a surprising encounter with his past.",
thumbnail: "https://archive.org/download/nw_S10/E13_the_doctor_falls.jpg",
streamUrl: "https://archive.org/download/nw_S10/E13_the_doctor_falls.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E13_the_doctor_falls.srt"
},
{
title: "Twice Upon a Time (Special)",
season: 10,
episode: 14,
released: new Date("2017-12-25").toISOString(),
overview: "At the South Pole, two Doctors refuse to regenerate: the Twelfth and the First. They are brought together by a mysterious glass entity and a World War I captain, forcing them to confront their pasts and accept their futures in one final adventure.",
thumbnail: "https://archive.org/download/nw_S10/E14_twice_upon_a_time_special.jpg",
streamUrl: "https://archive.org/download/nw_S10/E14_twice_upon_a_time_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E14_twice_upon_a_time_special.srt"
},
{
title: "The Woman Who Fell to Earth",
season: 11,
episode: 1,
released: new Date("2018-10-07").toISOString(),
overview: "In Sheffield, a group of strangers' lives are changed forever when a mysterious woman, unable to remember her own name, falls from the sky. They must unite to solve the mystery of a strange pod and a deadly alien hunter.",
thumbnail: "https://archive.org/download/nw_S11/E01_the_woman_who_fell_to_earth.jpg",
streamUrl: "https://archive.org/download/nw_S11/E01_the_woman_who_fell_to_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E01_the_woman_who_fell_to_earth.srt"
},
{
title: "The Ghost Monument",
season: 11,
episode: 2,
released: new Date("2018-10-14").toISOString(),
overview: "Stranded on the hostile planet of Desolation, the newly regenerated Doctor and her friends join a deadly intergalactic race. Their only hope of finding the TARDIS is to reach the mysterious Ghost Monument before the planet's dangers consume them.",
thumbnail: "https://archive.org/download/nw_S11/E02_the_ghost_monument.jpg",
streamUrl: "https://archive.org/download/nw_S11/E02_the_ghost_monument.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E02_the_ghost_monument.srt"
},
{
title: "Rosa",
season: 11,
episode: 3,
released: new Date("2018-10-21").toISOString(),
overview: "The Doctor and her friends land in 1955 Montgomery, Alabama, where they meet Rosa Parks. They soon discover a time-traveling racist is attempting to alter a pivotal moment in the civil rights movement, and they must ensure history stays on course.",
thumbnail: "https://archive.org/download/nw_S11/E03_rosa.jpg",
streamUrl: "https://archive.org/download/nw_S11/E03_rosa.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E03_rosa.srt"
},
{
title: "Arachnids in the UK",
season: 11,
episode: 4,
released: new Date("2018-10-28").toISOString(),
overview: "The TARDIS team returns to present-day Sheffield, only to find the city is being terrorized by giant spiders. Their investigation leads to a new luxury hotel, where a corrupt businessman's toxic waste has created a monstrous problem.",
thumbnail: "https://archive.org/download/nw_S11/E04_arachnids_in_the_uk.jpg",
streamUrl: "https://archive.org/download/nw_S11/E04_arachnids_in_the_uk.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E04_arachnids_in_the_uk.srt"
},
{
title: "The Tsuranga Conundrum",
season: 11,
episode: 5,
released: new Date("2018-11-04").toISOString(),
overview: "Injured and stranded on a medical spaceship, the Doctor and her friends find themselves targeted by a cute but deadly alien creature, the Pting. They must work with the ship's crew to stop the creature before it consumes the ship's power source.",
thumbnail: "https://archive.org/download/nw_S11/E05_the_tsuranga_conundrum.jpg",
streamUrl: "https://archive.org/download/nw_S11/E05_the_tsuranga_conundrum.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E05_the_tsuranga_conundrum.srt"
},
{
title: "Demons of the Punjab",
season: 11,
episode: 6,
released: new Date("2018-11-11").toISOString(),
overview: "Yaz asks the Doctor to take her to see her grandmother's past in 1947 India, during the turbulent Partition. They become entangled in her family's history and encounter mysterious aliens, forcing them to witness a tragic moment without interfering.",
thumbnail: "https://archive.org/download/nw_S11/E06_demons_of_the_punjab.jpg",
streamUrl: "https://archive.org/download/nw_S11/E06_demons_of_the_punjab.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E06_demons_of_the_punjab.srt"
},
{
title: "Kerblam!",
season: 11,
episode: 7,
released: new Date("2018-11-18").toISOString(),
overview: "A cryptic message for help on a packing slip leads the Doctor and her friends to go undercover at Kerblam!, a galaxy-wide online shopping service. They discover the company's automated systems are behaving strangely, and a sinister conspiracy is afoot.",
thumbnail: "https://archive.org/download/nw_S11/E07_kerblam.jpg",
streamUrl: "https://archive.org/download/nw_S11/E07_kerblam.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E07_kerblam.srt"
},
{
title: "The Witchfinders",
season: 11,
episode: 8,
released: new Date("2018-11-25").toISOString(),
overview: "The TARDIS lands in 17th-century Lancashire, where the Doctor is accused of being a witch during a village's paranoid witch hunt. They soon discover an alien intelligence is reanimating the dead, and must stop it before the entire village is consumed.",
thumbnail: "https://archive.org/download/nw_S11/E08_the_witchfinders.jpg",
streamUrl: "https://archive.org/download/nw_S11/E08_the_witchfinders.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E08_the_witchfinders.srt"
},
{
title: "It Takes You Away",
season: 11,
episode: 9,
released: new Date("2018-12-02").toISOString(),
overview: "In present-day Norway, the Doctor and her friends find a boarded-up cottage, a terrified blind girl, and a mirror that is actually a portal. They journey through to a strange parallel dimension and uncover a sentient universe's lonely plan.",
thumbnail: "https://archive.org/download/nw_S11/E09_it_takes_you_away.jpg",
streamUrl: "https://archive.org/download/nw_S11/E09_it_takes_you_away.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E09_it_takes_you_away.srt"
},
{
title: "The Battle of Ranskoor Av Kolos",
season: 11,
episode: 10,
released: new Date("2018-12-09").toISOString(),
overview: "Answering multiple distress calls, the Doctor and her team arrive on the psychic planet of Ranskoor Av Kolos. They reunite with a vengeful Graham and confront Tzim-Sha, the Stenza warrior from their first adventure, who has a devastating new plan.",
thumbnail: "https://archive.org/download/nw_S11/E10_the_battle_of_ranskoor_av_kolos.jpg",
streamUrl: "https://archive.org/download/nw_S11/E10_the_battle_of_ranskoor_av_kolos.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E10_the_battle_of_ranskoor_av_kolos.srt"
},
{
title: "Resolution (Special)",
season: 11,
episode: 11,
released: new Date("2019-01-01").toISOString(),
overview: "On New Year's Day, an ancient evil is unearthed by archaeologists in Sheffield. The Doctor and her friends discover it is a reconnaissance Dalek, separated from its casing, and must stop it from summoning a full-scale invasion fleet.",
thumbnail: "https://archive.org/download/nw_S11/E11_resolution_special.jpg",
streamUrl: "https://archive.org/download/nw_S11/E11_resolution_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E11_resolution_special.srt"
},
{
title: "Spyfall, Part 1",
season: 12,
episode: 1,
released: new Date("2020-01-01").toISOString(),
overview: "When intelligence agents worldwide are targeted by alien forces, MI6 summons the Doctor and her friends. Their investigation leads them to a tech billionaire, a mysterious new foe, and a shocking revelation about an old acquaintance.",
thumbnail: "https://archive.org/download/nw_S12/E01_spyfall_part_1.jpg",
streamUrl: "https://archive.org/download/nw_S12/E01_spyfall_part_1.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E01_spyfall_part_1.srt"
},
{
title: "Spyfall, Part 2",
season: 12,
episode: 2,
released: new Date("2020-01-05").toISOString(),
overview: "Scattered across time and space, the Doctor must escape her prison and reunite with her friends to stop the Master's devastating plan. With the help of historical figures, she uncovers a conspiracy that threatens the very fabric of Time Lord society.",
thumbnail: "https://archive.org/download/nw_S12/E02_spyfall_part_2.jpg",
streamUrl: "https://archive.org/download/nw_S12/E02_spyfall_part_2.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E02_spyfall_part_2.srt"
},
{
title: "Orphan 55",
season: 12,
episode: 3,
released: new Date("2020-01-12").toISOString(),
overview: "A trip to a luxury holiday spa turns into a fight for survival when the resort comes under attack from ferocious monsters called Dregs. The Doctor and her friends discover the spa is a 'fakation' on a dead planet, with a terrifying secret.",
thumbnail: "https://archive.org/download/nw_S12/E03_orphan_55.jpg",
streamUrl: "https://archive.org/download/nw_S12/E03_orphan_55.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E03_orphan_55.srt"
},
{
title: "Nikola Tesla's Night of Terror",
season: 12,
episode: 4,
released: new Date("2020-01-19").toISOString(),
overview: "In 1903 New York, the Doctor and her friends must help inventor Nikola Tesla defend his work from his rival Thomas Edison and a mysterious alien threat. They soon discover a scorpion-like alien race is trying to kidnap Tesla for his genius.",
thumbnail: "https://archive.org/download/nw_S12/E04_nikola_teslas_night_of_terror.jpg",
streamUrl: "https://archive.org/download/nw_S12/E04_nikola_teslas_night_of_terror.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E04_nikola_teslas_night_of_terror.srt"
},
{
title: "Fugitive of the Judoon",
season: 12,
episode: 5,
released: new Date("2020-01-26").toISOString(),
overview: "The rhino-like Judoon descend on Gloucester in search of a fugitive, putting the entire city on lockdown. The Doctor's investigation leads to the return of a familiar face and a shocking revelation that changes everything she knows about her own past.",
thumbnail: "https://archive.org/download/nw_S12/E05_fugitive_of_the_judoon.jpg",
streamUrl: "https://archive.org/download/nw_S12/E05_fugitive_of_the_judoon.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E05_fugitive_of_the_judoon.srt"
},
{
title: "Praxeus",
season: 12,
episode: 6,
released: new Date("2020-02-02").toISOString(),
overview: "The Doctor and her friends investigate a deadly pathogen that is causing birds to behave aggressively and humans to calcify. Their quest takes them from Peru to Madagascar, where they uncover an alien conspiracy involving microplastics.",
thumbnail: "https://archive.org/download/nw_S12/E06_praxeus.jpg",
streamUrl: "https://archive.org/download/nw_S12/E06_praxeus.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E06_praxeus.srt"
},
{
title: "Can You Hear Me?",
season: 12,
episode: 7,
released: new Date("2020-02-09").toISOString(),
overview: "From ancient Syria to modern-day Sheffield, the Doctor and her team investigate a sinister force that feeds on nightmares. They must confront two immortal beings who are terrorizing humanity and confront their own deepest fears.",
thumbnail: "https://archive.org/download/nw_S12/E07_can_you_hear_me.jpg",
streamUrl: "https://archive.org/download/nw_S12/E07_can_you_hear_me.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E07_can_you_hear_me.srt"
},
{
title: "The Haunting of Villa Diodati",
season: 12,
episode: 8,
released: new Date("2020-02-16").toISOString(),
overview: "On the night that inspired 'Frankenstein', the Doctor and her friends visit Lord Byron, Percy, and Mary Shelley. They discover the villa is haunted by a lone, partially-converted Cyberman, forcing the Doctor to make a choice that could endanger the future.",
thumbnail: "https://archive.org/download/nw_S12/E08_the_haunting_of_villa_diodati.jpg",
streamUrl: "https://archive.org/download/nw_S12/E08_the_haunting_of_villa_diodati.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E08_the_haunting_of_villa_diodati.srt"
},
{
title: "Ascension of the Cybermen",
season: 12,
episode: 9,
released: new Date("2020-02-23").toISOString(),
overview: "In the far future, the Doctor and her friends join the last remnants of humanity in a desperate battle against a new generation of Cybermen. Their journey leads them to a mysterious boundary and a shocking discovery about the history of Gallifrey.",
thumbnail: "https://archive.org/download/nw_S12/E09_ascension_of_the_cybermen.jpg",
streamUrl: "https://archive.org/download/nw_S12/E09_ascension_of_the_cybermen.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E09_ascension_of_the_cybermen.srt"
},
{
title: "The Timeless Children",
season: 12,
episode: 10,
released: new Date("2020-03-01").toISOString(),
overview: "As the Cybermen ascend, the Doctor is trapped by the Master, who reveals a devastating secret about her past and the origin of the Time Lords. With lies exposed and civilizations falling, the Doctor's identity is changed forever.",
thumbnail: "https://archive.org/download/nw_S12/E10_the_timeless_children.jpg",
streamUrl: "https://archive.org/download/nw_S12/E10_the_timeless_children.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E10_the_timeless_children.srt"
},
{
title: "Revolution of the Daleks (Special)",
season: 12,
episode: 11,
released: new Date("2021-01-01").toISOString(),
overview: "With the Doctor imprisoned, her friends on Earth must team up with Captain Jack Harkness to fight a new breed of Daleks created by a corrupt businessman. They must find a way to stop the Dalek takeover before they exterminate all of humanity.",
thumbnail: "https://archive.org/download/nw_S12/E11_revolution_of_the_daleks_special.jpg",
streamUrl: "https://archive.org/download/nw_S12/E11_revolution_of_the_daleks_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E11_revolution_of_the_daleks_special.srt"
},
{
title: "The Halloween Apocalypse",
season: 13,
episode: 1,
released: new Date("2021-10-31").toISOString(),
overview: "On Halloween, the Doctor and Yaz are pursued by a mysterious new enemy, Karvanista. They cross paths with a man named Dan Lewis and discover an ancient evil known as the Flux is breaking free, threatening to unravel the entire universe.",
thumbnail: "https://archive.org/download/nw_S13/E01_the_halloween_apocalypse.jpg",
streamUrl: "https://archive.org/download/nw_S13/E01_the_halloween_apocalypse.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E01_the_halloween_apocalypse.srt"
},
{
title: "War of the Sontarans",
season: 13,
episode: 2,
released: new Date("2021-11-07").toISOString(),
overview: "The Flux deposits the Doctor in the Crimean War, where she finds the British army fighting an army of Sontarans. Meanwhile, Yaz and Dan are thrown into a mysterious temple, where they must survive against deadly temporal forces.",
thumbnail: "https://archive.org/download/nw_S13/E02_war_of_the_sontarans.jpg",
streamUrl: "https://archive.org/download/nw_S13/E02_war_of_the_sontarans.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E02_war_of_the_sontarans.srt"
},
{
title: "Once, Upon Time",
season: 13,
episode: 3,
released: new Date("2021-11-14").toISOString(),
overview: "Caught in a time storm, the Doctor, Yaz, Dan, and a new ally named Vinder are scattered across their own pasts. They must navigate fragmented memories to survive and uncover clues about the Flux and the Doctor's hidden history.",
thumbnail: "https://archive.org/download/nw_S13/E03_once_upon_time.jpg",
streamUrl: "https://archive.org/download/nw_S13/E03_once_upon_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E03_once_upon_time.srt"
},
{
title: "Village of the Angels",
season: 13,
episode: 4,
released: new Date("2021-11-21").toISOString(),
overview: "The TARDIS lands in 1967 in a village haunted by Weeping Angels. The Doctor, Yaz, and Dan must help a psychic researcher save a missing girl and uncover the Angels' sinister plan, which has a shocking connection to the Doctor herself.",
thumbnail: "https://archive.org/download/nw_S13/E04_village_of_the_angels.jpg",
streamUrl: "https://archive.org/download/nw_S13/E04_village_of_the_angels.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E04_village_of_the_angels.srt"
},
{
title: "Survivors of the Flux",
season: 13,
episode: 5,
released: new Date("2021-11-28").toISOString(),
overview: "As the Flux consumes the universe, the Doctor confronts her forgotten past with the secret organization known as the Division. Meanwhile, Yaz, Dan, and their allies must survive against the Sontarans, Cybermen, and Daleks.",
thumbnail: "https://archive.org/download/nw_S13/E05_survivors_of_the_flux.jpg",
streamUrl: "https://archive.org/download/nw_S13/E05_survivors_of_the_flux.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E05_survivors_of_the_flux.srt"
},
{
title: "The Vanquishers",
season: 13,
episode: 6,
released: new Date("2021-12-05").toISOString(),
overview: "In the final chapter of the Flux, the Doctor must outsmart her enemies and find a way to reverse the destruction of the universe. With the help of her friends and a few surprises, she confronts the Sontarans, the Ravagers, and her own past.",
thumbnail: "https://archive.org/download/nw_S13/E06_the_vanquishers.jpg",
streamUrl: "https://archive.org/download/nw_S13/E06_the_vanquishers.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E06_the_vanquishers.srt"
},
{
title: "Eve of the Daleks (Special)",
season: 13,
episode: 7,
released: new Date("2022-01-01").toISOString(),
overview: "On New Year's Eve, the Doctor, Yaz, and Dan are trapped in a time loop with two strangers in a storage facility. They are being hunted by an executioner Dalek, and must use the loop to find a way to survive and break the cycle.",
thumbnail: "https://archive.org/download/nw_S13/E07_eve_of_the_daleks_special.jpg",
streamUrl: "https://archive.org/download/nw_S13/E07_eve_of_the_daleks_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E07_eve_of_the_daleks_special.srt"
},
{
title: "Legend of the Sea Devils (Special)",
season: 13,
episode: 8,
released: new Date("2022-04-17").toISOString(),
overview: "In 19th-century China, the Doctor, Yaz, and Dan team up with a legendary pirate queen to fight the fearsome Sea Devils. They must uncover the secrets of a lost treasure and stop the reptilian aliens from flooding the planet.",
thumbnail: "https://archive.org/download/nw_S13/E08_legend_of_the_sea_devils_special.jpg",
streamUrl: "https://archive.org/download/nw_S13/E08_legend_of_the_sea_devils_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E08_legend_of_the_sea_devils_special.srt"
},
{
title: "The Power of the Doctor (Special)",
season: 13,
episode: 9,
released: new Date("2022-10-23").toISOString(),
overview: "In her final battle, the Thirteenth Doctor confronts her deadliest enemies: the Daleks, the Cybermen, and the Master. With the help of old friends, she must fight for her very existence and face a forced regeneration that will change everything.",
thumbnail: "https://archive.org/download/nw_S13/E09_the_power_of_the_doctor_special.jpg",
streamUrl: "https://archive.org/download/nw_S13/E09_the_power_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E09_the_power_of_the_doctor_special.srt"
},
{
title: "Destination: Skaro (Minisode)",
season: 14,
episode: 1,
released: new Date("2023-11-17").toISOString(),
overview: "Before the Daleks had a name, their creator Davros presents his new 'Mark III Travel Machine' to a nervous colleague. But a chance encounter with the TARDIS gives Davros the perfect, chilling name for his monstrous creations.",
thumbnail: "https://archive.org/download/nw_S14/E01_destination_skaro_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S14/E01_destination_skaro_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E01_destination_skaro_minisode.srt"
},
{
title: "The Star Beast (Special)",
season: 14,
episode: 2,
released: new Date("2023-11-25").toISOString(),
overview: "The newly regenerated Fourteenth Doctor is reunited with Donna Noble, just as a spaceship crashes in London. They must protect a cute and cuddly alien, the Meep, from deadly soldiers, and prevent Donna's memories from destroying her mind.",
thumbnail: "https://archive.org/download/nw_S14/E02_the_star_beast_special.jpg",
streamUrl: "https://archive.org/download/nw_S14/E02_the_star_beast_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E02_the_star_beast_special.srt"
},
{
title: "Wild Blue Yonder (Special)",
season: 14,
episode: 3,
released: new Date("2023-12-02").toISOString(),
overview: "The TARDIS takes the Doctor and Donna to a desolate spaceship at the edge of the universe. There, they are hunted by two mysterious beings that can duplicate their forms and memories, forcing them into a terrifying psychological battle.",
thumbnail: "https://archive.org/download/nw_S14/E03_wild_blue_yonder_special.jpg",
streamUrl: "https://archive.org/download/nw_S14/E03_wild_blue_yonder_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E03_wild_blue_yonder_special.srt"
},
{
title: "The Giggle (Special)",
season: 14,
episode: 4,
released: new Date("2023-12-09").toISOString(),
overview: "The Doctor discovers the giggle of a mysterious puppet is driving humanity insane. His investigation leads to the return of the cosmic Toymaker, forcing the Doctor into a fight he can't win and a regeneration he never expected.",
thumbnail: "https://archive.org/download/nw_S14/E04_the_giggle_special.jpg",
streamUrl: "https://archive.org/download/nw_S14/E04_the_giggle_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E04_the_giggle_special.srt"
},
{
title: "The Church on Ruby Road (Special)",
season: 15,
episode: 1,
released: new Date("2023-12-25").toISOString(),
overview: "On Christmas Eve, a foundling named Ruby Sunday meets the newly bi-generated Fifteenth Doctor. Together, they must stop a band of time-traveling goblins from eating babies and uncover the secrets of Ruby's mysterious birth.",
thumbnail: "https://archive.org/download/nw_S15/E01_the_church_on_ruby_road_special.jpg",
streamUrl: "https://archive.org/download/nw_S15/E01_the_church_on_ruby_road_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E01_the_church_on_ruby_road_special.srt"
},
{
title: "Space Babies",
season: 15,
episode: 2,
released: new Date("2024-05-11").toISOString(),
overview: "The Doctor takes Ruby to a futuristic baby farm run by talking infants. Their adventure takes a dark turn when they discover a terrifying Bogeyman lurking in the lower decks, forcing them to protect the station's young inhabitants.",
thumbnail: "https://archive.org/download/nw_S15/E02_space_babies.jpg",
streamUrl: "https://archive.org/download/nw_S15/E02_space_babies.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E02_space_babies.srt"
},
{
title: "The Devil's Chord",
season: 15,
episode: 3,
released: new Date("2024-05-11").toISOString(),
overview: "A trip to see The Beatles in the 1960s reveals a world where music has been erased from existence. The Doctor and Ruby must confront Maestro, a powerful being who feeds on sound, in a battle for the future of humanity's creativity.",
thumbnail: "https://archive.org/download/nw_S15/E03_the_devils_chord.jpg",
streamUrl: "https://archive.org/download/nw_S15/E03_the_devils_chord.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E03_the_devils_chord.srt"
},
{
title: "Boom",
season: 15,
episode: 4,
released: new Date("2024-05-18").toISOString(),
overview: "On the war-torn planet of Kastarion 3, the Doctor steps on a landmine and cannot move without detonating it. He must save himself, Ruby, and the entire planet while contending with a faith-driven army and the AI of a soulless arms manufacturer.",
thumbnail: "https://archive.org/download/nw_S15/E04_boom.jpg",
streamUrl: "https://archive.org/download/nw_S15/E04_boom.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E04_boom.srt"
},
{
title: "73 Yards",
season: 15,
episode: 5,
released: new Date("2024-05-25").toISOString(),
overview: "After the Doctor mysteriously vanishes on the Welsh coast, Ruby is stalked by a strange woman who is always 73 yards away. She must navigate a life of isolation and fear to understand the woman's purpose and solve a decades-long mystery.",
thumbnail: "https://archive.org/download/nw_S15/E05_73_yards.jpg",
streamUrl: "https://archive.org/download/nw_S15/E05_73_yards.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E05_73_yards.srt"
},
{
title: "Dot and Bubble",
season: 15,
episode: 6,
released: new Date("2024-06-01").toISOString(),
overview: "The Doctor and Ruby arrive in the idyllic world of Finetime, where citizens live in social media-like bubbles. They must convince a young woman named Lindy to see the terrifying truth about the giant slugs devouring her friends before it's too late.",
thumbnail: "https://archive.org/download/nw_S15/E06_dot_and_bubble.jpg",
streamUrl: "https://archive.org/download/nw_S15/E06_dot_and_bubble.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E06_dot_and_bubble.srt"
},
{
title: "Rogue",
season: 15,
episode: 7,
released: new Date("2024-06-08").toISOString(),
overview: "The Doctor and Ruby land at a Regency-era ball, where they meet a mysterious bounty hunter named Rogue. Together, they must unmask shape-shifting aliens who are murdering the guests, leading to a fateful and romantic encounter for the Doctor.",
thumbnail: "https://archive.org/download/nw_S15/E07_rogue.jpg",
streamUrl: "https://archive.org/download/nw_S15/E07_rogue.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E07_rogue.srt"
},
{
title: "The Legend of Ruby Sunday",
season: 15,
episode: 8,
released: new Date("2024-06-15").toISOString(),
overview: "The Doctor and UNIT use a time window to investigate Ruby's past, hoping to find her birth mother. Their investigation unleashes the 'god of death', Sutekh, who has been hiding in plain sight, setting the stage for a universe-ending confrontation.",
thumbnail: "https://archive.org/download/nw_S15/E08_the_legend_of_ruby_sunday.jpg",
streamUrl: "https://archive.org/download/nw_S15/E08_the_legend_of_ruby_sunday.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E08_the_legend_of_ruby_sunday.srt"
},
{
title: "Empire of Death",
season: 15,
episode: 9,
released: new Date("2024-06-22").toISOString(),
overview: "With Sutekh triumphant and a dust of death sweeping across creation, the Doctor has lost. His only hope lies with Ruby Sunday, an ordinary woman who may hold the key to defeating an ancient and all-powerful enemy.",
thumbnail: "https://archive.org/download/nw_S15/E09_empire_of_death.jpg",
streamUrl: "https://archive.org/download/nw_S15/E09_empire_of_death.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E09_empire_of_death.srt"
},
{
title: "Bad Music (Minisode)",
season: 15,
episode: 10,
released: new Date("2024-12-25").toISOString(),
overview: "In this festive short, the Doctor tries to teach Ruby Sunday's band how to play a Christmas carol on a futuristic instrument. Their attempts result in chaotic, 'bad' music, providing a lighthearted moment before their next big adventure.",
thumbnail: "https://archive.org/download/nw_S15/E10_bad_music_minisode.jpg",
streamUrl: "https://archive.org/download/nw_S15/E10_bad_music_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E10_bad_music_minisode.srt"
},
{
title: "Joy to the World (Special)",
season: 15,
episode: 11,
released: new Date("2024-12-25").toISOString(),
overview: "On Christmas Day, a young girl named Joy discovers a secret doorway to a magical Time Hotel. Her adventure with the Doctor reveals danger, dinosaurs, and a deadly plan unfolding across the Earth, all set against a festive backdrop.",
thumbnail: "https://archive.org/download/nw_S15/E11_joy_to_the_world_special.jpg",
streamUrl: "https://archive.org/download/nw_S15/E11_joy_to_the_world_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E11_joy_to_the_world_special.srt"
},
{
title: "The Robot Revolution",
season: 16,
episode: 1,
released: new Date("2025-04-12").toISOString(),
overview: "The Doctor embarks on an epic intergalactic quest to rescue his new friend, nurse Belinda Chandra, after she is kidnapped by robots from outer space. His journey to bring her back home to Earth will test his resolve against a new mechanical threat.",
thumbnail: "https://archive.org/download/nw_S16/E01_the_robot_revolution.jpg",
streamUrl: "https://archive.org/download/nw_S16/E01_the_robot_revolution.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E01_the_robot_revolution.srt"
},
{
title: "Lux",
season: 16,
episode: 2,
released: new Date("2025-04-19").toISOString(),
overview: "The search for Belinda leads the Doctor to an abandoned cinema on a forgotten world. What begins as a simple investigation uncovers a terrifying secret lurking in the darkness, turning the quest for home into a fight for survival.",
thumbnail: "https://archive.org/download/nw_S16/E02_lux.jpg",
streamUrl: "https://archive.org/download/nw_S16/E02_lux.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E02_lux.srt"
},
{
title: "The Well",
season: 16,
episode: 3,
released: new Date("2025-04-26").toISOString(),
overview: "On a brutal, far-future planet, the Doctor and Belinda discover a devastated mining colony with only one survivor. To uncover the truth behind the disaster, they must confront an absolute terror that lurks deep within the planet's wells.",
thumbnail: "https://archive.org/download/nw_S16/E03_the_well.jpg",
streamUrl: "https://archive.org/download/nw_S16/E03_the_well.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E03_the_well.srt"
},
{
title: "Lucky Day",
season: 16,
episode: 4,
released: new Date("2025-05-03").toISOString(),
overview: "Back on Earth, Ruby Sunday faces life without the Doctor. When a dangerous new threat called the Shreek emerges, she must team up with UNIT to save her new boyfriend, Conrad, from a terrifying fate.",
thumbnail: "https://archive.org/download/nw_S16/E04_lucky_day.jpg",
streamUrl: "https://archive.org/download/nw_S16/E04_lucky_day.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E04_lucky_day.srt"
},
{
title: "The Story and the Engine",
season: 16,
episode: 5,
released: new Date("2025-05-10").toISOString(),
overview: "In Lagos, the Doctor confronts a mysterious figure called the Barber and a vengeful Spider weaving a web of powerful stories. He soon discovers that in this place, narratives hold real, tangible power, and he must unravel the tale to survive.",
thumbnail: "https://archive.org/download/nw_S16/E05_the_story_and_the_engine.jpg",
streamUrl: "https://archive.org/download/nw_S16/E05_the_story_and_the_engine.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E05_the_story_and_the_engine.srt"
},
{
title: "The Interstellar Song Contest",
season: 16,
episode: 6,
released: new Date("2025-05-17").toISOString(),
overview: "The Doctor's mission to get Belinda home brings them to a galactic song competition aboard a massive space station. What starts as a lighthearted musical journey quickly turns into a desperate fight for survival against a hidden threat.",
thumbnail: "https://archive.org/download/nw_S16/E06_the_interstellar_song_contest.jpg",
streamUrl: "https://archive.org/download/nw_S16/E06_the_interstellar_song_contest.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E06_the_interstellar_song_contest.srt"
},
{
title: "Wish World",
season: 16,
episode: 7,
released: new Date("2025-05-24").toISOString(),
overview: "The Doctor and Belinda finally arrive home to find a very different world, where old enemies have united and traps are sprung. As midnight approaches, the Doctor must see through the illusion of this 'Wish World' before reality is rewritten forever.",
thumbnail: "https://archive.org/download/nw_S16/E07_wish_world.jpg",
streamUrl: "https://archive.org/download/nw_S16/E07_wish_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E07_wish_world.srt"
},
{
title: "The Reality War",
season: 16,
episode: 8,
released: new Date("2025-05-31").toISOString(),
overview: "As battle rages across the skies, the Unholy Trinity unleashes their deadly ambition upon the universe. The Doctor, Belinda, and Ruby must risk everything in a desperate quest to save one innocent life and win the war for reality itself.",
thumbnail: "https://archive.org/download/nw_S16/E08_the_reality_war.jpg",
streamUrl: "https://archive.org/download/nw_S16/E08_the_reality_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E08_the_reality_war.srt"
}
];

module.exports = episodes;
