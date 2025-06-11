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
}

];

module.exports = episodes;
