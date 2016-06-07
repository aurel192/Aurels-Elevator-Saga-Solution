
- [x] Legrégebben várakozó emeletnél a legújabbat írja ki. Solved, de gyakran nem nullázódik, és ha nullázódik is visszakerül a régi érték
- [x] NumberOfElevators, NumberOfFloors

- [x] eventeknél _.each helyett for, és paraméterként átadni sorszámot. (maradt az each, és index)

- [x] counter++; tömbben letárolni minden fontos infót.
  honnan hova hányan mennek
  hányan szálnak be a liftbe, ha sokan akkor őket először ki kell rakni hogy legyen hely
  
- [x] ButtonPressedOnFloor. melyik a legközelebb lévő lift, ami nincs tele,  SendLeastLoadedElevatorToFloor()
   - [ ] és DQ szerint elmegy az adott emelet mellett,
   - [ ] ha nincs ilyen akkor a legközelebbi lift kapja meg DQ átrendezés nélkül. direction is számít
   - [ ] Ha pl 5.en nyomják meg, és a Lift a 2.-on van, 4.re és 6.ra megy, akkor a DQ legyen 4,5,6 !

- [x] az updateben removeduplicates, és updnindicator ha van értelme. Invalid

- [x] passing floor: ha olyan emelet mellett megy el a lift ahol hivtak a liftet, akkor dq insert at
   - [ ] legoptimálisabb paraméter meghatározása (trial n error)

- [ ]  az ures lifteket azonnal kuldeni kell a hivo emeletekre

- [ ] log flush interval
- [ ] ha passing floor benne van a PF-ban, és oda küldöm akkor, azt kikéne venni a DQ-ból, vagy hátra tenni



