// Single source of truth for reviews used across the site.
// Edit/add reviews here and ALL carousels will update.
(function () {
  'use strict';

  // Format: { quote: string, meta: string, stars?: number }
  // meta examples: "Name — Google", "Name, City — Yelp", "Name — Houzz"
  window.JAC_REVIEWS = [
    // Google
    {
      quote: 'Andrea gave me instant direction and helped me make the changes my kitchen needed.',
      meta: 'Tina Staffon — Google',
      stars: 5,
    },
    {
      quote:
        "JAC's knowledge, industry connections, and respect for budgets was a game-changer for our 1920's house renovation.",
      meta: 'Vincent Cullinan, Los Angeles — Google',
      stars: 5,
    },
    {
      quote:
        'Every piece of this house is custom designed from floors to walls. Even the books and plants were their choice.',
      meta: 'Stuart Gross — Google',
      stars: 5,
    },
    {
      quote:
        'Good people, great design, listens to your needs. They can do it all from remodels to fully furnishing your spaces.',
      meta: 'Stancy Tomlinson — Google',
      stars: 5,
    },
    {
      quote:
        'Impeccable taste down to every detail. Great communication throughout—we always knew what was going on.',
      meta: 'Holly Kurtz — Google',
      stars: 5,
    },
    {
      quote:
        'They transformed my outdated living space into a fabulous modern place I love to entertain in.',
      meta: 'Madison Pollack — Google',
      stars: 5,
    },
    {
      quote:
        'They listened closely and worked collaboratively. Documentation was clear, everything done on time.',
      meta: 'Les Hine — Google',
      stars: 5,
    },
    {
      quote: 'Tim helped make my space a sanctuary—a place I could feel comfortable and at peace.',
      meta: 'Andrew Watman — Google',
      stars: 5,
    },
    {
      quote:
        'Andrea was super responsive, generous with her time and helpful. I really appreciate her kindness.',
      meta: 'Yael Saidoff — Google',
      stars: 5,
    },
    {
      quote: 'Tim is amazing. He helped us take our very dated bathroom from drab to FAB!',
      meta: 'KevDave Davison — Google',
      stars: 5,
    },
    {
      quote: 'Great designers in LA. I worked with the JAC team on my home design.',
      meta: 'Madison Houseworth-Skaggs — Google',
      stars: 5,
    },

    // Yelp
    {
      quote:
        'They worked within my budget and were enormously gracious about it. My canyon home office is now my favorite room.',
      meta: 'Miriam B., Santa Monica — Yelp',
      stars: 5,
    },
    {
      quote:
        'Complete condo renovation from start to finish. Very collaborative, and brought great ideas we would have never thought of.',
      meta: 'Les H., Los Angeles — Yelp',
      stars: 5,
    },
    {
      quote:
        'They worked on our vacation home. Made everything easy and polished. Super responsive—we especially loved their wallpaper selections.',
      meta: 'Daisy H., Pasadena — Yelp',
      stars: 5,
    },
    {
      quote:
        'They created the home of our dreams. Truly understood our vision and nailed the wow factor in every room.',
      meta: 'Chaya S., Los Angeles — Yelp',
      stars: 5,
    },
    {
      quote:
        'Transformed our Hollywood Hills house. They tie everything together and make it look fabulous.',
      meta: 'Ray B., Los Angeles — Yelp',
      stars: 5,
    },
    {
      quote:
        'Excellent customer service, expertise and professionalism. Highly recommend for projects big and small.',
      meta: 'Suzsanna P., Los Angeles — Yelp',
      stars: 5,
    },
    {
      quote:
        "They made over my daughter's bedroom from little girl to chic tween. Way beyond our expectations and within budget.",
      meta: 'Deborah S., Los Angeles — Yelp',
      stars: 5,
    },
    {
      quote:
        'They listen and care about who you are. Your space reflects your lifestyle. Beautiful and unique items—not generic.',
      meta: 'Molly P., Santa Monica — Yelp',
      stars: 5,
    },
    {
      quote:
        'Complete Marina del Rey remodel. Consultative approach, worked within budget, reasonable fees. Fun to work with!',
      meta: 'Michael P., Venice — Yelp',
      stars: 5,
    },

    // Houzz
    {
      quote: 'Working with them from initial design, product sourcing and installation was a dream.',
      meta: 'Client Review — Houzz',
      stars: 5,
    },
    {
      quote:
        'They transformed my patio into an outdoor sanctuary and my family room into a contemporary yet kid-friendly space.',
      meta: 'Client Review — Houzz',
      stars: 5,
    },
    {
      quote:
        'Andrea has incredible taste and listened to my needs. Every decision that stretched my comfort zone turned out magnificent.',
      meta: 'kenneallyd — Houzz',
      stars: 5,
    },
    {
      quote:
        'The most professional, helpful and organized team. They elevate your style into something magical and beautiful.',
      meta: 'Michelle — Houzz',
      stars: 5,
    },
    {
      quote:
        'Helped us navigate fixtures, tiles, vanities, and paint for all four bathrooms. Made them look like magazine features.',
      meta: 'monica78 — Houzz',
      stars: 5,
    },
    {
      quote:
        'Professional, prompt, beautiful work. Worked within budget and went out of their way to make our house ready for holidays.',
      meta: 'lululemom — Houzz',
      stars: 5,
    },
    {
      quote:
        'They embraced my modern meets boho style and pulled it all together professionally. Fabulous eye and immaculate taste.',
      meta: 'Holly K. — Houzz',
      stars: 5,
    },
    {
      quote:
        'Serious professionals with excellent project management. No egos—always about a great end product and client satisfaction.',
      meta: 'kshamamehra — Houzz',
      stars: 5,
    },
    {
      quote:
        'Friendly team that understood exactly the look I wanted. All deadlines met and came in on budget.',
      meta: 'charleswalder — Houzz',
      stars: 5,
    },
    {
      quote:
        'Venice cottage remodel. Strong teamwork attitude, knowledgeable insight, and finishing touches on time and within budget.',
      meta: 'Dodd Holsapple, Dodd-Art Inc. — Houzz',
      stars: 5,
    },
    {
      quote:
        'Marina Del-Rey 3-story remodel. Very professional with attention to details and high aesthetic eye. Budget conscious with high customer service.',
      meta: 'Creative Builders — Houzz',
      stars: 5,
    },
    {
      quote:
        'Talented, creative, super fun to work with. Developed a color scheme that felt current and reflected us as individuals.',
      meta: 'shannie43 — Houzz',
      stars: 5,
    },
  ];
})();

