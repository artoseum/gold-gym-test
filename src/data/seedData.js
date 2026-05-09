// A massive demo dataset to simulate a large active user base

const PEXELS_IMAGES = [
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/6551174/pexels-photo-6551174.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4720377/pexels-photo-4720377.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2204196/pexels-photo-2204196.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/6695228/pexels-photo-6695228.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4164844/pexels-photo-4164844.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/7991666/pexels-photo-7991666.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const CAPTIONS = [
  "Another day, another PR! Consistency is the only secret. 🚀",
  "Leg day destroyed me, but we'll be back stronger tomorrow! 🦵🔥",
  "Early morning grind. No excuses when it comes to your health.",
  "New gym gear feeling fresh! 👟 Ready to crush this session.",
  "Form over ego always. Taking it slow and focusing on the squeeze.",
  "Cardio done! 🏃‍♂️ 5km feels like a breeze now.",
  "Meal prep Sunday in full effect. Abs are made in the kitchen! 🥗",
  "Who else loves the feeling after a heavy deadlift session? 🏋️‍♀️",
  "Stretching and mobility work. Take care of your joints folks! 🧘‍♂️",
  "Bulk season is going well. Up 4kgs and strength is through the roof.",
  "Sometimes the hardest part is just showing up. Glad I did.",
  "Post-workout pump is unreal today. Happy Friday everyone!",
  "Core circuit to finish the week. My abs are on fire! 🔥",
  "Trying out the new machines at the Andheri branch. Top tier equipment!",
  "Hydration check! Drink your water people 💧",
  "Working on that mind-muscle connection. Slow and controlled.",
  "Grateful for this community keeping me accountable. Y'all rock! 🙌",
  "Chest day best day. Change my mind. 🦍",
  "Recovery day. Foam rolling is painful but necessary.",
  "Setting new goals for the month. Let's get to work! 📈"
];

const GYMS = ['andheri', 'bandra', 'powai', 'malad', 'connaught', 'saket', 'vasant', 'koramangala', 'indiranagar', 'whitefield', 'anna', 'velachery', 'banjara', 'jubilee', 'gachibowli', 'koregaon', 'hinjewadi'];

export const generateSeedData = () => {
  const users = {};
  const usernames = {};
  const memberships = {};
  const posts = [];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Generate 25 demo users
  for (let i = 1; i <= 25; i++) {
    const uid = `demo_user_${i}`;
    const name = `Demo User ${i}`;
    const username = `Athlete${i}_${Math.floor(Math.random() * 999)}`;
    const gymId = GYMS[Math.floor(Math.random() * GYMS.length)];

    users[uid] = {
      uid,
      displayName: name,
      email: `athlete${i}@demo.com`,
      phone: null,
      authMethod: 'Email',
      isAdmin: false,
      createdAt: now - Math.floor(Math.random() * 180) * dayMs,
      lastLogin: now - Math.floor(Math.random() * 5) * dayMs,
      registeredGym: gymId,
    };

    usernames[uid] = username;

    memberships[uid] = {
      uid,
      planId: 'annual',
      planName: 'Annual',
      price: 12999,
      startedAt: now - Math.floor(Math.random() * 100) * dayMs,
      expiresAt: now + 200 * dayMs,
      nextPayment: now + 200 * dayMs,
      status: 'active',
    };
  }

  // Generate 40 posts
  for (let i = 0; i < 40; i++) {
    const uid = `demo_user_${Math.floor(Math.random() * 25) + 1}`;
    const image = Math.random() > 0.3 ? PEXELS_IMAGES[Math.floor(Math.random() * PEXELS_IMAGES.length)] : null;
    const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
    const numLikes = Math.floor(Math.random() * 15);
    const numComments = Math.floor(Math.random() * 5);
    
    const likes = [];
    for (let j = 0; j < numLikes; j++) {
      const likerUid = `demo_user_${Math.floor(Math.random() * 25) + 1}`;
      if (!likes.includes(likerUid)) likes.push(likerUid);
    }

    const comments = [];
    for (let j = 0; j < numComments; j++) {
      const commenterUid = `demo_user_${Math.floor(Math.random() * 25) + 1}`;
      comments.push({
        id: `c_${i}_${j}`,
        uid: commenterUid,
        username: usernames[commenterUid],
        text: ["Great job!", "Keep it up 🔥", "Beast mode!", "Inspiring!", "Need this motivation!"][Math.floor(Math.random() * 5)],
        createdAt: now - Math.floor(Math.random() * 10) * dayMs,
      });
    }

    posts.push({
      id: `demo_post_${i}`,
      uid,
      username: usernames[uid],
      caption,
      imageData: image,
      likes,
      comments,
      createdAt: now - Math.floor(Math.random() * 30) * dayMs,
      deleted: false,
    });
  }

  // Sort posts by newest first
  posts.sort((a, b) => b.createdAt - a.createdAt);

  return { users, usernames, memberships, posts };
};
