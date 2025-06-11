const episodes = [
{
title: "Rose",
season: 1,
episode: 1,
released: new Date("2005-03-26").toISOString(),
overview: "When ordinary shop-worker Rose Tyler meets a mysterious stranger called the Doctor she is drawn into his strange and dangerous world; her life will never be the same again.",
thumbnail: "https://image.tmdb.org/t/p/original/dZNrYgOvt5M6oPAcMf5HH103E05.jpg",
streamUrl: "https://archive.org/download/nw_S01/E01_rose.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E01_rose.srt"
},
{
title: "The End of the World",
season: 1,
episode: 2,
released: new Date("2005-04-02").toISOString(),
overview: "The Doctor takes Rose on her first voyage through time, to the year five billion and the end of planet Earth.",
thumbnail: "https://image.tmdb.org/t/p/original/5K6YOLEC8wRzugniOXCQNVndSyD.jpg",
streamUrl: "https://archive.org/download/nw_S01/E02_the_end_of_the_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E02_the_end_of_the_world.srt"
},
{
title: "The Unquiet Dead",
season: 1,
episode: 3,
released: new Date("2005-04-09").toISOString(),
overview: "The Doctor has great expectations for his latest adventure when he and Rose join forces with Charles Dickens to investigate a mysterious plague of zombies.",
thumbnail: "https://image.tmdb.org/t/p/original/qT2Ca5Ljlt4gigJPNrmYHMnoE7I.jpg",
streamUrl: "https://archive.org/download/nw_S01/E03_the_unquiet_dead.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E03_the_unquiet_dead.srt"
},
{
title: "Aliens of London",
season: 1,
episode: 4,
released: new Date("2005-04-16").toISOString(),
overview: "The Doctor returns Rose to her own time - well, sort of - but her family reunion is ruined when a spaceship crashes in the middle of London. What is the origin of the spaceship, and where has the Prime Minister gone in this time of crisis?",
thumbnail: "https://image.tmdb.org/t/p/original/hGmpP763cd0ZNZ9wj42sRf1jvUi.jpg",
streamUrl: "https://archive.org/download/nw_S01/E04_aliens_of_london.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E04_aliens_of_london.srt"
},
{
title: "World War Three",
season: 1,
episode: 5,
released: new Date("2005-04-23").toISOString(),
overview: "The Slitheen have infiltrated Parliament and have the Doctor and his friends trapped as the Doctor works to prevent them from starting World War Three.",
thumbnail: "https://image.tmdb.org/t/p/original/wEkPrSrR7Y7pw7GcO1B2QerHlIG.jpg",
streamUrl: "https://archive.org/download/nw_S01/E05_world_war_three.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E05_world_war_three.srt"
},
{
title: "Dalek",
season: 1,
episode: 6,
released: new Date("2005-04-30").toISOString(),
overview: "The TARDIS is drawn to an alien museum deep below the Utah desert, where a ruthless billionaire keeps prisoner the last of the Doctor's most fearsome enemies.",
thumbnail: "https://image.tmdb.org/t/p/original/ijo4TGwFjk8x0ZrU2fg5OVYFEbx.jpg",
streamUrl: "https://archive.org/download/nw_S01/E06_dalek.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E06_dalek.srt"
},
{
title: "The Long Game",
season: 1,
episode: 7,
released: new Date("2005-05-07").toISOString(),
overview: "In the year 200,000 the Doctor discovers that a satellite with a dark secret is controlling humanity and slowing its development.",
thumbnail: "https://image.tmdb.org/t/p/original/mNHTwFXyO3LPMqTKnBAHuzosGK.jpg",
streamUrl: "https://archive.org/download/nw_S01/E07_the_long_game.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E07_the_long_game.srt"
},
{
title: "Father's Day",
season: 1,
episode: 8,
released: new Date("2005-05-14").toISOString(),
overview: "Rose asks The Doctor to take her to 1987, on the day her father was killed.",
thumbnail: "https://image.tmdb.org/t/p/original/gC2tJRtQY4oaAoN0PK0Ltg7N3eE.jpg",
streamUrl: "https://archive.org/download/nw_S01/E08_fathers_day.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E08_fathers_day.srt"
},
{
title: "The Empty Child",
season: 1,
episode: 9,
released: new Date("2005-05-21").toISOString(),
overview: "When a spaceship crashes in the middle of the London Blitz the Doctor, Rose and the enigmatic Captain Jack Harkness find themselves investigating a plague of physical injuries and a little boy in a gas mask.",
thumbnail: "https://image.tmdb.org/t/p/original/obBxGEt9GAbvgOm4vkcjOWp5BSY.jpg",
streamUrl: "https://archive.org/download/nw_S01/E09_the_empty_child.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E09_the_empty_child.srt"
},
{
title: "The Doctor Dances",
season: 1,
episode: 10,
released: new Date("2005-05-28").toISOString(),
overview: "The gas mask zombies are on the rise as the plague spreads across war-torn London.",
thumbnail: "https://image.tmdb.org/t/p/original/yJTDD8NvVjWeWXlMokLvsU4kDjN.jpg",
streamUrl: "https://archive.org/download/nw_S01/E10_the_doctor_dances.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E10_the_doctor_dances.srt"
},
{
title: "Boom Town",
season: 1,
episode: 11,
released: new Date("2005-06-04").toISOString(),
overview: "Stopping off in present-day Cardiff to recharge the TARDIS, The Doctor, Rose and Jack meet up with Mickey and encounter an old foe in the midst of hatching a scheme that could destroy the entire planet.",
thumbnail: "https://image.tmdb.org/t/p/original/9y8zGuQYawL0CgrY8kRAYvlysOK.jpg",
streamUrl: "https://archive.org/download/nw_S01/E11_boom_town.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E11_boom_town.srt"
},
{
title: "Bad Wolf",
season: 1,
episode: 12,
released: new Date("2005-06-11").toISOString(),
overview: "The Doctor, Rose and Jack are separated and forced to compete in twisted and deadly games on the Game Station.",
thumbnail: "https://image.tmdb.org/t/p/original/kmMR3X5Zxh1SCSQn4OcC8XZbadQ.jpg",
streamUrl: "https://archive.org/download/nw_S01/E12_bad_wolf.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E12_bad_wolf.srt"
},
{
title: "The Parting of the Ways",
season: 1,
episode: 13,
released: new Date("2005-06-18").toISOString(),
overview: "As the Dalek fleet begin their attack on the Earth, the Doctor and his allies make one final stand.",
thumbnail: "https://image.tmdb.org/t/p/original/1OkIS6TM8d1KFo5krGS6nvn37pH.jpg",
streamUrl: "https://archive.org/download/nw_S01/E13_the_parting_of_the_ways.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E13_the_parting_of_the_ways.srt"
},
{
title: "Born Again (Minisode)",
season: 1,
episode: 14,
released: new Date("2005-11-18").toISOString(),
overview: "A short scene that bridges the gap between 'The Parting of the Ways' and 'The Christmas Invasion', where the newly-regenerated Doctor explains to a disbelieving Rose what has happened.",
thumbnail: "https://image.tmdb.org/t/p/original/vTYe16Hj5KtDCbLiSi74HHZFp2p.jpg",
streamUrl: "https://archive.org/download/nw_S01/E14_born_again_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E14_born_again_minisode.srt"
},
{
title: "The Christmas Invasion (Special)",
season: 1,
episode: 15,
released: new Date("2005-12-25").toISOString(),
overview: "It's Christmas Eve, but this is to be a far from silent night - the cruel Sycorax have come to Earth to enslave mankind and, as ever, only The Doctor can stop them. Unfortunately, he's lying in a coma in Jackie's home...",
thumbnail: "https://image.tmdb.org/t/p/original/jo0IhotBj6n3kmr4INLW55F4dTr.jpg",
streamUrl: "https://archive.org/download/nw_S01/E15_the_christmas_invasion_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S01/E15_the_christmas_invasion_special.srt"
},
{
title: "New Earth",
season: 2,
episode: 1,
released: new Date("2006-04-15").toISOString(),
overview: "The Doctor and Rose arrive on New Earth and meet old friends and enemies in a hospital which can cure every disease. But the cures come at a terrible cost.",
thumbnail: "https://image.tmdb.org/t/p/original/s1eFDyxYDF2w8dZhATFAQFm2NhY.jpg",
streamUrl: "https://archive.org/download/nw_S02/E01_new_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E01_new_earth.srt"
},
{
title: "Tooth and Claw",
season: 2,
episode: 2,
released: new Date("2006-04-22").toISOString(),
overview: "The Doctor and Rose are transported to 19th Century Scotland, where they meet Queen Victoria, and try to protect her from a ravenous werewolf and a band of assassinating warrior-monks.",
thumbnail: "https://image.tmdb.org/t/p/original/2cs5eMckKxOt6yaVG0G4h7ETjI0.jpg",
streamUrl: "https://archive.org/download/nw_S02/E02_tooth_and_claw.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E02_tooth_and_claw.srt"
},
{
title: "School Reunion",
season: 2,
episode: 3,
released: new Date("2006-04-29").toISOString(),
overview: "The Krillitanes - aliens with a mix-and-match physiology - are trying to crack the 'God-Maker', a paradigm to give them ultimate power. They are using children as a computer, and only the Doctor and Rose, re-united with Sarah Jane Smith and K9 can prevent them from becoming masters of time and space.",
thumbnail: "https://image.tmdb.org/t/p/original/yocFrIn7kNPzbAhWdGCMhICS4fu.jpg",
streamUrl: "https://archive.org/download/nw_S02/E03_school_reunion.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E03_school_reunion.srt"
},
{
title: "The Girl in the Fireplace",
season: 2,
episode: 4,
released: new Date("2006-05-06").toISOString(),
overview: "The Doctor, Mickey and Rose land on a spaceship in the 51st century only to find 18th century Versailles on board, the time of Madame De Pompadour! To find out what's going on the Doctor must enter Versailles and save Madame de Pompadour but it turns into an emotional roller coaster for the Doctor.",
thumbnail: "https://image.tmdb.org/t/p/original/yN4GJf4cimPy6EMQh2pYPZp6ZhA.jpg",
streamUrl: "https://archive.org/download/nw_S02/E04_the_girl_in_the_fireplace.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E04_the_girl_in_the_fireplace.srt"
},
{
title: "Rise of the Cybermen",
season: 2,
episode: 5,
released: new Date("2006-05-13").toISOString(),
overview: "The TARDIS crash lands in London on a parallel world, where Rose's dad is still alive, people are disappearing off the streets and one of the Doctor's deadliest enemies is about to be reborn.",
thumbnail: "https://image.tmdb.org/t/p/original/po20igUYu3TdMI0ajotxX64LNQR.jpg",
streamUrl: "https://archive.org/download/nw_S02/E05_rise_of_the_cybermen.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E05_rise_of_the_cybermen.srt"
},
{
title: "The Age of Steel",
season: 2,
episode: 6,
released: new Date("2006-05-20").toISOString(),
overview: "The Cybermen take control of London as the population is enslaved and the Doctor and his friends become fugitives.",
thumbnail: "https://image.tmdb.org/t/p/original/9sJlC7b46N6uO4QRdWFD3PEXBme.jpg",
streamUrl: "https://archive.org/download/nw_S02/E06_the_age_of_steel.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E06_the_age_of_steel.srt"
},
{
title: "The Idiot's Lantern",
season: 2,
episode: 7,
released: new Date("2006-05-27").toISOString(),
overview: "As the coronation of Elizabeth II nears, the streets of London live in fear. Faceless people are stolen from their homes in the night and something evil is lurking in the television.",
thumbnail: "https://image.tmdb.org/t/p/original/cbCRy1RwRvrdLeocZa8RDERJxC5.jpg",
streamUrl: "https://archive.org/download/nw_S02/E07_the_idiots_lantern.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E07_the_idiots_lantern.srt"
},
{
title: "The Impossible Planet",
season: 2,
episode: 8,
released: new Date("2006-06-03").toISOString(),
overview: "When the Doctor and Rose become stranded on a planet orbiting a black hole, they find a human expedition crew and their servants, the Ood, being terrorised by the Devil.",
thumbnail: "https://image.tmdb.org/t/p/original/62ir7aFCD5Q5bpOslSB20VBywnx.jpg",
streamUrl: "https://archive.org/download/nw_S02/E08_the_impossible_planet.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E08_the_impossible_planet.srt"
},
{
title: "The Satan Pit",
season: 2,
episode: 9,
released: new Date("2006-06-10").toISOString(),
overview: "The Doctor risks his life to investigate the pit and is forced to make a terrible decision, while Rose and the crew fend for their lives against the Legion of the Beast.",
thumbnail: "https://image.tmdb.org/t/p/original/AhLxY9rJO5S1VfTX9KCQSiM0x1g.jpg",
streamUrl: "https://archive.org/download/nw_S02/E09_the_satan_pit.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E09_the_satan_pit.srt"
},
{
title: "Love & Monsters",
season: 2,
episode: 10,
released: new Date("2006-06-17").toISOString(),
overview: "Elton Pope is an ordinary man intrigued by the world of the Doctor. When he and fellow enthusiasts - L.I.N.D.A. - meet the mysterious Victor Kennedy, their lives will never be the same again.",
thumbnail: "https://image.tmdb.org/t/p/original/jo0IhotBj6n3kmr4INLW55F4dTr.jpg",
streamUrl: "https://archive.org/download/nw_S02/E10_love_and_monsters.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E10_love_and_monsters.srt"
},
{
title: "Fear Her",
season: 2,
episode: 11,
released: new Date("2006-06-24").toISOString(),
overview: "When children vanish into thin air in 2012 London, the Doctor and Rose find the answers in a seemingly ordinary household and a girl whose drawings can come to life.",
thumbnail: "https://image.tmdb.org/t/p/original/pOWtOs33vsiqYOukTeh32YMjw35.jpg",
streamUrl: "https://archive.org/download/nw_S02/E11_fear_her.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E11_fear_her.srt"
},
{
title: "Army of Ghosts",
season: 2,
episode: 12,
released: new Date("2006-07-01").toISOString(),
overview: "When ghosts of loved ones appear all over the world the Doctor traces the phenomena to the Torchwood Tower, where some old friends and enemies are waiting.",
thumbnail: "https://image.tmdb.org/t/p/original/5ubiebZlBAccSwjRZvRi4eBPBci.jpg",
streamUrl: "https://archive.org/download/nw_S02/E12_army_of_ghosts.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E12_army_of_ghosts.srt"
},
{
title: "Doomsday",
season: 2,
episode: 13,
released: new Date("2006-07-08").toISOString(),
overview: "Earth becomes a battleground for the Daleks and the Cybermen. With the whole planet at stake and the Genesis Ark activated, how much will the Doctor sacrifice in order to end the war?",
thumbnail: "https://image.tmdb.org/t/p/original/pZse5FWgPEbd8vaG28CNz7Ps1Wt.jpg",
streamUrl: "https://archive.org/download/nw_S02/E13_doomsday.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E13_doomsday.srt"
},
{
title: "The Runaway Bride (Special)",
season: 2,
episode: 14,
released: new Date("2006-12-25").toISOString(),
overview: "The Doctor is baffled when a young woman is transported to the TARDIS on her wedding day, and attempts to find out how she is connected to an alien plot to destroy Earth.",
thumbnail: "https://image.tmdb.org/t/p/original/pncNamTuydXWinybPuMTsBUVjSD.jpg",
streamUrl: "https://archive.org/download/nw_S02/E14_the_runaway_bride_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S02/E14_the_runaway_bride_special.srt"
},
{
title: "Smith and Jones",
season: 3,
episode: 1,
released: new Date("2007-03-31").toISOString(),
overview: "When medical student Martha Jones meets a mysterious stranger called The Doctor, and finds herself transported to the moon, her life will never be the same again.",
thumbnail: "https://image.tmdb.org/t/p/original/r2cXxVQ7nLLylDlvanyIkSUW3F5.jpg",
streamUrl: "https://archive.org/download/nw_S03/E01_smith_and_jones.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E01_smith_and_jones.srt"
},
{
title: "The Shakespeare Code",
season: 3,
episode: 2,
released: new Date("2007-04-07").toISOString(),
overview: "The Doctor takes Martha to London in 1599, where William Shakespeare's new play is being used by three witches in an evil plan.",
thumbnail: "https://image.tmdb.org/t/p/original/hOJizRUmqpWGCDMmuFCNQXex1VG.jpg",
streamUrl: "https://archive.org/download/nw_S03/E02_the_shakespeare_code.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E02_the_shakespeare_code.srt"
},
{
title: "Gridlock",
season: 3,
episode: 3,
released: new Date("2007-04-14").toISOString(),
overview: "The Doctor takes Martha to New Earth, where she is kidnapped by two carjackers and taken to an underground Motorway, where the remainder of humanity on the planet live in perpetual gridlock.",
thumbnail: "https://image.tmdb.org/t/p/original/ja8oZQszacBLr7sc1uceRIsPb49.jpg",
streamUrl: "https://archive.org/download/nw_S03/E03_gridlock.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E03_gridlock.srt"
},
{
title: "Daleks in Manhattan",
season: 3,
episode: 4,
released: new Date("2007-04-21").toISOString(),
overview: "The Doctor and Martha travel to New York in 1930, where people have been mysteriously vanishing from the streets, and an old enemy resurfaces.",
thumbnail: "https://image.tmdb.org/t/p/original/znkbliCaHh5giVBmQLe47vJDVuS.jpg",
streamUrl: "https://archive.org/download/nw_S03/E04_daleks_in_manhattan.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E04_daleks_in_manhattan.srt"
},
{
title: "Evolution of the Daleks",
season: 3,
episode: 5,
released: new Date("2007-04-28").toISOString(),
overview: "Concluding part to Daleks in Manhattan. In 1930s New York, the Daleks' plan is in full force. Faced with the cyborgs' most evil and dangerous scheme yet, will the Doctor and Martha be able to defeat their greatest opponents?",
thumbnail: "https://image.tmdb.org/t/p/original/cPTcmOlSep64XXsXv9YdcbLxIhb.jpg",
streamUrl: "https://archive.org/download/nw_S03/E05_evolution_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E05_evolution_of_the_daleks.srt"
},
{
title: "The Infinite Quest (Animated Series)",
season: 3,
episode: 6,
released: new Date("2007-04-29").toISOString(),
overview: "The Tenth Doctor and Martha Jones travel to the year 40,000 and beyond to search for the location of the legendary lost spaceship, the Infinite, which is said to be able to grant anyone their heart's desire.",
thumbnail: "https://image.tmdb.org/t/p/original/zFbsa27Y23XOf4b21jZfmTr9gJd.jpg",
streamUrl: "https://archive.org/download/nw_S03/E06_the_infinite_quest_animated_series.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E06_the_infinite_quest_animated_series.srt"
},
{
title: "The Lazarus Experiment",
season: 3,
episode: 7,
released: new Date("2007-05-05").toISOString(),
overview: "The famous Dr. Lazarus has appeared to discover the secret of eternal youth - but do his experiments hide a sinister secret?",
thumbnail: "https://image.tmdb.org/t/p/original/wlxx4LJqwOs5H4Vb14Ixrog7u9l.jpg",
streamUrl: "https://archive.org/download/nw_S03/E07_the_lazarus_experiment.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E07_the_lazarus_experiment.srt"
},
{
title: "42",
season: 3,
episode: 8,
released: new Date("2007-05-19").toISOString(),
overview: "On a spaceship headed straight for the centre of the sun, the Doctor only has 42 minutes to save Martha and the ship's crew from an inevitable doom.",
thumbnail: "https://image.tmdb.org/t/p/original/7gU2gL2eMzsMfDzLWxx1K5RktiB.jpg",
streamUrl: "https://archive.org/download/nw_S03/E08_42.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E08_42.srt"
},
{
title: "Human Nature",
season: 3,
episode: 9,
released: new Date("2007-05-26").toISOString(),
overview: "In 1913, Martha watches in jealousy from afar as The Doctor learns what it is to be human and to fall in love with the local school nurse, Joan Redfern.",
thumbnail: "https://image.tmdb.org/t/p/original/uU0CrIONDzbW6sG4pD6OZZ4AwtY.jpg",
streamUrl: "https://archive.org/download/nw_S03/E09_human_nature.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E09_human_nature.srt"
},
{
title: "The Family of Blood",
season: 3,
episode: 10,
released: new Date("2007-06-02").toISOString(),
overview: "The Doctor must deal with the repercussions of his decision to become human, as The Family Of Blood unveil themselves...",
thumbnail: "https://image.tmdb.org/t/p/original/yd4ZXt6HpZw9ecancFH6aLk6331.jpg",
streamUrl: "https://archive.org/download/nw_S03/E10_the_family_of_blood.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E10_the_family_of_blood.srt"
},
{
title: "Blink",
season: 3,
episode: 11,
released: new Date("2007-06-09").toISOString(),
overview: "Sally Sparrow receives a cryptic message from the Doctor about a mysterious new enemy species that is after the TARDIS.",
thumbnail: "https://image.tmdb.org/t/p/original/mK9xscWBukA6BR5mDQkO9pRfkEA.jpg",
streamUrl: "https://archive.org/download/nw_S03/E11_blink.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E11_blink.srt"
},
{
title: "Utopia",
season: 3,
episode: 12,
released: new Date("2007-06-16").toISOString(),
overview: "Soon after bumping into old friend Jack Harkness, Martha and The Doctor head off to Malcassairo, a distant planet where an old professor will do anything he can to keep his people alive...",
thumbnail: "https://image.tmdb.org/t/p/original/tJ1yrD2HeSJg24FEhb5Zdhai5gc.jpg",
streamUrl: "https://archive.org/download/nw_S03/E12_utopia.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E12_utopia.srt"
},
{
title: "The Sound of Drums",
season: 3,
episode: 13,
released: new Date("2007-06-23").toISOString(),
overview: "The Doctor, Martha and Jack return to the 21st Century eighteen months after the Doctor and Martha left. They find they've missed the election, and the new Prime Minister, Harold Saxon, is someone they've met before by another name.",
thumbnail: "https://image.tmdb.org/t/p/original/2TbVwbEAFVjvDdVjnJfF2bvjnzw.jpg",
streamUrl: "https://archive.org/download/nw_S03/E13_the_sound_of_drums.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E13_the_sound_of_drums.srt"
},
{
title: "Last of the Time Lords",
season: 3,
episode: 14,
released: new Date("2007-06-30").toISOString(),
overview: "It's been a year since The Master unleashed the mysterious Toclafane onto Earth. With the human race and The Doctor enslaved under The Master's control, Martha Jones is the only person that can help stop the evil Time Lord.",
thumbnail: "https://image.tmdb.org/t/p/original/5JrFqtQezODClpZWGHPZlMYaTMH.jpg",
streamUrl: "https://archive.org/download/nw_S03/E14_last_of_the_time_lords.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E14_last_of_the_time_lords.srt"
},
{
title: "Time Crash (Minisode)",
season: 3,
episode: 15,
released: new Date("2007-11-16").toISOString(),
overview: "After Martha says goodbye to the Doctor and leaves, he is surprised to find a problem with the TARDIS. Suddenly, a man materializes - the Fifth Doctor. But why's he here, and what's happened to the TARDIS?",
thumbnail: "https://image.tmdb.org/t/p/original/HXffnggUHSN6es73AI8pZSj9SL.jpg",
streamUrl: "https://archive.org/download/nw_S03/E15_time_crash_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E15_time_crash_minisode.srt"
},
{
title: "Voyage of the Damned (Special)",
season: 3,
episode: 16,
released: new Date("2007-12-25").toISOString(),
overview: "At the end of Last of the Time Lords, a ship crashes through the side of the TARDIS, mid flight, and a life ring bearing the name 'Titanic' is thrown towards the Doctor - what on Earth is going on?",
thumbnail: "https://image.tmdb.org/t/p/original/yzs1Y9vnaTHyBn7qDBPCEUZP2eC.jpg",
streamUrl: "https://archive.org/download/nw_S03/E16_voyage_of_the_damned_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S03/E16_voyage_of_the_damned_special.srt"
},
{
title: "Partners in Crime",
season: 4,
episode: 1,
released: new Date("2008-04-05").toISOString(),
overview: "With a new weight-loss pill tested in London by Adipose Industries, The Doctor goes to investigate the sinister truth behind the product, only to find out that his old friend Donna Noble is investigating as well.",
thumbnail: "https://image.tmdb.org/t/p/original/vg5oP1tOzivl4EV7iHiEaKwiZkK.jpg",
streamUrl: "https://archive.org/download/nw_S04/E01_partners_in_crime.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E01_partners_in_crime.srt"
},
{
title: "The Fires of Pompeii",
season: 4,
episode: 2,
released: new Date("2008-04-12").toISOString(),
overview: "Instead of Rome, The Doctor and Donna Noble end up visiting Pompeii in AD 79, on the eve of the catastrophic eruption of Mount Vesuvius. Before anyone even knew it was actually a volcano, the entire city is doomed for destruction.",
thumbnail: "https://image.tmdb.org/t/p/original/nrZJF4qxVDMCKRmZnkWzmJ3rLtq.jpg",
streamUrl: "https://archive.org/download/nw_S04/E02_the_fires_of_pompeii.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E02_the_fires_of_pompeii.srt"
},
{
title: "Planet of the Ood",
season: 4,
episode: 3,
released: new Date("2008-04-19").toISOString(),
overview: "Finding themselves on the Ood-Sphere planet in the 42nd century, The Doctor and Donna discover the truth over the Ood's willingness to serve humankind.",
thumbnail: "https://image.tmdb.org/t/p/original/pqzflnCz2QgRC2lUSfCSTofsZJ1.jpg",
streamUrl: "https://archive.org/download/nw_S04/E03_planet_of_the_ood.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E03_planet_of_the_ood.srt"
},
{
title: "The Sontaran Stratagem",
season: 4,
episode: 4,
released: new Date("2008-04-26").toISOString(),
overview: "UNIT's newest recruit Martha Jones enlists The Doctor's help to investigate kid genius Luke Rattigan and his ATMOS system that is used in every car on Earth.",
thumbnail: "https://image.tmdb.org/t/p/original/ikA0PwE1keiDTYm1q9PE23jLE0D.jpg",
streamUrl: "https://archive.org/download/nw_S04/E04_the_sontaran_stratagem.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E04_the_sontaran_stratagem.srt"
},
{
title: "The Poison Sky",
season: 4,
episode: 5,
released: new Date("2008-05-03").toISOString(),
overview: "With planet Earth choking under the poison sky, the Doctor must stop the Sontarans' threat to the planet.",
thumbnail: "https://image.tmdb.org/t/p/original/5jUKUpdArNgeB18AAOcHVsjL3Lo.jpg",
streamUrl: "https://archive.org/download/nw_S04/E05_the_poison_sky.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E05_the_poison_sky.srt"
},
{
title: "The Doctor's Daughter",
season: 4,
episode: 6,
released: new Date("2008-05-10").toISOString(),
overview: "Caught in the middle of a war between the Humans and the Hath in the planet Messaline, the Doctor finds himself once again a father.",
thumbnail: "https://image.tmdb.org/t/p/original/dMBjdLeXfNT8ndkswKiBGHKmvQr.jpg",
streamUrl: "https://archive.org/download/nw_S04/E06_the_doctors_daughter.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E06_the_doctors_daughter.srt"
},
{
title: "The Unicorn and the Wasp",
season: 4,
episode: 7,
released: new Date("2008-05-17").toISOString(),
overview: "With a 1926 dinner party turning into a murder mystery, The Doctor and Donna Noble get the chance to meet Agatha Christie on the eve of her well-known 9-days disappearance.",
thumbnail: "https://image.tmdb.org/t/p/original/aJoZuFI7uZolIkYguRTkcdVijO.jpg",
streamUrl: "https://archive.org/download/nw_S04/E07_the_unicorn_and_the_wasp.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E07_the_unicorn_and_the_wasp.srt"
},
{
title: "Silence in the Library",
season: 4,
episode: 8,
released: new Date("2008-05-31").toISOString(),
overview: "The Doctor and Donna visit a planet-sized library but soon realise that the planet is devoid of life, that is until River Song and her team of archaeologists arrive. As they unravel the library's mystery, something lurks in the shadows.",
thumbnail: "https://image.tmdb.org/t/p/original/goMXMW2uH0EqdSBP9BjGgm6OwEI.jpg",
streamUrl: "https://archive.org/download/nw_S04/E08_silence_in_the_library.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E08_silence_in_the_library.srt"
},
{
title: "Forest of the Dead",
season: 4,
episode: 9,
released: new Date("2008-06-07").toISOString(),
overview: "With the library darkening, the Doctor takes on the Vashta Nerada while figuring out what links River Song to his future. Meanwhile, Donna finds out the mystery of Dr. Moon and the Girl.",
thumbnail: "https://image.tmdb.org/t/p/original/xAW7SCNkOsfyCLFZiGmeanSaR8L.jpg",
streamUrl: "https://archive.org/download/nw_S04/E09_forest_of_the_dead.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E09_forest_of_the_dead.srt"
},
{
title: "Midnight",
season: 4,
episode: 10,
released: new Date("2008-06-14").toISOString(),
overview: "As part of a well-deserved holiday, the Doctor takes a tour on a planet called Midnight. Little does he know that something is knocking on the walls, although the planet shouldn't be inhabited. Soon the passengers begin to panic when one of them is possessed.",
thumbnail: "https://image.tmdb.org/t/p/original/p0HnYnHVhjogyqxq3sSpamTWvIV.jpg",
streamUrl: "https://archive.org/download/nw_S04/E10_midnight.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E10_midnight.srt"
},
{
title: "Turn Left",
season: 4,
episode: 11,
released: new Date("2008-06-21").toISOString(),
overview: "What would happen if Donna never met the Doctor? How would Earth handle the Racnoss, the falling Titanic or the Sontarans? Aided by a familiar blonde time traveler, Donna corrects the alternate time line from happening.",
thumbnail: "https://image.tmdb.org/t/p/original/etMTaIloNsHhSqDkqV66tLnJ8Z0.jpg",
streamUrl: "https://archive.org/download/nw_S04/E11_turn_left.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E11_turn_left.srt"
},
{
title: "The Stolen Earth",
season: 4,
episode: 12,
released: new Date("2008-06-28").toISOString(),
overview: "The return of an old enemy leaves Earth along with 26 other planets stolen from their places. As the Doctor and Donna look for the whereabouts of Earth, former companions of the Doctor assemble a resistance against the new Dalek Empire.",
thumbnail: "https://image.tmdb.org/t/p/original/6Ze69Ber1dxZfWuKNgGspRAqIqi.jpg",
streamUrl: "https://archive.org/download/nw_S04/E12_the_stolen_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E12_the_stolen_earth.srt"
},
{
title: "Journey's End",
season: 4,
episode: 13,
released: new Date("2008-07-05").toISOString(),
overview: "In the wake of Davros' threat to destroy the existence of the Universe itself, the Doctor's companions unite to stop the Dalek empire. Which one will die by the prophecies and what will the fate be for the Doctor?",
thumbnail: "https://image.tmdb.org/t/p/original/iuiuzCpeGRu5fqZmpS5160cQugn.jpg",
streamUrl: "https://archive.org/download/nw_S04/E13_journeys_end.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E13_journeys_end.srt"
},
{
title: "Music of the Spheres (Minisode)",
season: 4,
episode: 14,
released: new Date("2008-07-27").toISOString(),
overview: "The Doctor composes his 'Ode to the Universe' with help from a Graske, while the Royal Albert Hall watches at the Doctor Who Proms.",
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S04/E14_music_of_the_spheres_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E14_music_of_the_spheres_minisode.srt"
},
{
title: "The Next Doctor (Special)",
season: 4,
episode: 15,
released: new Date("2008-12-25").toISOString(),
overview: "The Doctor arrives in Victorian London, it's Christmas, but the snow isn't the only thing descending on the tranquil and jubilant civilization...familiar silver giants of an alternate reality are amassing in numbers, The Cybermen are on the move again, and the only beings who can stop them are The Doctor...and another Doctor?",
thumbnail: "https://image.tmdb.org/t/p/original/m6EIT4iTzImPpP7HDypwW6HmTSX.jpg",
streamUrl: "https://archive.org/download/nw_S04/E15_the_next_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E15_the_next_doctor_special.srt"
},
{
title: "Planet of the Dead (Special)",
season: 4,
episode: 16,
released: new Date("2009-04-11").toISOString(),
overview: "The Doctor, along with the lady Christina de Souza and other passengers, finds himself transported to a barren desert planet on a double-decker bus. As the Doctor and Christina struggle to uncover the mysteries beneath the sand, the Swarm draws closer.",
thumbnail: "https://image.tmdb.org/t/p/original/5sc0HjGmml9Ib0uaq8nEbdH5Q8T.jpg",
streamUrl: "https://archive.org/download/nw_S04/E16_planet_of_the_dead_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E16_planet_of_the_dead_special.srt"
},
{
title: "The Waters of Mars (Special)",
season: 4,
episode: 17,
released: new Date("2009-11-15").toISOString(),
overview: "The Doctor joins forces with his oldest companion on record when a military base comes under attack from sentient, dangerous waters. It may be another stand against immeasurable odds, but waiting in the wings for the Time Lord is a sign all songs must end...",
thumbnail: "https://image.tmdb.org/t/p/original/wcpu0YIQAOJMypbvdyYc26eD2RR.jpg",
streamUrl: "https://archive.org/download/nw_S04/E17_the_waters_of_mars_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E17_the_waters_of_mars_special.srt"
},
{
title: "Dreamland (Animated Series)",
season: 4,
episode: 18,
released: new Date("2009-11-21").toISOString(),
overview: "The Doctor and his new companions, Cassie and Jimmy, get mixed up in an alien adventure in the Nevada desert.",
thumbnail: "https://image.tmdb.org/t/p/original/1M0AFqD1G1gD7LJRWeC7w2Agf4S.jpg",
streamUrl: "https://archive.org/download/nw_S04/E18_dreamland_animated_series.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E18_dreamland_animated_series.srt"
},
{
title: "The End of Time, Part One (Special)",
season: 4,
episode: 19,
released: new Date("2009-12-25").toISOString(),
overview: "Facing his mortality, the Doctor returns to Earth find the planet's population haunted by horrific nightmares all their own. Reuniting with Wilf, The Doctor investigates a lingering mystery that threatens to unravel the planet as an old enemy prepares to be reborn.",
thumbnail: "https://image.tmdb.org/t/p/original/o5tkuzwWEcvYNh4byTcoo9K3EE2.jpg",
streamUrl: "https://archive.org/download/nw_S04/E19_the_end_of_time_part_one_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E19_the_end_of_time_part_one_special.srt"
},
{
title: "The End of Time, Part Two (Special)",
season: 4,
episode: 20,
released: new Date("2010-01-01").toISOString(),
overview: "Dark forces amass at The Gate. Only The Doctor stands between the age of order and the time of chaos... only one song remains to be sung...",
thumbnail: "https://image.tmdb.org/t/p/original/viB7vbRk2SrM60bZ76IIJOu7DCC.jpg",
streamUrl: "https://archive.org/download/nw_S04/E20_the_end_of_time_part_two_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S04/E20_the_end_of_time_part_two_special.srt"
},
{
title: "The Eleventh Hour",
season: 5,
episode: 1,
released: new Date("2010-04-03").toISOString(),
overview: "With his TARDIS in ruins, the newly-regenerated Doctor with the help of Amy Pond must save the world in less than twenty minutes from galactic policemen known as the Atraxi.",
thumbnail: "https://image.tmdb.org/t/p/original/i10v5tkFxq7z6HNVLCHZSctM1hk.jpg",
streamUrl: "https://archive.org/download/nw_S05/E01_the_eleventh_hour.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E01_the_eleventh_hour.srt"
},
{
title: "Meanwhile in the TARDIS, Part 1 (Minisode)",
season: 5,
episode: 2,
released: new Date("2010-04-04").toISOString(),
overview: "On her first trip in the TARDIS, Amy questions the Eleventh Doctor on how the time machine works, why it takes the shape of a police box, and whether he is an alien. The Doctor answers most of her questions, and then opens the TARDIS doors to reveal that they are in deep space.",
thumbnail: "https://image.tmdb.org/t/p/original/euFA6x9pBFDZbSV9d2eavpxyBtv.jpg",
streamUrl: "https://archive.org/download/nw_S05/E02_meanwhile_in_the_tardis_1_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E02_meanwhile_in_the_tardis_1_minisode.srt"
},
{
title: "The Beast Below",
season: 5,
episode: 3,
released: new Date("2010-04-10").toISOString(),
overview: "The Doctor takes Amy to the future inside Starship UK, which contains in addition to British explorers, an intimidating race known as the Smilers.",
thumbnail: "https://image.tmdb.org/t/p/original/7kB96G2gZ9wxUYLwoasxA0AaJj3.jpg",
streamUrl: "https://archive.org/download/nw_S05/E03_the_beast_below.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E03_the_beast_below.srt"
},
{
title: "Victory of the Daleks",
season: 5,
episode: 4,
released: new Date("2010-04-17").toISOString(),
overview: "The TARDIS takes The Doctor and Amy to war-torn Britain in the middle of World War Two. Not only do they meet Winston Churchill himself, but the Doctor comes face to face once again with his greatest enemy of all.",
thumbnail: "https://image.tmdb.org/t/p/original/x6jFAcTq6Wgu8RTNzNfBEUCrpTb.jpg",
streamUrl: "https://archive.org/download/nw_S05/E04_victory_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E04_victory_of_the_daleks.srt"
},
{
title: "The Time of Angels",
season: 5,
episode: 5,
released: new Date("2010-04-24").toISOString(),
overview: "The Doctor and Amy emerge from the TARDIS to find the wreck of the Byzantium spaceship. Down below the Weeping Angels are stirring, but the Doctor has someone else to contend with; none other than the mysterious Professor River Song.",
thumbnail: "https://image.tmdb.org/t/p/original/fIfqHand7jXwdUUk4N0BRs8WgG2.jpg",
streamUrl: "https://archive.org/download/nw_S05/E05_the_time_of_angels.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E05_the_time_of_angels.srt"
},
{
title: "Flesh and Stone",
season: 5,
episode: 6,
released: new Date("2010-05-01").toISOString(),
overview: "The Doctor, Amy, Dr. Song and the remaining soldiers manage to escape from the crashed ship and into the forest. The Angels attempt to create a rift in time and space such as the Doctor had found in Amy's room when they first met. Amy meanwhile is counting down from 10 minutes and the Doctor has determined that an Angel has taken over her mind.",
thumbnail: "https://image.tmdb.org/t/p/original/yeBBoeNrlhDZK4TPIq4bUX3jiFV.jpg",
streamUrl: "https://archive.org/download/nw_S05/E06_flesh_and_stone.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E06_flesh_and_stone.srt"
},
{
title: "Meanwhile in the TARDIS, Part 2 (Minisode)",
season: 5,
episode: 7,
released: new Date("2010-05-02").toISOString(),
overview: "As Amy continues her attempts to seduce him, the Doctor explains to her the true reason why he travels with a companion. She tricks him into asking the TARDIS to display visual records of previous inhabitants, before he decides to go find Rory at his bachelor party.",
thumbnail: "https://image.tmdb.org/t/p/original/1peMnZ8ib8853y8XB0ZXI6dbOEL.jpg",
streamUrl: "https://archive.org/download/nw_S05/E07_meanwhile_in_the_tardis_2_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E07_meanwhile_in_the_tardis_2_minisode.srt"
},
{
title: "The Vampires of Venice",
season: 5,
episode: 8,
released: new Date("2010-05-08").toISOString(),
overview: "The Doctor and Amy cross swords in more ways than one with a horde of blood-sucking vampires in 16th century Venice.",
thumbnail: "https://image.tmdb.org/t/p/original/c85zdg2EDQXqU7hHYx8tvd8FQrm.jpg",
streamUrl: "https://archive.org/download/nw_S05/E08_the_vampires_of_venice.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E08_the_vampires_of_venice.srt"
},
{
title: "Amy's Choice",
season: 5,
episode: 9,
released: new Date("2010-05-15").toISOString(),
overview: "Five years after finally leaving the TARDIS, Amy and Rory, now married, live in the quiet little village of Leadworth; but everything is not what it would seem.",
thumbnail: "https://image.tmdb.org/t/p/original/8J8U9jOAW054WtvHEGyFeNWMnzQ.jpg",
streamUrl: "https://archive.org/download/nw_S05/E09_amys_choice.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E09_amys_choice.srt"
},
{
title: "The Hungry Earth",
season: 5,
episode: 10,
released: new Date("2010-05-22").toISOString(),
overview: "When a drill drills too deep into the earth, something that had been hibernating beneath the earth's crust is woken, and it's hungry for revenge.",
thumbnail: "https://image.tmdb.org/t/p/original/wcvSONOaifsZjUVlXKitNWcMHvD.jpg",
streamUrl: "https://archive.org/download/nw_S05/E10_the_hungry_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E10_the_hungry_earth.srt"
},
{
title: "Cold Blood",
season: 5,
episode: 11,
released: new Date("2010-05-29").toISOString(),
overview: "The Silurians are awake, angry, and preparing for war - a war that could decide who gets to live on Earth, the Silurians or the humans.",
thumbnail: "https://image.tmdb.org/t/p/original/kpjhRYkFJIV90yqrwCWGk8ALhdb.jpg",
streamUrl: "https://archive.org/download/nw_S05/E11_cold_blood.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E11_cold_blood.srt"
},
{
title: "Good as Gold (Minisode)",
season: 5,
episode: 12,
released: new Date("2010-05-30").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S05/E12_good_as_gold_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E12_good_as_gold_minisode.srt"
},
{
title: "Vincent and the Doctor",
season: 5,
episode: 13,
released: new Date("2010-06-05").toISOString(),
overview: "The Doctor and Amy travel back in time to meet Vincent Van Gogh and face an invisible monster that only the painter can see.",
thumbnail: "https://image.tmdb.org/t/p/original/bSXtkTYVizAlcbNGRHBCj8rznCJ.jpg",
streamUrl: "https://archive.org/download/nw_S05/E13_vincent_and_the_doctor.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E13_vincent_and_the_doctor.srt"
},
{
title: "The Lodger",
season: 5,
episode: 14,
released: new Date("2010-06-12").toISOString(),
overview: "After the TARDIS teleports without him, the Doctor tries to find out what is stopping it from landing and traces it to a seemingly ordinary, two storey house.",
thumbnail: "https://image.tmdb.org/t/p/original/5PPPjAeEiyHhKeskn52IOxRrxHl.jpg",
streamUrl: "https://archive.org/download/nw_S05/E14_the_lodger.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E14_the_lodger.srt"
},
{
title: "The Pandorica Opens",
season: 5,
episode: 15,
released: new Date("2010-06-19").toISOString(),
overview: "River Song returns to deliver The Doctor a serious warning from his allies: the mythical Pandorica, said to contain the most feared creature in the entire Universe, is opening.",
thumbnail: "https://image.tmdb.org/t/p/original/de5ARsQIVy2i3oRYvgTPnZDi770.jpg",
streamUrl: "https://archive.org/download/nw_S05/E15_the_pandorica_opens.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E15_the_pandorica_opens.srt"
},
{
title: "The Big Bang",
season: 5,
episode: 16,
released: new Date("2010-06-26").toISOString(),
overview: "The Pandorica opened, silence fell, and now planet Earth is left alone in the universe. Jumping through time, the Doctor must figure out a way to bring back those who never were and save his friends from the collapse of reality.",
thumbnail: "https://image.tmdb.org/t/p/original/nHm40KTSn9UUuOmK2eS1m9Oxmxj.jpg",
streamUrl: "https://archive.org/download/nw_S05/E16_the_big_bang.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E16_the_big_bang.srt"
},
{
title: "Death is the Only Answer (Minisode)",
season: 5,
episode: 17,
released: new Date("2010-06-27").toISOString(),
overview: "In the console room of his TARDIS, the Eleventh Doctor is celebrating his acquisition of a new fez formerly owned by his old friend Albert Einstein.",
thumbnail: "https://image.tmdb.org/t/p/original/h0TSvJAdlaDZZUydMqFkX3s8DZ8.jpg",
streamUrl: "https://archive.org/download/nw_S05/E17_death_is_the_only_answer_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E17_death_is_the_only_answer_minisode.srt"
},
{
title: "A Christmas Carol (Special)",
season: 5,
episode: 18,
released: new Date("2010-12-25").toISOString(),
overview: "Amy and Rory are trapped on a crashing space liner, and the only way The Doctor can rescue them is to save the soul of a lonely old miser. But is Kazran Sardick, the richest man in Sardicktown, beyond redemption? And what is lurking in the fogs of Christmas Eve?",
thumbnail: "https://image.tmdb.org/t/p/original/k1FJjxr2PIJNo4iJtlpmOzjLTF6.jpg",
streamUrl: "https://archive.org/download/nw_S05/E18_a_christmas_carol_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S05/E18_a_christmas_carol_special.srt"
},
{
title: "Space (Minisode)",
season: 6,
episode: 1,
released: new Date("2011-03-18").toISOString(),
overview: "The Doctor, Amy, and Rory experience a TARDIS-within-a-TARDIS malfunction, leading to some confusing encounters with future versions of Amy.",
thumbnail: "https://image.tmdb.org/t/p/original/eU9pfAxEBNijiBMQTAp9i8LMG5L.jpg",
streamUrl: "https://archive.org/download/nw_S06/E01_space_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E01_space_minisode.srt"
},
{
title: "Time (Minisode)",
season: 6,
episode: 2,
released: new Date("2011-03-18").toISOString(),
overview: "Continuing from 'Space,' the TARDIS crew, with two Amys, tries to resolve their paradoxical predicament before the TARDIS materializes.",
thumbnail: "https://image.tmdb.org/t/p/original/vNetCiuG7wobE57AKraEWVlyRLp.jpg",
streamUrl: "https://archive.org/download/nw_S06/E02_time_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E02_time_minisode.srt"
},
{
title: "The Impossible Astronaut (Prequel)",
season: 6,
episode: 3,
released: new Date("2011-03-22").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E03_the_impossible_astronaut_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E03_the_impossible_astronaut_prequel.srt"
},
{
title: "The Impossible Astronaut",
season: 6,
episode: 4,
released: new Date("2011-04-23").toISOString(),
overview: "The Doctor, Amy, Rory and River Song are reunited in the Utah desert.",
thumbnail: "https://image.tmdb.org/t/p/original/hYex2T50TttotieYNorzrlRQrL3.jpg",
streamUrl: "https://archive.org/download/nw_S06/E04_the_impossible_astronaut.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E04_the_impossible_astronaut.srt"
},
{
title: "Day of the Moon",
season: 6,
episode: 5,
released: new Date("2011-04-30").toISOString(),
overview: "The Doctor and his allies mount a rebellion against invaders who have been controlling humanity from the very beginning.",
thumbnail: "https://image.tmdb.org/t/p/original/vPfOZxw5OLYgVIT92v16IyuLOq3.jpg",
streamUrl: "https://archive.org/download/nw_S06/E05_day_of_the_moon.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E05_day_of_the_moon.srt"
},
{
title: "The Curse of the Black Spot (Prequel)",
season: 6,
episode: 6,
released: new Date("2011-04-30").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E06_the_curse_of_the_black_spot_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E06_the_curse_of_the_black_spot_prequel.srt"
},
{
title: "The Curse of the Black Spot",
season: 6,
episode: 7,
released: new Date("2011-05-07").toISOString(),
overview: "The Doctor, Amy and Rory find themselves aboard a marooned pirate ship whose crew is being picked off one by one by a beautiful - and deadly - Siren.",
thumbnail: "https://image.tmdb.org/t/p/original/Agcd2TyROXIDmmij77l1lLtpQdN.jpg",
streamUrl: "https://archive.org/download/nw_S06/E07_the_curse_of_the_black_spot.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E07_the_curse_of_the_black_spot.srt"
},
{
title: "Bad Night (Minisode)",
season: 6,
episode: 8,
released: new Date("2011-05-08").toISOString(),
overview: "Amy wakes to answer the TARDIS phone, only to discover the Doctor desperate to deal with British royalty, a goldfish and a housefly.",
thumbnail: "https://image.tmdb.org/t/p/original/fAeKlGXm63LYq3tBijlJMTD2C6h.jpg",
streamUrl: "https://archive.org/download/nw_S06/E08_bad_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E08_bad_night_minisode.srt"
},
{
title: "The Doctor's Wife",
season: 6,
episode: 9,
released: new Date("2011-05-14").toISOString(),
overview: "The Doctor is lured to a sentient asteroid outside of the Universe by a Time Lord distress signal and soon realises his TARDIS is in grave danger.",
thumbnail: "https://image.tmdb.org/t/p/original/7DlFKjNYfuEl6CBcPTHcHR6BK0d.jpg",
streamUrl: "https://archive.org/download/nw_S06/E09_the_doctors_wife.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E09_the_doctors_wife.srt"
},
{
title: "Good Night (Minisode)",
season: 6,
episode: 10,
released: new Date("2011-05-15").toISOString(),
overview: "Amy finally gets to ask the Doctor the question that has been plaguing her since 'Space': how can she remember two distinct histories of her life? The Doctor answers her question by giving her a chance to do a good deed for herself when she was a child.",
thumbnail: "https://image.tmdb.org/t/p/original/4U4WKC2r8BU2NkXs9ZbAlt0K4vU.jpg",
streamUrl: "https://archive.org/download/nw_S06/E10_good_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E10_good_night_minisode.srt"
},
{
title: "The Rebel Flesh",
season: 6,
episode: 11,
released: new Date("2011-05-21").toISOString(),
overview: "A solar tsunami sends the TARDIS crew to an acid mining factory in the 22nd century, where a small team of workers come under attack from their doppelgangers.",
thumbnail: "https://image.tmdb.org/t/p/original/2nSKMC4B6Rkg3ilTiQbwDGZfBfv.jpg",
streamUrl: "https://archive.org/download/nw_S06/E11_the_rebel_flesh.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E11_the_rebel_flesh.srt"
},
{
title: "The Almost People",
season: 6,
episode: 12,
released: new Date("2011-05-28").toISOString(),
overview: "The gangers and humans battle for their lives as the factory crumbles and the Doctor tries to keep the peace - can everyone make it off the island alive?",
thumbnail: "https://image.tmdb.org/t/p/original/k0hqRfoowt20O26gQB1vYfVfa9j.jpg",
streamUrl: "https://archive.org/download/nw_S06/E12_the_almost_people.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E12_the_almost_people.srt"
},
{
title: "A Good Man Goes to War (Prequel)",
season: 6,
episode: 13,
released: new Date("2011-05-28").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E13_a_good_man_goes_to_war_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E13_a_good_man_goes_to_war_prequel.srt"
},
{
title: "A Good Man Goes to War",
season: 6,
episode: 14,
released: new Date("2011-06-04").toISOString(),
overview: "A member of The Doctor's team has been abducted and he will call in every favor and maybe even go to war to get them back.",
thumbnail: "https://image.tmdb.org/t/p/original/2837C8AsNebgsf9dXXTu7EBvVK2.jpg",
streamUrl: "https://archive.org/download/nw_S06/E14_a_good_man_goes_to_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E14_a_good_man_goes_to_war.srt"
},
{
title: "Let's Kill Hitler (Prequel)",
season: 6,
episode: 15,
released: new Date("2011-08-15").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E15_lets_kill_hitler_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E15_lets_kill_hitler_prequel.srt"
},
{
title: "Let's Kill Hitler",
season: 6,
episode: 16,
released: new Date("2011-08-27").toISOString(),
overview: "The search for Melody Pond brings the Doctor and his friends to Berlin in 1938, face-to-face with Adolf Hitler, River Song and a justice-serving, shapeshifting robot.",
thumbnail: "https://image.tmdb.org/t/p/original/qMKR1UFyW3TYuXW0azoXvDKe6G1.jpg",
streamUrl: "https://archive.org/download/nw_S06/E16_lets_kill_hitler.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E16_lets_kill_hitler.srt"
},
{
title: "Night Terrors",
season: 6,
episode: 17,
released: new Date("2011-09-03").toISOString(),
overview: "Receiving a powerful distress call from a terrified little boy, the Doctor and his friends soon find that the monsters in his cupboard are real - and deadly.",
thumbnail: "https://image.tmdb.org/t/p/original/fIJ21JtFBAIwKN1Hya5LVaBdBM6.jpg",
streamUrl: "https://archive.org/download/nw_S06/E17_night_terrors.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E17_night_terrors.srt"
},
{
title: "First Night (Minisode)",
season: 6,
episode: 18,
released: new Date("2011-09-04").toISOString(),
overview: "The Doctor arrives at Stormcage to pick up River Song on the evening of her imprisonment. It's their first date, but his plans are complicated when a future version of River turns up.",
thumbnail: "https://image.tmdb.org/t/p/original/vaUm6q26fy3loPuPRolFejd9RY8.jpg",
streamUrl: "https://archive.org/download/nw_S06/E18_first_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E18_first_night_minisode.srt"
},
{
title: "Last Night (Minisode)",
season: 6,
episode: 19,
released: new Date("2011-09-04").toISOString(),
overview: "With no fewer than three River Songs from different times roaming the TARDIS, the Doctor has to avoid contaminating the timeline.",
thumbnail: "https://image.tmdb.org/t/p/original/qO3wzIFhi4zgXj23P2FzsYSgjsf.jpg",
streamUrl: "https://archive.org/download/nw_S06/E19_last_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E19_last_night_minisode.srt"
},
{
title: "The Girl Who Waited",
season: 6,
episode: 20,
released: new Date("2011-09-10").toISOString(),
overview: "Amy is trapped in a quarantine facility where time moves faster than in reality, while the Doctor is confined to the TARDIS. Can Rory save his wife in time?",
thumbnail: "https://image.tmdb.org/t/p/original/nvUzNv5iCqYgPLfFAA3YwMXM995.jpg",
streamUrl: "https://archive.org/download/nw_S06/E20_the_girl_who_waited.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E20_the_girl_who_waited.srt"
},
{
title: "The God Complex",
season: 6,
episode: 21,
released: new Date("2011-09-17").toISOString(),
overview: "The Doctor, Amy and Rory become trapped in a hotel of horrors unable to escape and unable to find the TARDIS. The Doctor must save as many people as he can taking many twists and seeing his own worst fear.",
thumbnail: "https://image.tmdb.org/t/p/original/cOALJWa0gjDohwE0zFiTbsASYj7.jpg",
streamUrl: "https://archive.org/download/nw_S06/E21_the_god_complex.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E21_the_god_complex.srt"
},
{
title: "Up All Night (Minisode)",
season: 6,
episode: 22,
released: new Date("2011-09-18").toISOString(),
overview: "Craig, Sophie and Alfie have a brief scene in which Craig discusses his fears of dealing with his son.",
thumbnail: "https://image.tmdb.org/t/p/original/2q4zFUv3mejsbtPu3boymDOLnyG.jpg",
streamUrl: "https://archive.org/download/nw_S06/E22_up_all_night_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E22_up_all_night_minisode.srt"
},
{
title: "Closing Time",
season: 6,
episode: 23,
released: new Date("2011-09-24").toISOString(),
overview: "The Doctor makes one last stop before his death to see an old friend. But people are disappearing, there are reports of a silver rat and metal men are lurking in the shadows.",
thumbnail: "https://image.tmdb.org/t/p/original/1Inq93eyYyNc8un4ohro5GQNUNQ.jpg",
streamUrl: "https://archive.org/download/nw_S06/E23_closing_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E23_closing_time.srt"
},
{
title: "The Wedding of River Song (Prequel)",
season: 6,
episode: 24,
released: new Date("2011-09-24").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E24_the_wedding_of_river_song_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E24_the_wedding_of_river_song_prequel.srt"
},
{
title: "The Wedding of River Song",
season: 6,
episode: 25,
released: new Date("2011-10-01").toISOString(),
overview: "April 22nd, 2011; 5:02pm. Having finally accepted his fate the Doctor travels to Lake Silencio for his final day. But one woman refuses to let time take its course.",
thumbnail: "https://image.tmdb.org/t/p/original/r0IxObRNz5wh9SCGnEF8hBtqoMJ.jpg",
streamUrl: "https://archive.org/download/nw_S06/E25_the_wedding_of_river_song.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E25_the_wedding_of_river_song.srt"
},
{
title: "The Doctor, the Widow and the Wardrobe (Prequel)",
season: 6,
episode: 26,
released: new Date("2011-12-06").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S06/E26_the_doctor_the_widow_and_the_wardrobe_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E26_the_doctor_the_widow_and_the_wardrobe_prequel.srt"
},
{
title: "The Doctor, the Widow and the Wardrobe (Special)",
season: 6,
episode: 27,
released: new Date("2011-12-25").toISOString(),
overview: "On Christmas Eve 1941, the Doctor poses as a caretaker to give recently widowed Madge Arwell and her two children an unforgettable Christmas but things quickly get out of hand when her son Cyril enters a snowy forest world full of dangers.",
thumbnail: "https://image.tmdb.org/t/p/original/2P4wb9fxAOX8TfTQQcZIXOfN6lQ.jpg",
streamUrl: "https://archive.org/download/nw_S06/E27_the_doctor_the_widow_and_the_wardrobe_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S06/E27_the_doctor_the_widow_and_the_wardrobe_special.srt"
},
{
title: "Pond Life (Prequel)",
season: 7,
episode: 1,
released: new Date("2012-08-27").toISOString(),
overview: "A series of voicemails from the Doctor charts the adventures he's having while Amy and Rory attempt to live a normal life back home.",
thumbnail: "https://image.tmdb.org/t/p/original/5SsxSi6R7jy2ijiyoUiILcMh8fH.jpg",
streamUrl: "https://archive.org/download/nw_S07/E01_pond_life_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E01_pond_life_prequel.srt"
},
{
title: "Asylum of the Daleks (Prequel)",
season: 7,
episode: 2,
released: new Date("2012-09-01").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E02_asylum_of_the_daleks_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E02_asylum_of_the_daleks_prequel.srt"
},
{
title: "Asylum of the Daleks",
season: 7,
episode: 3,
released: new Date("2012-09-01").toISOString(),
overview: "Amy, Rory and the Doctor are reunited when they are kidnapped by the Daleks, who send them on a mission to destroy the most horrifying place in the universe- the asylum of the Daleks.",
thumbnail: "https://image.tmdb.org/t/p/original/bq2Lt7ft3gAGgIVgi2RI9Yug1Lb.jpg",
streamUrl: "https://archive.org/download/nw_S07/E03_asylum_of_the_daleks.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E03_asylum_of_the_daleks.srt"
},
{
title: "The Inforarium (Minisode)",
season: 7,
episode: 4,
released: new Date("2012-09-02").toISOString(),
overview: "The Inforarium — the greatest source of illicit information in recorded history — is compromised.",
thumbnail: "https://image.tmdb.org/t/p/original/pLo50IID6YTUUTdHx6Lh8XfYRJx.jpg",
streamUrl: "https://archive.org/download/nw_S07/E04_the_inforarium_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E04_the_inforarium_minisode.srt"
},
{
title: "Dinosaurs on a Spaceship",
season: 7,
episode: 5,
released: new Date("2012-09-08").toISOString(),
overview: "The Doctor gathers some of his old friends to help him investigate an unmanned spaceship on a crash course to earth that when it collides, will destroy it, they soon discover the ship's precious and dangerous cargo- dinosaurs.",
thumbnail: "https://image.tmdb.org/t/p/original/qNdmvV8j7QH0n7xrSxmQ7KNroc.jpg",
streamUrl: "https://archive.org/download/nw_S07/E05_dinosaurs_on_a_spaceship.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E05_dinosaurs_on_a_spaceship.srt"
},
{
title: "The Making of the Gunslinger (Prequel)",
season: 7,
episode: 6,
released: new Date("2012-09-08").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E06_the_making_of_the_gunslinger_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E06_the_making_of_the_gunslinger_prequel.srt"
},
{
title: "A Town Called Mercy",
season: 7,
episode: 7,
released: new Date("2012-09-15").toISOString(),
overview: "The Doctor gets a Stetson (and a gun), and finds himself the reluctant Sheriff of a Western town under siege by a relentless cyborg who goes by the name of The Gunslinger. But who is he and what does he want?",
thumbnail: "https://image.tmdb.org/t/p/original/nNYNtxJmJCz3v76ckcLFbvzWBqL.jpg",
streamUrl: "https://archive.org/download/nw_S07/E07_a_town_called_mercy.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E07_a_town_called_mercy.srt"
},
{
title: "The Power of Three",
season: 7,
episode: 8,
released: new Date("2012-09-22").toISOString(),
overview: "Earth is suddenly visited by millions of small black cubes of unknown origin. The Doctor joins Amy, Rory and Rory's father, Brian, to help discover what these cubes bring for humanity.",
thumbnail: "https://image.tmdb.org/t/p/original/hMPFhMyL0xJi6lsibWG1vcpwE4w.jpg",
streamUrl: "https://archive.org/download/nw_S07/E08_the_power_of_three.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E08_the_power_of_three.srt"
},
{
title: "The Angels Take Manhattan",
season: 7,
episode: 9,
released: new Date("2012-09-29").toISOString(),
overview: "After Rory has an encounter with a weeping angel, the Doctor and Amy travel to 1930's New York to save him, but they soon discover that the weeping angels have taken over Manhattan, and soon, maybe, the world.",
thumbnail: "https://image.tmdb.org/t/p/original/btbLvpzvxkAEnpO16sj2TdUKcP5.jpg",
streamUrl: "https://archive.org/download/nw_S07/E09_the_angels_take_manhattan.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E09_the_angels_take_manhattan.srt"
},
{
title: "P.S. (Minisode)",
season: 7,
episode: 10,
released: new Date("2012-10-12").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E10_p.s._minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E10_p.s._minisode.srt"
},
{
title: "The Battle of Demon's Run: Two Days Later (Prequel)",
season: 7,
episode: 11,
released: new Date("2012-12-25").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E11_the_battle_of_demons_run_two_days_later_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E11_the_battle_of_demons_run_two_days_later_prequel.srt"
},
{
title: "The Great Detective (Prequel)",
season: 7,
episode: 12,
released: new Date("2012-12-25").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E12_the_great_detective_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E12_the_great_detective_prequel.srt"
},
{
title: "Vastra Investigates (Prequel)",
season: 7,
episode: 13,
released: new Date("2012-12-25").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E13_vastra_investigates_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E13_vastra_investigates_prequel.srt"
},
{
title: "The Snowmen (Special)",
season: 7,
episode: 14,
released: new Date("2012-12-25").toISOString(),
overview: "Christmas Eve, 1892, and the falling snow is the stuff of fairy tales. When the fairytale becomes a nightmare and a chilling menace threatens Earth, an unorthodox young governess, Clara, calls on the Doctor for help.",
thumbnail: "https://image.tmdb.org/t/p/original/aRXe8HalrcwpImk9eq1IdK2sGs5.jpg",
streamUrl: "https://archive.org/download/nw_S07/E14_the_snowmen_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E14_the_snowmen_special.srt"
},
{
title: "The Bells of Saint John (Prequel)",
season: 7,
episode: 15,
released: new Date("2013-03-23").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E15_the_bells_of_saint_john_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E15_the_bells_of_saint_john_prequel.srt"
},
{
title: "The Bells of Saint John",
season: 7,
episode: 16,
released: new Date("2013-03-30").toISOString(),
overview: "The Doctor finds Clara in present day, where they work together to solve the mystery of people disappearing which as it turns out, has a sinister link to WiFi.",
thumbnail: "https://image.tmdb.org/t/p/original/j4cCDQ3evhkdvmSCrFLnXsAhWhI.jpg",
streamUrl: "https://archive.org/download/nw_S07/E16_the_bells_of_saint_john.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E16_the_bells_of_saint_john.srt"
},
{
title: "The Rings of Akhaten",
season: 7,
episode: 17,
released: new Date("2013-04-06").toISOString(),
overview: "The Doctor takes Clara to the rings of Akhaten, A partly destroyed planet, where a religious ceremony is about to be carried out, but a darkness is stirring, a hungry darkness that could consume the rings of Akhaten and the universe.",
thumbnail: "https://image.tmdb.org/t/p/original/twEQ1kG0P3l0npgZuWxUywl9WVu.jpg",
streamUrl: "https://archive.org/download/nw_S07/E17_the_rings_of_akhaten.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E17_the_rings_of_akhaten.srt"
},
{
title: "Rain Gods (Minisode)",
season: 7,
episode: 18,
released: new Date("2013-04-07").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E18_rain_gods_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E18_rain_gods_minisode.srt"
},
{
title: "Cold War",
season: 7,
episode: 19,
released: new Date("2013-04-13").toISOString(),
overview: "The Doctor and Clara find themselves on a Russian submarine that is falling to the bottom of the ocean because of an attack by a rogue Martian warrior that's still on board.",
thumbnail: "https://image.tmdb.org/t/p/original/hWzR3TmDwcsjEtKbb6D00Y4ZAX0.jpg",
streamUrl: "https://archive.org/download/nw_S07/E19_cold_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E19_cold_war.srt"
},
{
title: "Hide",
season: 7,
episode: 20,
released: new Date("2013-04-20").toISOString(),
overview: "The Doctor and Clara arrive at a supposedly haunted mansion where they find a ghost hunter and a psychic who are on the search for a legendary ghost known as 'the witch of the well'.",
thumbnail: "https://image.tmdb.org/t/p/original/nVgta9DCMVxYaIMJ13JnERHZWav.jpg",
streamUrl: "https://archive.org/download/nw_S07/E20_hide.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E20_hide.srt"
},
{
title: "Journey to the Centre of the TARDIS",
season: 7,
episode: 21,
released: new Date("2013-04-27").toISOString(),
overview: "After the TARDIS is caught accidentally by an outer space trash collector, Clara is trapped deep inside of it where she finds herself on a journey through the Doctor's past and her future.",
thumbnail: "https://image.tmdb.org/t/p/original/5tS0yIS5c1kKLee88VuJILimzah.jpg",
streamUrl: "https://archive.org/download/nw_S07/E21_journey_to_the_centre_of_the_tardis.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E21_journey_to_the_centre_of_the_tardis.srt"
},
{
title: "Clara and the TARDIS (Minisode)",
season: 7,
episode: 22,
released: new Date("2013-04-28").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E22_clara_and_the_tardis_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E22_clara_and_the_tardis_minisode.srt"
},
{
title: "The Crimson Horror",
season: 7,
episode: 23,
released: new Date("2013-05-04").toISOString(),
overview: "When they find a picture of the Doctor in a recently dead man's eye, it's up to Madame Vastra, Jenny and Strax to save The Doctor and find out what sinister secrets are going on at Sweetsville, Yorkshire.",
thumbnail: "https://image.tmdb.org/t/p/original/mhKYkNelmUe6VAonw2XFeL8Q9Dz.jpg",
streamUrl: "https://archive.org/download/nw_S07/E23_the_crimson_horror.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E23_the_crimson_horror.srt"
},
{
title: "Nightmare in Silver",
season: 7,
episode: 24,
released: new Date("2013-05-11").toISOString(),
overview: "The Doctor takes Clara and the children she babysits to a rundown amusement park in space where Cybermen are hiding, and ready to invade the most precious place in the universe, The Doctor's mind.",
thumbnail: "https://image.tmdb.org/t/p/original/pw6HfI7FhRyzbXpx7D5pbf6ejac.jpg",
streamUrl: "https://archive.org/download/nw_S07/E24_nightmare_in_silver.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E24_nightmare_in_silver.srt"
},
{
title: "Clarence and the Whispermen (Prequel)",
season: 7,
episode: 25,
released: new Date("2013-05-18").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E25_clarence_and_the_whispermen_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E25_clarence_and_the_whispermen_prequel.srt"
},
{
title: "She Said, He Said (Prequel)",
season: 7,
episode: 26,
released: new Date("2013-05-18").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S07/E26_she_said_he_said_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E26_she_said_he_said_prequel.srt"
},
{
title: "The Name of the Doctor",
season: 7,
episode: 27,
released: new Date("2013-05-18").toISOString(),
overview: "The Doctor's friends are being kidnapped, which leads him to the fields of Trenzalore, where his greatest secret will be revealed and Clara's mystery will be solved.",
thumbnail: "https://image.tmdb.org/t/p/original/rstZ7dB8vuw0hcvEDHtYOtE59Uf.jpg",
streamUrl: "https://archive.org/download/nw_S07/E27_the_name_of_the_doctor.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E27_the_name_of_the_doctor.srt"
},
{
title: "The Night of the Doctor (Minisode)",
season: 7,
episode: 28,
released: new Date("2013-11-14").toISOString(),
overview: "On the eve of his most terrible battle, the Time Lord is faced with a choice that will change the course of his life. The darkest of days are about to begin.",
thumbnail: "https://image.tmdb.org/t/p/original/zyrUbVAMBKPv3WS0FVmXLhBXDKq.jpg",
streamUrl: "https://archive.org/download/nw_S07/E28_the_night_of_the_doctor_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E28_the_night_of_the_doctor_minisode.srt"
},
{
title: "The Last Day (Minisode)",
season: 7,
episode: 29,
released: new Date("2013-11-21").toISOString(),
overview: "First day on the front line? Time to attach a Headcam for a soldier's point-of-view. What could possibly go wrong?",
thumbnail: "https://image.tmdb.org/t/p/original/mHVCmgBSwtGfnw2ejMg0u1DxHKw.jpg",
streamUrl: "https://archive.org/download/nw_S07/E29_the_last_day_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E29_the_last_day_minisode.srt"
},
{
title: "The Day of the Doctor (Special)",
season: 7,
episode: 30,
released: new Date("2013-11-23").toISOString(),
overview: "The Doctors embark on their greatest adventure in this 50th anniversary special. In 2013, something terrible is awakening in London's National Gallery; in 1562, a murderous plot is afoot in Elizabethan England; and somewhere in space an ancient battle reaches its devastating conclusion. All of reality is at stake as the Doctor's own dangerous past comes back to haunt him.",
thumbnail: "https://image.tmdb.org/t/p/original/uXhopdKkGjJiPRZ3ipuiLNH1ZqC.jpg",
streamUrl: "https://archive.org/download/nw_S07/E30_the_day_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E30_the_day_of_the_doctor_special.srt"
},
{
title: "The Time of the Doctor (Special)",
season: 7,
episode: 31,
released: new Date("2013-12-25").toISOString(),
overview: "The Doctor's worst enemies, The Daleks, The Cybermen, The Angels and The Silence, return, as the Doctor's eleventh life comes to a close, and his twelfth life begins.",
thumbnail: "https://image.tmdb.org/t/p/original/fPLZhZzkAMBVaMZn6U1YymSNvYW.jpg",
streamUrl: "https://archive.org/download/nw_S07/E31_the_time_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S07/E31_the_time_of_the_doctor_special.srt"
},
{
title: "Deep Breath (Prequel)",
season: 8,
episode: 1,
released: new Date("2014-08-18").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S08/E01_deep_breath_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E01_deep_breath_prequel.srt"
},
{
title: "Deep Breath",
season: 8,
episode: 2,
released: new Date("2014-08-23").toISOString(),
overview: "When the newly-regenerated Doctor arrives in Victorian London, he finds a dinosaur rampant in the Thames and a spate of deadly spontaneous combustions.",
thumbnail: "https://image.tmdb.org/t/p/original/QvclqZzEGbA4ZC35NEqp2yfdCI.jpg",
streamUrl: "https://archive.org/download/nw_S08/E02_deep_breath.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E02_deep_breath.srt"
},
{
title: "Into the Dalek",
season: 8,
episode: 3,
released: new Date("2014-08-30").toISOString(),
overview: "The Doctor's greatest enemy surrounds a rebel ship. To save everyone, he and Clara must choose to venture into the most dangerous place in the universe. The Doctor is forced to examine his conscience and ask if he is a good man.",
thumbnail: "https://image.tmdb.org/t/p/original/4lsDGJvfV2mfrCI9OeIHQPtz019.jpg",
streamUrl: "https://archive.org/download/nw_S08/E03_into_the_dalek.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E03_into_the_dalek.srt"
},
{
title: "Robot of Sherwood",
season: 8,
episode: 4,
released: new Date("2014-09-06").toISOString(),
overview: "In Sherwood Forest, the Doctor uncovers a sinister alien plot and forms an alliance with Robin Hood. With Nottingham at stake, the Doctor must decide who is real and who is fake.",
thumbnail: "https://image.tmdb.org/t/p/original/5FzgVaPR0tT3IuvveHO6hAS3zW1.jpg",
streamUrl: "https://archive.org/download/nw_S08/E04_robot_of_sherwood.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E04_robot_of_sherwood.srt"
},
{
title: "Listen",
season: 8,
episode: 5,
released: new Date("2014-09-13").toISOString(),
overview: "When ghosts of past and future crowd into their lives, The Doctor and Clara are thrown into an adventure that takes them to the very end of the universe.",
thumbnail: "https://image.tmdb.org/t/p/original/dMAViLP5xtMJPwv9EOYUx0RZR6w.jpg",
streamUrl: "https://archive.org/download/nw_S08/E05_listen.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E05_listen.srt"
},
{
title: "Time Heist",
season: 8,
episode: 6,
released: new Date("2014-09-20").toISOString(),
overview: "The Doctor and Clara wake up in a room with two other people, unable to remember how they got there. As it turns out Someone known as the Architect has employed them to Break into the Universe's most secure bank.",
thumbnail: "https://image.tmdb.org/t/p/original/wpYavTBfPP93pPUDG2D6JT0iBP2.jpg",
streamUrl: "https://archive.org/download/nw_S08/E06_time_heist.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E06_time_heist.srt"
},
{
title: "The Caretaker",
season: 8,
episode: 7,
released: new Date("2014-09-27").toISOString(),
overview: "The terrifying Skovox Blitzer is ready to destroy all humanity - but worse, and any second now, Danny Pink and the Doctor are going to meet.",
thumbnail: "https://image.tmdb.org/t/p/original/jJHTbYYy22g5uC7o1AJ7qUzX0d4.jpg",
streamUrl: "https://archive.org/download/nw_S08/E07_the_caretaker.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E07_the_caretaker.srt"
},
{
title: "Kill the Moon",
season: 8,
episode: 8,
released: new Date("2014-10-04").toISOString(),
overview: "In the near future, the Doctor and Clara find themselves on a space shuttle making a suicide mission to the Moon. Crash-landing on the lunar surface they find the most terrible things.",
thumbnail: "https://image.tmdb.org/t/p/original/uhtYYQbCHGpl2PKEIaI568k8IwG.jpg",
streamUrl: "https://archive.org/download/nw_S08/E08_kill_the_moon.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E08_kill_the_moon.srt"
},
{
title: "Mummy on the Orient Express",
season: 8,
episode: 9,
released: new Date("2014-10-11").toISOString(),
overview: "On the most beautiful train in history, speeding amongst the stars of the future, a deadly and immortal creature is stalking the passengers.",
thumbnail: "https://image.tmdb.org/t/p/original/t3uKRUCf7NjjCHR04oIjMWw5YkS.jpg",
streamUrl: "https://archive.org/download/nw_S08/E09_mummy_on_the_orient_express.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E09_mummy_on_the_orient_express.srt"
},
{
title: "Flatline",
season: 8,
episode: 10,
released: new Date("2014-10-18").toISOString(),
overview: "A problem happens with the Tardis, trapping the Doctor inside and leaving Clara to fend for herself against a two dimensional enemy.",
thumbnail: "https://image.tmdb.org/t/p/original/5nvOPS7kAY8ABfzThNDcFXC6m8B.jpg",
streamUrl: "https://archive.org/download/nw_S08/E10_flatline.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E10_flatline.srt"
},
{
title: "In the Forest of the Night",
season: 8,
episode: 11,
released: new Date("2014-10-25").toISOString(),
overview: "One morning in London, and every city and town in the world, the human race wakes up to the most surprising invasion yet: the trees have moved back in. Everywhere, in every land, a forest has grown and taken back the Earth.",
thumbnail: "https://image.tmdb.org/t/p/original/q7XgP6ZOH3SMZnsuSduqd7m4VDB.jpg",
streamUrl: "https://archive.org/download/nw_S08/E11_in_the_forest_of_the_night.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E11_in_the_forest_of_the_night.srt"
},
{
title: "Dark Water",
season: 8,
episode: 12,
released: new Date("2014-11-01").toISOString(),
overview: "In the mysterious world of the Nethersphere, plans have been drawn. Old friends and old enemies manoeuvre around the Doctor, and an impossible choice is looming over him.",
thumbnail: "https://image.tmdb.org/t/p/original/ivoRRJ61ysuhbWaebrNLsN2wu1G.jpg",
streamUrl: "https://archive.org/download/nw_S08/E12_dark_water.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E12_dark_water.srt"
},
{
title: "Death in Heaven",
season: 8,
episode: 13,
released: new Date("2014-11-08").toISOString(),
overview: "With Cybermen on the streets of London, old friends unite against old enemies and the Doctor takes to the air in a startling new role. As the Doctor faces his greatest challenge, sacrifices must be made before the day is won.",
thumbnail: "https://image.tmdb.org/t/p/original/sdT95NoQfZ22MOEtIWT2PBCcKff.jpg",
streamUrl: "https://archive.org/download/nw_S08/E13_death_in_heaven.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E13_death_in_heaven.srt"
},
{
title: "Last Christmas (Special)",
season: 8,
episode: 14,
released: new Date("2014-12-25").toISOString(),
overview: "The Doctor and Clara face their Last Christmas. Trapped on an Arctic base, under attack from terrifying creatures, who are you going to call? Santa Claus!",
thumbnail: "https://image.tmdb.org/t/p/original/ap7oSn4dsflq1icgTTIawagj3yx.jpg",
streamUrl: "https://archive.org/download/nw_S08/E14_last_christmas_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S08/E14_last_christmas_special.srt"
},
{
title: "Prologue (Prequel)",
season: 9,
episode: 1,
released: new Date("2015-09-11").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S09/E01_prologue_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E01_prologue_prequel.srt"
},
{
title: "The Doctor's Meditation (Prequel)",
season: 9,
episode: 2,
released: new Date("2015-09-15").toISOString(),
overview: "The Doctor must meditate to prepare to see his 'old friend' and atone for a past mistake... but he can't meditate without proper drinking water.",
thumbnail: "https://image.tmdb.org/t/p/original/heDfbT5UIzkJfjjT60sQLpArr4A.jpg",
streamUrl: "https://archive.org/download/nw_S09/E02_the_doctors_meditation_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E02_the_doctors_meditation_prequel.srt"
},
{
title: "The Magician's Apprentice",
season: 9,
episode: 3,
released: new Date("2015-09-19").toISOString(),
overview: "When the skies of Earth are frozen by a mysterious alien force, Clara needs her friend, the Doctor. But where is he and what is he hiding from?",
thumbnail: "https://image.tmdb.org/t/p/original/3NSXbZVdEN1MRIiywyraojrCzqe.jpg",
streamUrl: "https://archive.org/download/nw_S09/E03_the_magicians_apprentice.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E03_the_magicians_apprentice.srt"
},
{
title: "The Witch's Familiar",
season: 9,
episode: 4,
released: new Date("2015-09-26").toISOString(),
overview: "Trapped and alone in a terrifying Dalek city, the Doctor is at the heart of an evil Empire; no sonic, no TARDIS, nobody to help. With his greatest temptation before him, can the Doctor resist? And will there be mercy?",
thumbnail: "https://image.tmdb.org/t/p/original/i9C8EGTxNyV8gITzOeMz0nIweac.jpg",
streamUrl: "https://archive.org/download/nw_S09/E04_the_witchs_familiar.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E04_the_witchs_familiar.srt"
},
{
title: "Under the Lake",
season: 9,
episode: 5,
released: new Date("2015-10-03").toISOString(),
overview: "The Doctor and Clara find themselves on a underwater station where the crew live in fear of deadly ghosts which have taken over the station.",
thumbnail: "https://image.tmdb.org/t/p/original/5b11pS8kvHPJcKIAtdqW0TSuWJb.jpg",
streamUrl: "https://archive.org/download/nw_S09/E05_under_the_lake.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E05_under_the_lake.srt"
},
{
title: "Before the Flood",
season: 9,
episode: 6,
released: new Date("2015-10-10").toISOString(),
overview: "In a town that never was, the Doctor and his friends are being stalked by a mysterious figure. With the past and future in the balance, can the Doctor stop the evil Fisher King? And more importantly, who composed Beethoven's 5th.",
thumbnail: "https://image.tmdb.org/t/p/original/nQbCg8toK04cKQi3b7SpGMOtZlr.jpg",
streamUrl: "https://archive.org/download/nw_S09/E06_before_the_flood.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E06_before_the_flood.srt"
},
{
title: "The Girl Who Died",
season: 9,
episode: 7,
released: new Date("2015-10-17").toISOString(),
overview: "In a Viking village, a girl named Ashildr is about to make a desperate mistake. The Mire are the deadliest mercenaries in the galaxy, famed for showing no mercy and Ashildr has just declared war on them. The Doctor and Clara have 12 hours to turn a peaceful village into strong fighters, ready for the deadly Mire.",
thumbnail: "https://image.tmdb.org/t/p/original/gSNPOH3hw1tADe5ZzUBrWtGcltK.jpg",
streamUrl: "https://archive.org/download/nw_S09/E07_the_girl_who_died.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E07_the_girl_who_died.srt"
},
{
title: "The Woman Who Lived",
season: 9,
episode: 8,
released: new Date("2015-10-24").toISOString(),
overview: "England, 1651. A deadly highwayman known only as 'The Knightmare' plagues the dark streets of London, his fire-breathing accomplice by his side. There's something clearly more than human here, and that includes the loot as much as the outlaws. Who are these creatures, and are they enemies to be fought, or friends who might possibly save the Doctor from certain doom on the gallows?",
thumbnail: "https://image.tmdb.org/t/p/original/218sRPWJFKp5VgdvCa46EZf4KPt.jpg",
streamUrl: "https://archive.org/download/nw_S09/E08_the_woman_who_lived.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E08_the_woman_who_lived.srt"
},
{
title: "The Zygon Invasion",
season: 9,
episode: 9,
released: new Date("2015-10-31").toISOString(),
overview: "Zygons, a shape-shifting alien race, and humans live in peace together on earth, but a group of rogue zygons threaten the peace between humans and zygons.",
thumbnail: "https://image.tmdb.org/t/p/original/1GRZ4mBbEIezevCfGMZHNWinYZq.jpg",
streamUrl: "https://archive.org/download/nw_S09/E09_the_zygon_invasion.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E09_the_zygon_invasion.srt"
},
{
title: "The Zygon Inversion",
season: 9,
episode: 10,
released: new Date("2015-11-07").toISOString(),
overview: "With the Zygons invading England, and UNIT neutralized, the Doctor stands alone to stop the Zygons from taking over the entire planet. But how can he stop the Zygons? And how can he save his friends?",
thumbnail: "https://image.tmdb.org/t/p/original/7ceL42RZiAeXO687cW9qrHmsj6t.jpg",
streamUrl: "https://archive.org/download/nw_S09/E10_the_zygon_inversion.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E10_the_zygon_inversion.srt"
},
{
title: "Sleep No More",
season: 9,
episode: 11,
released: new Date("2015-11-14").toISOString(),
overview: "Vision recovered from the wreckage of Le Verrier Space Station shows how the Doctor and Clara became entangled in a rescue mission. As the footage plays out, a horrifying secret is uncovered.",
thumbnail: "https://image.tmdb.org/t/p/original/nyIBGBeKc9znPjRw3anSmVB5SiC.jpg",
streamUrl: "https://archive.org/download/nw_S09/E11_sleep_no_more.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E11_sleep_no_more.srt"
},
{
title: "Face the Raven",
season: 9,
episode: 12,
released: new Date("2015-11-21").toISOString(),
overview: "The Doctor and Clara are called back to Earth when Rigsy discovers a strange tattoo on the back of his neck that appears to be counting down to zero. Their investigation leads them to a hidden street in the middle of London, the discovery that Rigsy has been issued a death sentence, and one of them facing the choice of having to make the ultimate sacrifice; to face the Raven!",
thumbnail: "https://image.tmdb.org/t/p/original/45yppkIcoAUNHuP6jcz4YlqQpLc.jpg",
streamUrl: "https://archive.org/download/nw_S09/E12_face_the_raven.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E12_face_the_raven.srt"
},
{
title: "Heaven Sent",
season: 9,
episode: 13,
released: new Date("2015-11-28").toISOString(),
overview: "Trapped in a world unlike any other he has seen, the Doctor faces the greatest challenge of his many lives. One final test. And he must face it alone...",
thumbnail: "https://image.tmdb.org/t/p/original/b9y8abaKmwrglVTMF8e6kgHmtLB.jpg",
streamUrl: "https://archive.org/download/nw_S09/E13_heaven_sent.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E13_heaven_sent.srt"
},
{
title: "Hell Bent",
season: 9,
episode: 14,
released: new Date("2015-12-05").toISOString(),
overview: "Escaping his confession dial, the Doctor finds himself back home on Gallifrey and confronts those who have conspired against him. However, the Time Lords are unprepared for the lengths the Doctor will go to in order to save his friend.",
thumbnail: "https://image.tmdb.org/t/p/original/dmqcY9AfnALGlCH6nJdG6ngs0iz.jpg",
streamUrl: "https://archive.org/download/nw_S09/E14_hell_bent.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E14_hell_bent.srt"
},
{
title: "The Husbands of River Song (Special)",
season: 9,
episode: 15,
released: new Date("2015-12-25").toISOString(),
overview: "It’s Christmas Day on a remote human colony and the Doctor is hiding from Christmas Carols and Comedy Antlers. But when a crashed spaceship calls upon the Doctor for help, he finds himself recruited into River Song’s squad and hurled into a fast and frantic chase across the galaxy.",
thumbnail: "https://image.tmdb.org/t/p/original/2jUhX2iSnUdm8VQD8YyvHcaJ3zO.jpg",
streamUrl: "https://archive.org/download/nw_S09/E15_the_husbands_of_river_song_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E15_the_husbands_of_river_song_special.srt"
},
{
title: "The Return of Doctor Mysterio (Special)",
season: 9,
episode: 16,
released: new Date("2016-12-25").toISOString(),
overview: "One fateful night in New York City, the Doctor inadvertently causes a young boy to gain superpowers. Returning years later on the trail of the shady Harmony Shoal Institute, he finds the boy all grown up as masked superhero The Ghost.",
thumbnail: "https://image.tmdb.org/t/p/original/AckrdkuwGQSLfFSpUYGUSzIFksW.jpg",
streamUrl: "https://archive.org/download/nw_S09/E16_the_return_of_doctor_mysterio_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S09/E16_the_return_of_doctor_mysterio_special.srt"
},
{
title: "Friend from the Future (Prequel)",
season: 10,
episode: 1,
released: new Date("2017-04-14").toISOString(),
overview: "An exclusive scene from a future episode of Doctor Who, introducing the new Companion.",
thumbnail: "https://image.tmdb.org/t/p/original/r7bfVC1iQuxhXx4OvdV14kDIIy3.jpg",
streamUrl: "https://archive.org/download/nw_S10/E01_friend_from_the_future_prequel.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E01_friend_from_the_future_prequel.srt"
},
{
title: "The Pilot",
season: 10,
episode: 2,
released: new Date("2017-04-15").toISOString(),
overview: "The Doctor and Nardole team up with a university student to take down a sinister life-mimicking alien.",
thumbnail: "https://image.tmdb.org/t/p/original/egN8BjxH7umTP73Gkjj2HiVZSpw.jpg",
streamUrl: "https://archive.org/download/nw_S10/E02_the_pilot.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E02_the_pilot.srt"
},
{
title: "Smile",
season: 10,
episode: 3,
released: new Date("2017-04-22").toISOString(),
overview: "The Doctor brings Bill to a future human colony, where cute EmojiBots work as willing servants and make sure everybody's happy, but if they're not happy, they're harvested, so Bill and The Doctor better smile, or else.",
thumbnail: "https://image.tmdb.org/t/p/original/whAfpukCWnouLlmD1SC6Fdrk38E.jpg",
streamUrl: "https://archive.org/download/nw_S10/E03_smile.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E03_smile.srt"
},
{
title: "Thin Ice",
season: 10,
episode: 4,
released: new Date("2017-04-29").toISOString(),
overview: "The Doctor and Bill visit London during the last of the River Thames frost fairs in February 1814. They soon discover that there is something under the ice which is causing people to disappear.",
thumbnail: "https://image.tmdb.org/t/p/original/d5zYP0yEPotThPRcqXpqSsJMzAl.jpg",
streamUrl: "https://archive.org/download/nw_S10/E04_thin_ice.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E04_thin_ice.srt"
},
{
title: "Knock Knock",
season: 10,
episode: 5,
released: new Date("2017-05-06").toISOString(),
overview: "Bill is moving in with some friends and they've found the perfect house rented by the landlord. The wind blows, the floorboards creak and the Doctor thinks something is very wrong.",
thumbnail: "https://image.tmdb.org/t/p/original/amIYpM0Drc9jgNzLBRXmgtL24Vc.jpg",
streamUrl: "https://archive.org/download/nw_S10/E05_knock_knock.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E05_knock_knock.srt"
},
{
title: "Oxygen",
season: 10,
episode: 6,
released: new Date("2017-05-13").toISOString(),
overview: "When the Doctor, Bill and Nardole become trapped on a space station without oxygen, they discover the spacesuits are trying to kill them.",
thumbnail: "https://image.tmdb.org/t/p/original/l7QmcUeYl7Y1Jf5QcN5Eiw9Yq2T.jpg",
streamUrl: "https://archive.org/download/nw_S10/E06_oxygen.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E06_oxygen.srt"
},
{
title: "Extremis",
season: 10,
episode: 7,
released: new Date("2017-05-20").toISOString(),
overview: "The Doctor is called by the Vatican to solve the mystery of a text called the Veritas, that when someone reads it dies soon after. But something is dwelling in the Vatican, and doesn't want the Veritas to be read.",
thumbnail: "https://image.tmdb.org/t/p/original/uoNrQEaiszJIzGppzGecoOd8LrF.jpg",
streamUrl: "https://archive.org/download/nw_S10/E07_extremis.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E07_extremis.srt"
},
{
title: "The Pyramid at the End of the World",
season: 10,
episode: 8,
released: new Date("2017-05-27").toISOString(),
overview: "A 5,000-year-old pyramid appears overnight, baffling everyone including the Doctor.",
thumbnail: "https://image.tmdb.org/t/p/original/inbEWtMfLVdZ0rVvx6RE5Dk0TOr.jpg",
streamUrl: "https://archive.org/download/nw_S10/E08_the_pyramid_at_the_end_of_the_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E08_the_pyramid_at_the_end_of_the_world.srt"
},
{
title: "The Lie of the Land",
season: 10,
episode: 9,
released: new Date("2017-06-03").toISOString(),
overview: "Earth is invaded and Bill is living alone in occupied Britain. The Doctor appears to be on the side of the enemy, flooding the airwaves with fake news. Bill and Nardole embark on a deadly mission to rescue the Doctor and lead the resistance against the new regime, whatever the cost.",
thumbnail: "https://image.tmdb.org/t/p/original/pNgbfTtvLIti10XFtBfXowEg1UF.jpg",
streamUrl: "https://archive.org/download/nw_S10/E09_the_lie_of_the_land.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E09_the_lie_of_the_land.srt"
},
{
title: "Empress of Mars",
season: 10,
episode: 10,
released: new Date("2017-06-10").toISOString(),
overview: "The Doctor, Bill and Nardole discover a tomb of the Queen of the Ice Warriors on Mars in 1881.",
thumbnail: "https://image.tmdb.org/t/p/original/lTdu8QtaO9DK2HoTQN7HqrTdT7J.jpg",
streamUrl: "https://archive.org/download/nw_S10/E10_empress_of_mars.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E10_empress_of_mars.srt"
},
{
title: "The Eaters of Light",
season: 10,
episode: 11,
released: new Date("2017-06-17").toISOString(),
overview: "A long time ago, the Roman legion of the ninth vanished into the mists of Scotland. Bill has a theory about what happened, and the Doctor has a time machine. But when they arrive in ancient Aberdeenshire, what they find is a far greater threat than any army. In a cairn, on a hillside, is a doorway leading to the end of the world.",
thumbnail: "https://image.tmdb.org/t/p/original/mjMxkZDNsPJKG0UYOSxa2ndGZxq.jpg",
streamUrl: "https://archive.org/download/nw_S10/E11_the_eaters_of_light.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E11_the_eaters_of_light.srt"
},
{
title: "World Enough and Time",
season: 10,
episode: 12,
released: new Date("2017-06-24").toISOString(),
overview: "Trapped on a giant spaceship, caught in the event horizon of a black hole, he witnesses the death of someone he is pledged to protect. Are events already out of control?",
thumbnail: "https://image.tmdb.org/t/p/original/ar4nonH1GWnoi0HDguETxIlm4ds.jpg",
streamUrl: "https://archive.org/download/nw_S10/E12_world_enough_and_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E12_world_enough_and_time.srt"
},
{
title: "The Doctor Falls",
season: 10,
episode: 13,
released: new Date("2017-07-01").toISOString(),
overview: "The Doctor makes a final stand against an army of Cybermen to protect a tiny band of humans from destruction.",
thumbnail: "https://image.tmdb.org/t/p/original/89ajqG2EFDVxuTt5pACM3s7sdw3.jpg",
streamUrl: "https://archive.org/download/nw_S10/E13_the_doctor_falls.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E13_the_doctor_falls.srt"
},
{
title: "Twice Upon a Time (Special)",
season: 10,
episode: 14,
released: new Date("2017-12-25").toISOString(),
overview: "The Twelfth Doctor, still refusing to change, goes on a last adventure with the First Doctor.",
thumbnail: "https://image.tmdb.org/t/p/original/yyTBLY5FmTs3fViptHjRGISfUl3.jpg",
streamUrl: "https://archive.org/download/nw_S10/E14_twice_upon_a_time_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S10/E14_twice_upon_a_time_special.srt"
},
{
title: "The Woman Who Fell to Earth",
season: 11,
episode: 1,
released: new Date("2018-10-07").toISOString(),
overview: "In a South Yorkshire city, Ryan Sinclair, Yasmin Khan and Graham O'Brien are about to have their lives changed forever, as a mysterious woman, unable to remember her own name, falls from the night sky.",
thumbnail: "https://image.tmdb.org/t/p/original/4KOSsIZ8PLS3gDONEfmdY64sxmk.jpg",
streamUrl: "https://archive.org/download/nw_S11/E01_the_woman_who_fell_to_earth.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E01_the_woman_who_fell_to_earth.srt"
},
{
title: "The Ghost Monument",
season: 11,
episode: 2,
released: new Date("2018-10-14").toISOString(),
overview: "Still reeling from their first encounter, can the Doctor and her new friends stay alive long enough, in a hostile alien environment, to solve the mystery of Desolation? And just who are Angstrom and Epzo?",
thumbnail: "https://image.tmdb.org/t/p/original/kniAsYgN04WAwSfak1N12QG5keg.jpg",
streamUrl: "https://archive.org/download/nw_S11/E02_the_ghost_monument.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E02_the_ghost_monument.srt"
},
{
title: "Rosa",
season: 11,
episode: 3,
released: new Date("2018-10-21").toISOString(),
overview: "Montgomery, Alabama, 1955. The Doctor and her friends find themselves in the Deep South of America. As they encounter a seamstress by the name of Rosa Parks, they begin to wonder whether someone is attempting to change history.",
thumbnail: "https://image.tmdb.org/t/p/original/4G0ilaIEn8SP7VMmVEjtejX8bnC.jpg",
streamUrl: "https://archive.org/download/nw_S11/E03_rosa.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E03_rosa.srt"
},
{
title: "Arachnids in the UK",
season: 11,
episode: 4,
released: new Date("2018-10-28").toISOString(),
overview: "The Doctor, Yaz, Graham, and Ryan find their way back to Yorkshire only to find something is stirring amidst the eight-legged arachnid population of Sheffield.",
thumbnail: "https://image.tmdb.org/t/p/original/2ylynYBmAArvb3AENomrFFpXXYY.jpg",
streamUrl: "https://archive.org/download/nw_S11/E04_arachnids_in_the_uk.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E04_arachnids_in_the_uk.srt"
},
{
title: "The Tsuranga Conundrum",
season: 11,
episode: 5,
released: new Date("2018-11-04").toISOString(),
overview: "Injured and stranded in the wilds of a far-flung galaxy, The Doctor, Yaz, Graham, and Ryan must band together with a group of strangers to survive against one of the universe's most deadly - and unusual - creatures.",
thumbnail: "https://image.tmdb.org/t/p/original/bvIIJK1kcR7GfN9CZ9cwpBZH3Wn.jpg",
streamUrl: "https://archive.org/download/nw_S11/E05_the_tsuranga_conundrum.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E05_the_tsuranga_conundrum.srt"
},
{
title: "Demons of the Punjab",
season: 11,
episode: 6,
released: new Date("2018-11-11").toISOString(),
overview: "Yasmin travels in time to visit her grandmother during her youth in the partition of India, but everyone gets caught up in the tragic bloodshed of that era.",
thumbnail: "https://image.tmdb.org/t/p/original/nn4Xn1zwOKnrTPE7lgDtt93JOGV.jpg",
streamUrl: "https://archive.org/download/nw_S11/E06_demons_of_the_punjab.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E06_demons_of_the_punjab.srt"
},
{
title: "Kerblam!",
season: 11,
episode: 7,
released: new Date("2018-11-18").toISOString(),
overview: "A mysterious message arrives in a package addressed to the Doctor, leading her, Graham, Yaz and Ryan to investigate the warehouse moon orbiting Kandoka, and the home of the galaxy's largest retailer.",
thumbnail: "https://image.tmdb.org/t/p/original/4dIh5DJyWLtL8Xt2RXIeIYWHVAB.jpg",
streamUrl: "https://archive.org/download/nw_S11/E07_kerblam.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E07_kerblam.srt"
},
{
title: "The Witchfinders",
season: 11,
episode: 8,
released: new Date("2018-11-25").toISOString(),
overview: "Arriving in 17th Century Lancashire, the TARDIS team become embroiled in a witch trial. With the arrival of King James I, the hunt for witches intensifies. However, could something more dangerous be at play? Can the Doctor, Graham, Yaz and Ryan keep the populace of Bilehurst Cragg safe from the forces surrounding the land?",
thumbnail: "https://image.tmdb.org/t/p/original/lxPHFGkBlwjj9WQgd4tJWbA2q1M.jpg",
streamUrl: "https://archive.org/download/nw_S11/E08_the_witchfinders.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E08_the_witchfinders.srt"
},
{
title: "It Takes You Away",
season: 11,
episode: 9,
released: new Date("2018-12-02").toISOString(),
overview: "On the edge of a Norwegian fjord, in the present day, The Doctor, Ryan, Graham and Yaz discover a boarded-up cottage and a girl named Hanne in need of their help. What has happened here? What monster lurks in the woods around the cottage - and beyond?",
thumbnail: "https://image.tmdb.org/t/p/original/fpuAWPEhLwRKI42nMy9ZeIx9YBz.jpg",
streamUrl: "https://archive.org/download/nw_S11/E09_it_takes_you_away.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E09_it_takes_you_away.srt"
},
{
title: "The Battle of Ranskoor Av Kolos",
season: 11,
episode: 10,
released: new Date("2018-12-09").toISOString(),
overview: "Answering nine separate distress calls, the Doctor and team arrive on the remnants of a brutal battlefield on the planet Ranskoor Av Kolos. This planet has many secrets. An amnesiac commander? Mysterious mists? Who or what are the Ux? A deadly reckoning awaits the Doctor and team once they have the answers....",
thumbnail: "https://image.tmdb.org/t/p/original/htU0NWRwLX9tbdzupknnDHqsl3k.jpg",
streamUrl: "https://archive.org/download/nw_S11/E10_the_battle_of_ranskoor_av_kolos.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E10_the_battle_of_ranskoor_av_kolos.srt"
},
{
title: "Resolution (Special)",
season: 11,
episode: 11,
released: new Date("2019-01-01").toISOString(),
overview: "As the New Year begins, a terrifying evil is stirring from across the centuries of Earth’s history. As the Doctor, Ryan, Graham and Yaz return home, will they be able to overcome the threat to planet Earth?",
thumbnail: "https://image.tmdb.org/t/p/original/v57iEwhpgetaGuX5WZqGPllE3O6.jpg",
streamUrl: "https://archive.org/download/nw_S11/E11_resolution_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S11/E11_resolution_special.srt"
},
{
title: "Spyfall, Part 1",
season: 12,
episode: 1,
released: new Date("2020-01-01").toISOString(),
overview: "When intelligence agents around the world come under attack from alien forces, MI6 turns to the only person who can help... The Doctor.",
thumbnail: "https://image.tmdb.org/t/p/original/mTQsmvmcCzGoa2VlDiZT1PASTqX.jpg",
streamUrl: "https://archive.org/download/nw_S12/E01_spyfall_part_1.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E01_spyfall_part_1.srt"
},
{
title: "Spyfall, Part 2",
season: 12,
episode: 2,
released: new Date("2020-01-05").toISOString(),
overview: "A terrifying plan to destroy humanity is about to reach fruition. Can the Doctor and her friends escape multiple traps and defeat a deadly alliance?",
thumbnail: "https://image.tmdb.org/t/p/original/lDAODLsoBLyv85maKLV9cLxUPfi.jpg",
streamUrl: "https://archive.org/download/nw_S12/E02_spyfall_part_2.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E02_spyfall_part_2.srt"
},
{
title: "Orphan 55",
season: 12,
episode: 3,
released: new Date("2020-01-12").toISOString(),
overview: "Having decided that everyone could do with a holiday, Graham accidentally teleports himself, Doctor, Yasmin, and Ryan to a luxury resort for a spot of relaxation. However, they discover the place where they are having a break is hiding several deadly secrets. What are the ferocious monsters that are attacking Tranquility Spa?",
thumbnail: "https://image.tmdb.org/t/p/original/ynAE6GZAHIGeYO41SvjuK8RxDFe.jpg",
streamUrl: "https://archive.org/download/nw_S12/E03_orphan_55.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E03_orphan_55.srt"
},
{
title: "Nikola Tesla's Night of Terror",
season: 12,
episode: 4,
released: new Date("2020-01-19").toISOString(),
overview: "The time: the earliest years of the 20th century. The place: New York City. Inventor Nikola Tesla is at war with his rival Thomas Edison. However, there's an even greater threat in their midst.",
thumbnail: "https://image.tmdb.org/t/p/original/1yabRn03r8Mb2iWuMveJTW5JLzk.jpg",
streamUrl: "https://archive.org/download/nw_S12/E04_nikola_teslas_night_of_terror.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E04_nikola_teslas_night_of_terror.srt"
},
{
title: "Fugitive of the Judoon",
season: 12,
episode: 5,
released: new Date("2020-01-26").toISOString(),
overview: "Stomping their way into present-day Gloucester, the Judoon are on the hunt for someone on the run. Who is this fugitive? And why are these alien mercenaries after them?",
thumbnail: "https://image.tmdb.org/t/p/original/96JFtctOnS7Li73MNH6dyqC1xLM.jpg",
streamUrl: "https://archive.org/download/nw_S12/E05_fugitive_of_the_judoon.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E05_fugitive_of_the_judoon.srt"
},
{
title: "Praxeus",
season: 12,
episode: 6,
released: new Date("2020-02-02").toISOString(),
overview: "The Doctor and her friends split up to investigate multiple mysteries across planet Earth. What they find will threaten all of humanity.",
thumbnail: "https://image.tmdb.org/t/p/original/bLaBhnAvTykOlkmoukF36vg9fk4.jpg",
streamUrl: "https://archive.org/download/nw_S12/E06_praxeus.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E06_praxeus.srt"
},
{
title: "Can You Hear Me?",
season: 12,
episode: 7,
released: new Date("2020-02-09").toISOString(),
overview: "From ancient Syria to present day Sheffield, and out into the wilds of space, something is stalking the Doctor and infecting people's nightmares.",
thumbnail: "https://image.tmdb.org/t/p/original/wnVAKGwrFoeZfG7mQx997GQ4tYF.jpg",
streamUrl: "https://archive.org/download/nw_S12/E07_can_you_hear_me.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E07_can_you_hear_me.srt"
},
{
title: "The Haunting of Villa Diodati",
season: 12,
episode: 8,
released: new Date("2020-02-16").toISOString(),
overview: "Villa Diodati, 1816 - on a night that inspired Mary Shelley's Frankenstein. The plan was to spend the evening in the presence of literary greats - but the ghosts are all too real. And the Doctor is forced into an earth-shattering decision.",
thumbnail: "https://image.tmdb.org/t/p/original/aSgrcTpGUvd7j4vwpHJiDIuwjEg.jpg",
streamUrl: "https://archive.org/download/nw_S12/E08_the_haunting_of_villa_diodati.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E08_the_haunting_of_villa_diodati.srt"
},
{
title: "Ascension of the Cybermen",
season: 12,
episode: 9,
released: new Date("2020-02-23").toISOString(),
overview: "In the far future, the Doctor and her friends face a brutal battle across the farthest reaches of space to protect the last of the human race against the deadly Cybermen.",
thumbnail: "https://image.tmdb.org/t/p/original/1Uq1aD7zY8RQ1DwATZc4XjGAz7c.jpg",
streamUrl: "https://archive.org/download/nw_S12/E09_ascension_of_the_cybermen.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E09_ascension_of_the_cybermen.srt"
},
{
title: "The Timeless Children",
season: 12,
episode: 10,
released: new Date("2020-03-01").toISOString(),
overview: "In the epic and emotional season finale, the Cybermen are on the march. As the last remaining humans are ruthlessly hunted down, Graham, Ryan and Yaz face a terrifying fight to survive. Civilisations fall. Others rise anew. Lies are exposed, truths are revealed, battles are fought, and for the Doctor - trapped and alone - nothing will ever be the same again.",
thumbnail: "https://image.tmdb.org/t/p/original/tcOy8pikBFZmAfw1Icfg2uXWOHZ.jpg",
streamUrl: "https://archive.org/download/nw_S12/E10_the_timeless_children.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E10_the_timeless_children.srt"
},
{
title: "Revolution of the Daleks (Special)",
season: 12,
episode: 11,
released: new Date("2021-01-01").toISOString(),
overview: "The Doctor is imprisoned halfway across the universe. On Earth, the sighting of a Dalek alerts Ryan, Graham and Yaz. Can the return of Captain Jack Harkness help them stop a deadly Dalek takeover?",
thumbnail: "https://image.tmdb.org/t/p/original/xTB8EkeGPPhIH546qkQSrdhGAno.jpg",
streamUrl: "https://archive.org/download/nw_S12/E11_revolution_of_the_daleks_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S12/E11_revolution_of_the_daleks_special.srt"
},
{
title: "The Halloween Apocalypse",
season: 13,
episode: 1,
released: new Date("2021-10-31").toISOString(),
overview: "At Halloween, all across the universe, terrifying forces are stirring. From the Arctic Circle to deep space, an ancient evil is breaking free. And in present day Liverpool, the life of Dan Lewis is about to change forever.",
thumbnail: "https://image.tmdb.org/t/p/original/9nqx2yXR30MNCrvc721ywX4ZlrR.jpg",
streamUrl: "https://archive.org/download/nw_S13/E01_the_halloween_apocalypse.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E01_the_halloween_apocalypse.srt"
},
{
title: "War of the Sontarans",
season: 13,
episode: 2,
released: new Date("2021-11-07").toISOString(),
overview: "During the Crimean War, the Doctor discovers the British army fighting a brutal alien army of Sontarans, as Yaz and Dan are thrown deeper into a battle for survival. What is the Temple of Atropos? Who are the Mouri?",
thumbnail: "https://image.tmdb.org/t/p/original/lZEmZo4iJqvHLKDxhORT9x9C33d.jpg",
streamUrl: "https://archive.org/download/nw_S13/E02_war_of_the_sontarans.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E02_war_of_the_sontarans.srt"
},
{
title: "Once, Upon Time",
season: 13,
episode: 3,
released: new Date("2021-11-14").toISOString(),
overview: "Time is beginning to run wild. On a planet that shouldn't exist, in the aftermath of apocalypse, the Doctor, Dan, Yaz, and Vinder face a battle to survive.",
thumbnail: "https://image.tmdb.org/t/p/original/yTLrnRKrbRJooWr0kQB6ZE44uzD.jpg",
streamUrl: "https://archive.org/download/nw_S13/E03_once_upon_time.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E03_once_upon_time.srt"
},
{
title: "Village of the Angels",
season: 13,
episode: 4,
released: new Date("2021-11-21").toISOString(),
overview: "Devon, November 1967. A little girl has gone missing, Prof Jericho is conducting psychic experiments and in the graveyard there is one gravestone too many. Why is Medderton known as The Cursed Village and what do the Weeping Angels want?",
thumbnail: "https://image.tmdb.org/t/p/original/xBkFTHLnA0ZjHAfVLW8NTc2E0FW.jpg",
streamUrl: "https://archive.org/download/nw_S13/E04_village_of_the_angels.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E04_village_of_the_angels.srt"
},
{
title: "Survivors of the Flux",
season: 13,
episode: 5,
released: new Date("2021-11-28").toISOString(),
overview: "As the forces of evil mass, the Doctor, Yaz and Dan face perilous journeys and seemingly insurmountable obstacles in their quest for survival.",
thumbnail: "https://image.tmdb.org/t/p/original/jcEyyiqsYMLA2VdiZanEGfg8oQC.jpg",
streamUrl: "https://archive.org/download/nw_S13/E05_survivors_of_the_flux.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E05_survivors_of_the_flux.srt"
},
{
title: "The Vanquishers",
season: 13,
episode: 6,
released: new Date("2021-12-05").toISOString(),
overview: "In the final epic chapter in the story of the Flux, all hope is lost. The forces of darkness are in control. But when the monsters have won, who can you count upon to save the universe?",
thumbnail: "https://image.tmdb.org/t/p/original/20wu1cj5iZWyphnYQvKY1M9yBYQ.jpg",
streamUrl: "https://archive.org/download/nw_S13/E06_the_vanquishers.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E06_the_vanquishers.srt"
},
{
title: "Eve of the Daleks (Special)",
season: 13,
episode: 7,
released: new Date("2022-01-01").toISOString(),
overview: "New Year’s Eve. Sarah is working - again. Nick is her only customer - again. Same old same old. Except this year, their countdown to midnight will be the strangest and deadliest they have ever known. Why is an executioner Dalek targeting these two people, in this place, on this night? Why are they having to live through the same moments again? Can the Doctor, Yaz and Dan save them and survive into the New Year?",
thumbnail: "https://image.tmdb.org/t/p/original/jzAywvp6JeEW3chkfr4ywnKu9c4.jpg",
streamUrl: "https://archive.org/download/nw_S13/E07_eve_of_the_daleks_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E07_eve_of_the_daleks_special.srt"
},
{
title: "Legend of the Sea Devils (Special)",
season: 13,
episode: 8,
released: new Date("2022-04-17").toISOString(),
overview: "In 19th century China, a small coastal village is under threat – from both the fearsome pirate queen Madame Ching and a monstrous alien force which she unwittingly unleashes. Will the Doctor, Yaz and Dan emerge from this swashbuckling battle with the Sea Devils to save the planet?",
thumbnail: "https://image.tmdb.org/t/p/original/c4lzuKf6K6tSctF8Tu2kRu7RXfo.jpg",
streamUrl: "https://archive.org/download/nw_S13/E08_legend_of_the_sea_devils_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E08_legend_of_the_sea_devils_special.srt"
},
{
title: "The Power of the Doctor (Special)",
season: 13,
episode: 9,
released: new Date("2022-10-23").toISOString(),
overview: "Who is attacking a speeding bullet train on the edges of a distant galaxy? Why are seismologists going missing from 21st century Earth? Who is defacing some of history’s most iconic paintings? Why is a Dalek trying to make contact with the Doctor? And just what hold does the mesmeric Rasputin have over Tsar Nicholas in 1916 Russia? In her last adventure, The Thirteenth Doctor must fight for her very existence, against her deadliest enemies: the Daleks, the Cybermen and her arch-nemesis, the Master.",
thumbnail: "https://image.tmdb.org/t/p/original/fLRnX0YMWI0vQ3PMckdSzFPsxqU.jpg",
streamUrl: "https://archive.org/download/nw_S13/E09_the_power_of_the_doctor_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S13/E09_the_power_of_the_doctor_special.srt"
},
{
title: "Destination: Skaro (Minisode)",
season: 14,
episode: 1,
released: new Date("2023-11-17").toISOString(),
overview: "On Skaro, Davros unveils his newest creation to Mr. Castavillian, a travel machine he describes as the future of the Kaled race.",
thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Doctor_Who_Experience_%2830826729112%29.jpg/1920px-Doctor_Who_Experience_%2830826729112%29.jpg",
streamUrl: "https://archive.org/download/nw_S14/E01_destination_skaro_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E01_destination_skaro_minisode.srt"
},
{
title: "The Star Beast (Special)",
season: 14,
episode: 2,
released: new Date("2023-11-25").toISOString(),
overview: "The Doctor is caught in a fight to the death as a spaceship crash-lands in London. But as the battle wreaks havoc, destiny is converging on the Doctor’s old friend, Donna.",
thumbnail: "https://image.tmdb.org/t/p/original/tOJyUle7GkwvxmLx1WDpWbaO58C.jpg",
streamUrl: "https://archive.org/download/nw_S14/E02_the_star_beast_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E02_the_star_beast_special.srt"
},
{
title: "Wild Blue Yonder (Special)",
season: 14,
episode: 3,
released: new Date("2023-12-02").toISOString(),
overview: "The TARDIS takes the Doctor and Donna to the furthest edge of adventure. To escape, they must face the most desperate fight of their lives, with the fate of the universe at stake.",
thumbnail: "https://image.tmdb.org/t/p/original/2G0N2VlmyuXZ3ApxIS6swV8pmEe.jpg",
streamUrl: "https://archive.org/download/nw_S14/E03_wild_blue_yonder_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E03_wild_blue_yonder_special.srt"
},
{
title: "The Giggle (Special)",
season: 14,
episode: 4,
released: new Date("2023-12-09").toISOString(),
overview: "The giggle of a mysterious puppet is driving the human race insane. When the Doctor discovers the return of the terrifying Toymaker, he faces a fight he can never win.",
thumbnail: "https://image.tmdb.org/t/p/original/zdwwx188ltENxZr323uCwcKLiSe.jpg",
streamUrl: "https://archive.org/download/nw_S14/E04_the_giggle_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S14/E04_the_giggle_special.srt"
},
{
title: "The Church on Ruby Road (Special)",
season: 15,
episode: 1,
released: new Date("2023-12-25").toISOString(),
overview: "Long ago, on Christmas Eve, a baby was abandoned in the snow. Today, Ruby Sunday meets the Doctor, goblins, stolen babies and, perhaps, the secret of her birth.",
thumbnail: "https://image.tmdb.org/t/p/original/8sV1DDYaBBLctNMgibeIeK9qpY5.jpg",
streamUrl: "https://archive.org/download/nw_S15/E01_the_church_on_ruby_road_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E01_the_church_on_ruby_road_special.srt"
},
{
title: "Space Babies",
season: 15,
episode: 2,
released: new Date("2024-05-11").toISOString(),
overview: "Ruby learns the Doctor's amazing secrets when he takes her to the far future. There, they find a baby farm run by babies. But can they be saved from the terrifying bogeyman?",
thumbnail: "https://image.tmdb.org/t/p/original/ecx6xXGttYlNVsYaJgxGJmDczYz.jpg",
streamUrl: "https://archive.org/download/nw_S15/E02_space_babies.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E02_space_babies.srt"
},
{
title: "The Devil's Chord",
season: 15,
episode: 3,
released: new Date("2024-05-11").toISOString(),
overview: "The Doctor and Ruby meet The Beatles but discover that the all-powerful Maestro is changing history. London becomes a battleground with the future of humanity at stake.",
thumbnail: "https://image.tmdb.org/t/p/original/1xyMiRDhFPKgWGeTt7jxCgAlPVe.jpg",
streamUrl: "https://archive.org/download/nw_S15/E03_the_devils_chord.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E03_the_devils_chord.srt"
},
{
title: "Boom",
season: 15,
episode: 4,
released: new Date("2024-05-18").toISOString(),
overview: "Caught in the middle of a devastating war on Kastarion 3, the Doctor is trapped when he steps on a landmine. Can he save himself and Ruby, plus the entire planet - without moving?",
thumbnail: "https://image.tmdb.org/t/p/original/iI3cJyxa2p1EctX8lOQFBRqTMOn.jpg",
streamUrl: "https://archive.org/download/nw_S15/E04_boom.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E04_boom.srt"
},
{
title: "73 Yards",
season: 15,
episode: 5,
released: new Date("2024-05-25").toISOString(),
overview: "Landing on the Welsh coast, the Doctor and Ruby embark on the strangest journey of their lives. In a rain-lashed pub, the locals sit in fear of ancient legends coming to life.",
thumbnail: "https://image.tmdb.org/t/p/original/vAj0DLeJRD7OjARrJn4NJJTDqDL.jpg",
streamUrl: "https://archive.org/download/nw_S15/E05_73_yards.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E05_73_yards.srt"
},
{
title: "Dot and Bubble",
season: 15,
episode: 6,
released: new Date("2024-06-01").toISOString(),
overview: "The world of Finetime seems happy and harmonious. But an awful terror is preying on the citizens. Can the Doctor and Ruby make them see the truth before it's too late?",
thumbnail: "https://image.tmdb.org/t/p/original/t02OUVl3ipxDsnGFLNnRLEV1kyO.jpg",
streamUrl: "https://archive.org/download/nw_S15/E06_dot_and_bubble.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E06_dot_and_bubble.srt"
},
{
title: "Rogue",
season: 15,
episode: 7,
released: new Date("2024-06-08").toISOString(),
overview: "The Doctor and Ruby land in 1813, where guests at a duchess's party are being murdered, and a mysterious bounty hunter called Rogue is about to change the Doctor's life forever.",
thumbnail: "https://image.tmdb.org/t/p/original/i7B0XFvJZ7dYRfCLmNDFN8BNZUS.jpg",
streamUrl: "https://archive.org/download/nw_S15/E07_rogue.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E07_rogue.srt"
},
{
title: "The Legend of Ruby Sunday",
season: 15,
episode: 8,
released: new Date("2024-06-15").toISOString(),
overview: "The Doctor and UNIT investigate Ruby's past. But as the Time Window reveals horrifying secrets from Christmas Eve, the mysterious Triad Technology unleash the greatest evil of all.",
thumbnail: "https://image.tmdb.org/t/p/original/kpc62ogbSuxaOUFrqBlTuBWGx6s.jpg",
streamUrl: "https://archive.org/download/nw_S15/E08_the_legend_of_ruby_sunday.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E08_the_legend_of_ruby_sunday.srt"
},
{
title: "Empire of Death",
season: 15,
episode: 9,
released: new Date("2024-06-22").toISOString(),
overview: "The Doctor has lost, his ageless enemy reigns supreme, and a shadow is falling over creation. Nothing can stop the devastation - except, perhaps, one woman.",
thumbnail: "https://image.tmdb.org/t/p/original/cGUNuthF8wRbf7pkOoqPgnCL94y.jpg",
streamUrl: "https://archive.org/download/nw_S15/E09_empire_of_death.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E09_empire_of_death.srt"
},
{
title: "Bad Music (Minisode)",
season: 15,
episode: 10,
released: new Date("2024-12-25").toISOString(),
// Overview missing
// Thumbnail missing
streamUrl: "https://archive.org/download/nw_S15/E10_bad_music_minisode.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E10_bad_music_minisode.srt"
},
{
title: "Joy to the World (Special)",
season: 15,
episode: 11,
released: new Date("2024-12-25").toISOString(),
overview: "When Joy opens a secret doorway to the Time Hotel, she discovers danger, dinosaurs and the Doctor. But a deadly plan is unfolding across the earth, just in time for Christmas.",
thumbnail: "https://image.tmdb.org/t/p/original/g6ynrjD8aaFFUvSmYvgMkUT3eox.jpg",
streamUrl: "https://archive.org/download/nw_S15/E11_joy_to_the_world_special.mp4",
subtitleUrl: "https://archive.org/download/nw_S15/E11_joy_to_the_world_special.srt"
},
{
title: "The Robot Revolution",
season: 16,
episode: 1,
released: new Date("2025-04-12").toISOString(),
overview: "When robots from outer space kidnap nurse Belinda Chandra, the Doctor embarks on an epic intergalactic quest to get his new friend back home to Earth.",
thumbnail: "https://image.tmdb.org/t/p/original/gebhUET1xXloAxu6e8iF7mcX76X.jpg",
streamUrl: "https://archive.org/download/nw_S16/E01_the_robot_revolution.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E01_the_robot_revolution.srt"
},
{
title: "Lux",
season: 16,
episode: 2,
released: new Date("2025-04-19").toISOString(),
overview: "The quest to get Belinda home leads to an abandoned cinema, hiding a terrifying secret.",
thumbnail: "https://image.tmdb.org/t/p/original/lE1mRpBCaDq9rssSCC3b553Y8K5.jpg",
streamUrl: "https://archive.org/download/nw_S16/E02_lux.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E02_lux.srt"
},
{
title: "The Well",
season: 16,
episode: 3,
released: new Date("2025-04-26").toISOString(),
overview: "Far in the future, on a tough, brutal planet, a devastated mining colony has only one survivor. To discover the truth, the Doctor and Belinda must face absolute terror.",
thumbnail: "https://image.tmdb.org/t/p/original/loFL2KmyTrgcywSqo6WpTW2F48O.jpg",
streamUrl: "https://archive.org/download/nw_S16/E03_the_well.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E03_the_well.srt"
},
{
title: "Lucky Day",
season: 16,
episode: 4,
released: new Date("2025-05-03").toISOString(),
overview: "Ruby Sunday faces life back on earth without the Doctor. But when a dangerous new threat emerges, can Ruby and UNIT save her new boyfriend, Conrad, from the terrifying Shreek?",
thumbnail: "https://image.tmdb.org/t/p/original/43qDM6qRS8zFL7jZrmOhlL8jv42.jpg",
streamUrl: "https://archive.org/download/nw_S16/E04_lucky_day.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E04_lucky_day.srt"
},
{
title: "The Story and the Engine",
season: 16,
episode: 5,
released: new Date("2025-05-10").toISOString(),
overview: "In Lagos, a mysterious figure called the Barber rules. The Doctor finds stories hold real power as he confronts the Spider weaving a vengeful web.",
thumbnail: "https://image.tmdb.org/t/p/original/jpmT3xqquqmtrMlQntYFjpKpGk7.jpg",
streamUrl: "https://archive.org/download/nw_S16/E05_the_story_and_the_engine.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E05_the_story_and_the_engine.srt"
},
{
title: "The Interstellar Song Contest",
season: 16,
episode: 6,
released: new Date("2025-05-17").toISOString(),
overview: "The Doctor's mission to return Belinda to Earth brings them to a space station's song competition. What starts as entertainment turns into a fight for survival.",
thumbnail: "https://image.tmdb.org/t/p/original/nAXXyLovP6qKdItYFQ5JyLKzHeL.jpg",
streamUrl: "https://archive.org/download/nw_S16/E06_the_interstellar_song_contest.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E06_the_interstellar_song_contest.srt"
},
{
title: "Wish World",
season: 16,
episode: 7,
released: new Date("2025-05-24").toISOString(),
overview: "Traps are sprung and old enemies unite as the Doctor and Belinda finally arrive home to find a very different world. Can the Doctor see the truth before midnight arrives?",
thumbnail: "https://image.tmdb.org/t/p/original/9oaHWRIjavUsfgCe9Reme5pFJry.jpg",
streamUrl: "https://archive.org/download/nw_S16/E07_wish_world.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E07_wish_world.srt"
},
{
title: "The Reality War",
season: 16,
episode: 8,
released: new Date("2025-05-31").toISOString(),
overview: "Battle rages across the skies as the Unholy Trinity unleash their deadly ambition. The Doctor, Belinda and Ruby have to risk everything in the quest to save one innocent life.",
thumbnail: "https://image.tmdb.org/t/p/original/wH0kqIi838xwXG6Vq1tu7YZEeuQ.jpg",
streamUrl: "https://archive.org/download/nw_S16/E08_the_reality_war.mp4",
subtitleUrl: "https://archive.org/download/nw_S16/E08_the_reality_war.srt"
}
];

module.exports = episodes;
