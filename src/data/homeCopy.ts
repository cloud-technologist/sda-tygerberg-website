import type { Lang } from './site';

export type WeekEntry = { day: string; name: string; time: string };

export type HomeCopy = {
  navAbout: string;
  navBeliefs: string;
  navMinistries: string;
  navVisit: string;
  navConnect: string;
  navResources: string;
  navDirections: string;
  give: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  ctaVisit: string;
  ctaWatch: string;
  liveLabel: string;
  tabReplay: string;
  timesLabel: string;
  week: WeekEntry[];
  weekHeading: string;
  weekSub: string;
  aboutHeading: string;
  aboutSub: string;
  beliefsHeading: string;
  beliefsSub: string;
  beliefRead: string;
  beliefTitles: string[];
  beliefDescs: string[];
  involvedHeading: string;
  connectTitle: string;
  connectDesc: string;
  studyTitle: string;
  studyDesc: string;
  giveTitle: string;
  giveDesc: string;
  giveCta: string;
  resourcesHeading: string;
  resourcesSub: string;
  resLesson: string;
  resHomebase: string;
  resAwr: string;
  visitEyebrow: string;
  visitHeading: string;
  visitAddressLabel: string;
  copyAddress: string;
  addressCopied: string;
  directionsCta: string;
  appleMapsCta: string;
  mapTapHint: string;
  footerBlurb: string;
  footerVisit: string;
  footerTimesLabel: string;
};

export const homeCopy: Record<Lang, HomeCopy> = {
  af: {
    navAbout: 'Oor Ons',
    navBeliefs: 'Wat Ons Glo',
    navMinistries: 'Hierdie Week',
    navVisit: 'Besoek',
    navConnect: 'Verbind',
    navResources: 'Hulpbronne',
    navDirections: 'Aanwysings',
    give: 'Skenk',
    heroEyebrow: 'Sewendedag Adventiste Kerk · Tygerberg',
    heroTitle: 'Vind rus, hoop en genesing in Jesus',
    heroSub:
      'Sluit elke Sabbat by ons aan in Boston, Kaapstad — of kyk lewendig van waar jy ook al is.',
    ctaVisit: "Beplan 'n Besoek",
    ctaWatch: 'Kyk Lewendig',
    liveLabel: 'LEWENDIG',
    tabReplay: 'Onlangse Diens',
    timesLabel: 'Sabbatdienste',
    week: [
      { day: 'Dinsdag', name: 'Biduur', time: '19:00 – 20:00' },
      { day: 'Woensdag', name: 'Bybelstudie', time: '19:00 – 21:00' },
      { day: 'Donderdag', name: 'Volleybal', time: '19:00 – 21:00' },
      { day: 'Vrydag', name: 'Junior Jeug', time: '19:00 – 21:00' },
    ],
    weekHeading: 'Hierdie week by die kerk',
    weekSub: 'Almal welkom — bring gerus ’n vriend saam.',
    aboutHeading: 'Ontmoet ons departementshoofde',
    aboutSub: 'Die mense wat ons gemeente se bedieninge lei.',
    beliefsHeading: 'Wat ons glo',
    beliefsSub: 'Die 28 fundamentele leerstellings, gegroepeer in ses temas wat ons geloof in Jesus vorm.',
    beliefRead: 'Lees al 28 leerstellings →',
    beliefTitles: ['God', 'Mensdom', 'Verlossing', 'Die Kerk', 'Daaglikse Lewe', 'Herstel'],
    beliefDescs: [
      'Die Skrif as die Woord van God, die Drie-eenheid, en die karakter van die Vader, Seun en Heilige Gees.',
      'Die skepping en die aard van die mens, geskape na die beeld van God.',
      'Die groot stryd, die lewe, dood en opstanding van Christus, en die ervaring van verlossing.',
      'Die kerk en haar sending, eenheid in die liggaam, die doop en die Nagmaal.',
      'Die Sabbat, rentmeesterskap, die gawe van profesie, die gesin en Christelike lewe.',
      'Christus se diens in die hemelse heiligdom, sy wederkoms, die opstanding en die nuwe aarde.',
    ],
    involvedHeading: 'Raak betrokke',
    connectTitle: 'Verbind',
    connectDesc: "Kry 'n antwoord op jou vrae — ons stel jou aan die regte persoon voor.",
    studyTitle: 'Bybelstudies',
    studyDesc: "Vra 'n gratis Bybel- of doopstudie by jou tuiste aan.",
    giveTitle: 'Skenk',
    giveDesc: 'Ondersteun die bediening met jou tiendes en gawes via EFT.',
    giveCta: 'Bankbesonderhede',
    resourcesHeading: 'Voed jou geloof daagliks',
    resourcesSub: 'Amptelike Adventiste hulpbronne vir studie en aanbidding.',
    resLesson: 'Lesstudie Biblioteek',
    resHomebase: 'HomebaseTV Afrikaans',
    resAwr: 'AWR Afrikaans',
    visitEyebrow: 'Besoek Ons',
    visitHeading: 'Sluit by ons aan hierdie Sabbat',
    visitAddressLabel: 'Adres',
    copyAddress: 'Kopieer Adres',
    addressCopied: 'Gekopieer!',
    directionsCta: 'Kry Aanwysings',
    appleMapsCta: 'Maak oop in Apple Maps',
    mapTapHint: 'Tik om met die kaart te wisselwerk',
    footerBlurb: '’n Gemeente wat hoop, genesing en die liefde van Jesus met die Tygerberg-omgewing deel.',
    footerVisit: 'Besoek ons',
    footerTimesLabel: 'Dienstye',
  },
  en: {
    navAbout: 'About',
    navBeliefs: 'Beliefs',
    navMinistries: 'This Week',
    navVisit: 'Visit',
    navConnect: 'Connect',
    navResources: 'Resources',
    navDirections: 'Directions',
    give: 'Give',
    heroEyebrow: 'Seventh-day Adventist Church · Tygerberg',
    heroTitle: 'Find rest, hope and healing in Jesus',
    heroSub: 'Join us every Sabbath in Boston, Cape Town — or watch live from wherever you are.',
    ctaVisit: 'Plan a Visit',
    ctaWatch: 'Watch Live',
    liveLabel: 'LIVE',
    tabReplay: 'Latest Service',
    timesLabel: 'Sabbath Services',
    week: [
      { day: 'Tuesday', name: 'Prayer Meeting', time: '19:00 – 20:00' },
      { day: 'Wednesday', name: 'Bible Study', time: '19:00 – 21:00' },
      { day: 'Thursday', name: 'Volleyball', time: '19:00 – 21:00' },
      { day: 'Friday', name: 'Junior Youth', time: '19:00 – 21:00' },
    ],
    weekHeading: 'This week at church',
    weekSub: 'Everyone welcome — feel free to bring a friend.',
    aboutHeading: 'Meet our department heads',
    aboutSub: 'The people who lead our church ministries.',
    beliefsHeading: 'What we believe',
    beliefsSub: 'The 28 fundamental beliefs, grouped into six themes that shape our faith in Jesus.',
    beliefRead: 'Read all 28 beliefs →',
    beliefTitles: ['God', 'Humanity', 'Salvation', 'The Church', 'Daily Living', 'Restoration'],
    beliefDescs: [
      'Scripture as the Word of God, the Trinity, and the character of the Father, Son and Holy Spirit.',
      'Creation and the nature of humanity, made in the image of God.',
      'The great controversy, the life, death and resurrection of Christ, and the experience of salvation.',
      'The church and its mission, unity in the body, baptism and the Lord’s Supper.',
      'The Sabbath, stewardship, the gift of prophecy, family and Christian living.',
      'Christ’s ministry in the heavenly sanctuary, His second coming, the resurrection and the new earth.',
    ],
    involvedHeading: 'Get involved',
    connectTitle: 'Connect',
    connectDesc: 'Get an answer to your questions — we’ll introduce you to the right person.',
    studyTitle: 'Bible Studies',
    studyDesc: 'Request a free Bible study or baptismal study in your home.',
    giveTitle: 'Give',
    giveDesc: 'Support the ministry with your tithe and offerings via EFT.',
    giveCta: 'Banking details',
    resourcesHeading: 'Feed your faith daily',
    resourcesSub: 'Official Adventist resources for study and worship.',
    resLesson: 'Lesson Study Library',
    resHomebase: 'HomebaseTV Afrikaans',
    resAwr: 'AWR Afrikaans',
    visitEyebrow: 'Visit Us',
    visitHeading: 'Join us this Sabbath',
    visitAddressLabel: 'Address',
    copyAddress: 'Copy Address',
    addressCopied: 'Copied!',
    directionsCta: 'Get Directions',
    appleMapsCta: 'Open in Apple Maps',
    mapTapHint: 'Tap to interact with map',
    footerBlurb: 'A congregation sharing hope, healing and the love of Jesus with the Tygerberg community.',
    footerVisit: 'Visit us',
    footerTimesLabel: 'Service times',
  },
};
