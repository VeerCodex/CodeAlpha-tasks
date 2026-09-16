const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_USERS = [
  {
    id: "usr-demo",
    name: "Veernarayan",
    handle: "veernarayan",
    email: "demo@codealpha.com",
    bio: "Full Stack Developer 💻 Building scalable web architectures at CodeAlpha Internship 🚀 Passionate about clean code and UI/UX.",
    location: "Bengaluru, India",
    website: "https://codealpha.tech",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    followers: ["usr-2", "usr-3", "usr-4"],
    following: ["usr-2", "usr-3"],
    joinedDate: "September 2026"
  },
  {
    id: "usr-2",
    name: "Aarav Sharma",
    handle: "aarav_dev",
    email: "aarav@codealpha.com",
    bio: "Frontend Engineer & Design System Crafter 🎨 Exploring micro-animations and typography.",
    location: "Mumbai, India",
    website: "https://github.com/aarav",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
    followers: ["usr-demo", "usr-3"],
    following: ["usr-demo"],
    joinedDate: "August 2026"
  },
  {
    id: "usr-3",
    name: "Sneha Patel",
    handle: "sneha_codes",
    email: "sneha@codealpha.com",
    bio: "Cloud & DevOps Architect ☁️ Docker, Node.js & Kubernetes enthusiast. Building in public.",
    location: "Pune, India",
    website: "https://sneha.dev",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    followers: ["usr-demo"],
    following: ["usr-demo", "usr-2"],
    joinedDate: "July 2026"
  },
  {
    id: "usr-4",
    name: "Rohan Verma",
    handle: "rohan_ai",
    email: "rohan@codealpha.com",
    bio: "AI/ML Enthusiast 🧠 Exploring transformer architectures and generative applications.",
    location: "Delhi, India",
    website: "https://rohan.ai",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    followers: ["usr-demo"],
    following: ["usr-demo"],
    joinedDate: "June 2026"
  }
];

const INITIAL_POSTS = [
  {
    id: "post-1",
    authorId: "usr-demo",
    content: "Thrilled to share that I have officially kicked off my Full Stack Development Internship at @CodeAlpha! 🚀 Currently engineering interactive web apps with Node.js, Express, and modern frontend design systems. Hard work pays off! #CodeAlpha #FullStack #WebDev #BuildInPublic",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
    tags: ["CodeAlpha", "FullStack", "WebDev", "BuildInPublic"],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: ["usr-2", "usr-3", "usr-4"],
    comments: [
      {
        id: "comm-1",
        authorId: "usr-2",
        authorName: "Aarav Sharma",
        authorHandle: "aarav_dev",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        content: "Huge congratulations Veernarayan! The UI looks incredibly slick!",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "comm-2",
        authorId: "usr-3",
        authorName: "Sneha Patel",
        authorHandle: "sneha_codes",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        content: "Keep building awesome stuff! Excited to see the final presentation 👏",
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    id: "post-2",
    authorId: "usr-2",
    content: "Late night desk setup upgrade ⚡ Switched to a 75% tactile mechanical keyboard and screen lightbar. Coding ergonomics make a massive difference for long programming marathons. What does your current setup look like? #DeskSetup #Developer #TechLife",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
    tags: ["DeskSetup", "Developer", "TechLife"],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    likes: ["usr-demo", "usr-3"],
    comments: [
      {
        id: "comm-3",
        authorId: "usr-demo",
        authorName: "Veernarayan",
        authorHandle: "veernarayan",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        content: "That keyboard looks clean! Which switches are you using?",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  },
  {
    id: "post-3",
    authorId: "usr-3",
    content: "Just deployed a distributed microservice cluster using Docker and Node.js. Zero downtime deployments and sub-50ms latency response times! ☁️ Always test your failovers before going live. #CloudEngineering #DevOps #NodeJS",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
    tags: ["CloudEngineering", "DevOps", "NodeJS"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likes: ["usr-demo", "usr-2", "usr-4"],
    comments: []
  }
];

function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    const seededUsers = INITIAL_USERS.map(u => ({
      ...u,
      passwordHash: demoPasswordHash
    }));

    const initialData = {
      users: seededUsers,
      posts: INITIAL_POSTS,
      hashtags: [
        { tag: "CodeAlpha", count: 184 },
        { tag: "FullStack", count: 129 },
        { tag: "WebDev", count: 96 },
        { tag: "BuildInPublic", count: 83 },
        { tag: "JavaScript", count: 72 }
      ]
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

const db = {
  getPosts(filter = 'all', currentUserId = null) {
    const data = readDb();
    let posts = [...data.posts];

    if (filter === 'following' && currentUserId) {
      const user = data.users.find(u => u.id === currentUserId);
      const followingIds = user ? [...user.following, user.id] : [currentUserId];
      posts = posts.filter(p => followingIds.includes(p.authorId));
    } else if (filter === 'trending') {
      posts.sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length));
    } else {
      // 'all' default - newest first
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Attach author details & isLiked flag
    return posts.map(p => {
      const author = data.users.find(u => u.id === p.authorId) || {
        name: "Unknown User",
        handle: "anonymous",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Anon"
      };

      const isLiked = currentUserId ? p.likes.includes(currentUserId) : false;
      const isFollowingAuthor = (currentUserId && currentUserId !== p.authorId)
        ? (data.users.find(u => u.id === currentUserId)?.following.includes(p.authorId) || false)
        : false;

      return {
        ...p,
        author: {
          id: author.id,
          name: author.name,
          handle: author.handle,
          avatar: author.avatar
        },
        likesCount: p.likes.length,
        commentsCount: p.comments.length,
        isLiked,
        isFollowingAuthor
      };
    });
  },

  getPostById(postId, currentUserId = null) {
    const data = readDb();
    const post = data.posts.find(p => p.id === postId);
    if (!post) return null;

    const author = data.users.find(u => u.id === post.authorId);
    return {
      ...post,
      author,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: currentUserId ? post.likes.includes(currentUserId) : false
    };
  },

  createPost(postData) {
    const data = readDb();
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: postData.authorId,
      content: postData.content,
      image: postData.image || null,
      tags: postData.tags || [],
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    data.posts.unshift(newPost);
    writeDb(data);
    return this.getPostById(newPost.id, postData.authorId);
  },

  toggleLike(postId, userId) {
    const data = readDb();
    const post = data.posts.find(p => p.id === postId);
    if (!post) return null;

    const index = post.likes.indexOf(userId);
    let isLiked = false;

    if (index === -1) {
      post.likes.push(userId);
      isLiked = true;
    } else {
      post.likes.splice(index, 1);
      isLiked = false;
    }

    writeDb(data);
    return { isLiked, likesCount: post.likes.length };
  },

  addComment(postId, commentData) {
    const data = readDb();
    const post = data.posts.find(p => p.id === postId);
    if (!post) return null;

    const author = data.users.find(u => u.id === commentData.authorId) || {
      name: "Guest",
      handle: "guest",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Guest"
    };

    const newComment = {
      id: `comm-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorHandle: author.handle,
      authorAvatar: author.avatar,
      content: commentData.content,
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    writeDb(data);
    return newComment;
  },

  getUserById(userId, currentUserId = null) {
    const data = readDb();
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;

    const userPosts = data.posts.filter(p => p.authorId === user.id);
    const isFollowing = currentUserId && currentUserId !== user.id
      ? user.followers.includes(currentUserId)
      : false;

    return {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      banner: user.banner,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: userPosts.length,
      isFollowing,
      joinedDate: user.joinedDate
    };
  },

  getUserByEmail(email) {
    const data = readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  createUser(userData) {
    const data = readDb();
    const handle = userData.handle || userData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      handle: handle,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      bio: userData.bio || "Hello, I am using PulseAlpha!",
      location: "India",
      website: "",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      banner: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
      followers: [],
      following: [],
      joinedDate: "September 2026"
    };

    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },

  toggleFollow(targetUserId, currentUserId) {
    if (targetUserId === currentUserId) return null;
    const data = readDb();

    const targetUser = data.users.find(u => u.id === targetUserId);
    const currentUser = data.users.find(u => u.id === currentUserId);

    if (!targetUser || !currentUser) return null;

    const followerIdx = targetUser.followers.indexOf(currentUserId);
    const followingIdx = currentUser.following.indexOf(targetUserId);
    let isFollowing = false;

    if (followerIdx === -1) {
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      isFollowing = true;
    } else {
      targetUser.followers.splice(followerIdx, 1);
      currentUser.following.splice(followingIdx, 1);
      isFollowing = false;
    }

    writeDb(data);
    return {
      isFollowing,
      targetFollowersCount: targetUser.followers.length,
      currentFollowingCount: currentUser.following.length
    };
  },

  getWhoToFollow(currentUserId = null) {
    const data = readDb();
    let suggestions = data.users.filter(u => u.id !== currentUserId);
    if (currentUserId) {
      const currentUser = data.users.find(u => u.id === currentUserId);
      if (currentUser) {
        suggestions = suggestions.filter(u => !currentUser.following.includes(u.id));
      }
    }
    return suggestions.slice(0, 3).map(u => ({
      id: u.id,
      name: u.name,
      handle: u.handle,
      avatar: u.avatar,
      bio: u.bio
    }));
  },

  getTrendingTags() {
    const data = readDb();
    return data.hashtags;
  }
};

initDb();

module.exports = db;
