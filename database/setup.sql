-- One deliberately shared public checklist; clients can change only checked.
create table public.bm01_sentences (
 id integer primary key check (id > 0),
 content text not null,
 checked boolean not null default false
);
alter table public.bm01_sentences enable row level security;
revoke all on public.bm01_sentences from public, anon, authenticated;
grant select on public.bm01_sentences to anon, authenticated;
grant update (checked) on public.bm01_sentences to anon, authenticated;
create policy bm01_sentences_shared_read on public.bm01_sentences for select to anon, authenticated using (true);
create policy bm01_sentences_shared_check on public.bm01_sentences for update to anon, authenticated using (true) with check (true);
insert into public.bm01_sentences (id,content) values
(1, 'My name is Elliot Semmelman and I am the B’nai Mitzvah Educator for Beth David.'),
(2, 'My job is to teach your Bar and Bat Mitzvah student the blessings, the prayers, the Torah and Haftorah readings, that make up what they will be doing on their Bnai Mitzvah day.'),
(3, 'At Beth David, that means that they will be standing up at the podium leading much of the service.'),
(4, 'So how do I prepare them for this day?'),
(5, 'At about the 10 months mark before their date, I talk to their Hebrew teacher to find out what their Hebrew reading level is.'),
(6, 'Sometimes, I evaluate the student’s level if a teacher’s report is not available.'),
(7, 'If the student’s Hebrew reading is pretty functional, I begin the formal training at 6 months from their Bnai Mitzvah date.'),
(8, 'If the student needs extra help, I recommend training at 8 months before.'),
(9, 'Whether it is at the 6 or 8 months mark, I then have an initial meeting with the student and his or her family to discuss the path we will take until the Bnai Mitzvah date and any questions that you or your child have.'),
(10, 'At that meeting, I talk about what I provide the student and what my expectations are of the student during this time.'),
(11, 'So what is it that I provide?'),
(12, 'I provide training for all the prayers that they will be chanting or reading.'),
(13, 'I will provide training for the reading of their Torah and Haftorah portions.'),
(14, 'I will also coach them on their English reading, helping them with any difficult words that Bnai students typically need assistance with.'),
(15, 'I have found that having 30 minute sessions once a week is a sufficient amount of time to adequately prepare a student but that can be changed if the parents and I think that’s necessary.'),
(16, 'The sessions are typically over zoom but can be in person if the family would like them to be.'),
(17, 'Even if our sessions are over zoom occasionally I will come in person just to go over things or to give out resources that otherwise I can’t do.'),
(18, 'If I find during the training that I need to increase the frequency of sessions I will recommend we do so.'),
(19, 'In the first month, I review the prayers and blessings with the student making sure that they can read or chant them well.'),
(20, 'Students usually have learned the prayers and blessings in the Jewish school before I see them.'),
(21, 'I then proceed with the Torah reading training.'),
(22, 'Beth David requires that Bnai Mitzvah students at a minimum have 3 aliyot and read 3 verses per aliyah.'),
(23, 'An Aliyah is when a person comes up to the Bimah to recite the Torah blessings and then several verses from the Torah are read.'),
(24, 'The way I teach students to read Torah, I typically ask them to read the Torah verse first with vowels, and when that reading is fluent, I introduce the Tamim or Trope or musical notes that go along with that reading.'),
(25, 'The trope consists of little symbols that indicate the melody that should be used when reading verses.'),
(26, 'The notes are usually grouped into phrases and while training the student I also educate them on the specific melodies they correspond to.'),
(27, 'After several repetitions and when I feel they are ready, I then have them read the Torah script.'),
(28, 'I don’t actually take out the Torah but provide copies of their Torah reading for them.'),
(29, 'The Torah script is more difficult to chant because it doesn’t contain vowels or punctuation and its letters are not the letters that they are used to.'),
(30, 'However, they are very similar and after several repetitions, the student is able to chant the verse from the Torah.'),
(31, 'I proceed with this process until all the verses for all the aliyot are mastered.'),
(32, 'I then move on to teach the Haftorah verses to the student.'),
(33, 'Students typically recite 3 verses of Haftorah.'),
(34, 'The haftorah is an established section read from the prophets that pertains to the Torah portion for that week.'),
(35, 'The bad news is that they have to learn a different melody for their haftorah but the good news is that they can read it with the vowels and the notes and the lettering is normal lettering – not the Torah script lettering.'),
(36, 'As their Bnai Mitzvah date nears, I have the student go to the Sanctuary up on the Bimah with microphone on, and go through the service and the Torah and Haftorah readings.'),
(37, 'This gives the Bnai Mitzvah student the opportunity to learn and practice what it will feel like on their actual day.'),
(38, 'I point out anything they need to work on and also give “stage” pointers such as telling them to go slower, or to wait for the congregation to turn to the page, or to look at the congregation once in a while.'),
(39, 'For resources, I provide Bnai Mitzvah students a notebook that contains the service, the Torah and Haftorah readings, and any supplemental material such as the Torah and Haftorah portions in English.'),
(40, 'They also get an online program customized for each of them that lists a Timeline and status of their progress, their Torah reading with vowels, with the Trope, and with the Torah script, audio of their Torah verses, their Haftorah reading with audio, and the blessings and prayers of the service and their audio.'),
(41, 'Speaking of things digitally, we have the capability to customize programs to your students'' needs on demand so that if they need help with something specific like distinguishing common looking letters in Hebrew for example, a tutorial can quickly be created to help them with that.'),
(42, 'Initially, I ask students to spend about 30 minutes a week going over what was learned at a session and then increase that to about 10 - 15 mins. every day at about 2 months out.'),
(43, 'These guidelines depend much on the student.'),
(44, 'And I of course will be there on their Bnai Mitzvah day for moral and if needed material support.'),
(45, 'What you can do is let me know if there are any issues that I should be aware of such as if your child will be away for an extended amount of time like going to camp, or if you''re concerned that he or she is falling behind.'),
(46, 'Do you have any questions?');
