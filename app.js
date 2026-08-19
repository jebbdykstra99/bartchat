(function () {
  'use strict';

  const MOBILE_NAV_MQ = 900;
  const LS_USER = 'bartchat.user';
  const LS_LIKES = 'bartchat.likes';
  const LS_POSTS = 'bartchat.localPosts';



  const SITE_ID = 'bartchat';
  let fbAuth = null;
  let fbDb = null;
  let livePosts = [];
  let replyTo = null;
  try {
    firebase.initializeApp({
    apiKey: "AIzaSyD4CgKQTylEy03Lh9Uhe9UVloyrKaK3bdY",
    authDomain: "subx-skins.firebaseapp.com",
    projectId: "subx-skins",
    storageBucket: "subx-skins.firebasestorage.app",
    messagingSenderId: "869847405863",
    appId: "1:869847405863:web:26f902efb9a4ee0b7c0502"
    });
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
  } catch (e) { console.warn('subx-skins init', e); }

  function applyFbUser(user) {
    if (!user) return;
    const raw = user.displayName || (user.email || 'member').split('@')[0];
    currentUser = {
      uid: user.uid,
      name: raw,
      handle: String(raw).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'member',
      bio: '',
      live: true
    };
    saveJSON(LS_USER, currentUser);
    closeAuth();
    renderSidebarAuth();
    syncProfile();
  }
  function mapLive(doc) {
    const d = doc.data() || {};
    const ms = d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : Date.now();
    return {
      id: doc.id,
      name: d.authorName || 'Member',
      handle: d.authorHandle || 'member',
      text: d.text || '',
      hours: Math.max(0, Math.round((Date.now() - ms) / 3600000)),
      likes: d.likeCount || 0,
      replies: d.replyCount || 0,
      followed: true,
      parentId: d.parentId || null,
      live: true
    };
  }
  function listenLivePosts() {
    if (!fbDb) return;
    fbDb.collection('posts').where('siteId', '==', SITE_ID).limit(80)
      .onSnapshot(function (snap) {
        livePosts = snap.docs.map(mapLive);
        renderFeed();
        if (currentUser) syncProfile();
      }, function (err) { console.warn('posts listen', err); });
  }
  if (fbAuth) {
    fbAuth.onAuthStateChanged(function (user) {
      if (user) applyFbUser(user);
      else if (currentUser && currentUser.live) {
        currentUser = null;
        saveJSON(LS_USER, null);
        renderSidebarAuth();
        syncProfile();
      }
    });
  }

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  const COLORS = ['#101820', '#0099d8', '#0077a8', '#d32f2f', '#2a3d4a', '#4a5c68'];

  const TRENDS = [
    { tag: 'Delay', headline: 'Yellow line crawling through the Tube', snippet: 'Twenty-two minutes at Embarcadero and counting. People are walking Market instead.', meta: 'Trending on BART' },
    { tag: 'Mixup', headline: 'Announcements say Richmond, signs say Daly City', snippet: 'Train identity crisis at Montgomery. Half the car got off. Half should have.', meta: 'Platform chatter' },
    { tag: 'Clipper', headline: 'Fare gates rejecting cards at Powell', snippet: 'Tap, red X, try the next gate. Everyone is doing the same dance.', meta: 'Fare mixup' },
    { tag: 'Elevator', headline: 'Powell Street elevator out again', snippet: 'Stairs are a contact sport. Strollers and bikes stacking at the landing.', meta: 'Station report' },
    { tag: 'Last train', headline: 'Millbrae cutoff is a sprint tonight', snippet: 'If you miss this one you are on a bus and a prayer. Platform is already anxious.', meta: 'End of service' },
    { tag: 'Transfer', headline: 'MacArthur bottleneck on the hour', snippet: 'Three lines, one platform, two announcements that disagree. Classic transfer.', meta: 'Oakland side' },
    { tag: 'Bike car', headline: 'Scooters in the bike car, bikes in the aisle', snippet: 'The first car is a storage unit. Bring patience, not a frame.', meta: 'Car 1 discourse' },
    { tag: 'Crush', headline: 'Civic Center packed, next train 12 min', snippet: 'Doors cycling, nobody moving. The following train is not empty either.', meta: 'Peak hour' }
  ];

  const PLACES = [
    { tag: 'Station', title: 'Embarcadero', snippet: 'Transbay Tube mouth. Delays start here and travel both directions.' },
    { tag: 'Station', title: 'Powell Street', snippet: 'Elevators, fare gates, and the tourist crush on the stairs.' },
    { tag: 'Station', title: '12th Street Oakland', snippet: 'Transfers, three levels, and announcements that argue with the signs.' },
    { tag: 'Station', title: 'MacArthur', snippet: 'The bottleneck. Yellow, orange, red — pick a platform and hope.' },
    { tag: 'Station', title: 'West Oakland', snippet: 'Last stop before the Tube. Trains bunch. Doors stay open too long.' },
    { tag: 'Station', title: 'Millbrae', snippet: 'Peninsula end of the line. Last-train energy after 11.' },
    { tag: 'Station', title: 'Civic Center', snippet: 'Peak crush. The next train is always twelve minutes out.' },
    { tag: 'Station', title: '24th Street Mission', snippet: 'Platform mixups and the train that left while you were on the wrong side.' }
  ];

  const TOPICS = [
    { tag: 'Delay', title: 'Yellow / Orange / Red', snippet: 'Minutes on the board vs. minutes in real life. Bring a book.' },
    { tag: 'Clipper', title: 'Fare gates & taps', snippet: 'Red X, try the next gate, pretend this is normal.' },
    { tag: 'Elevators', title: 'Out of service', snippet: 'Powell, 19th, MacArthur — the stairs become the plan.' },
    { tag: 'Mixup', title: 'Platform changes', snippet: 'Announcements vs. signs vs. the train that actually shows up.' },
    { tag: 'Last train', title: 'End of service', snippet: 'Millbrae, Richmond, Antioch. Miss it and you are on a night bus.' },
    { tag: 'Bike car', title: 'Car 1', snippet: 'Bikes, scooters, and the person who sat in the designated space.' }
  ];

  const SEED = [
    { id: 'p1', name: 'Pittsburg Bay', handle: 'pittsburgbay', text: 'Boarded at MacArthur thinking Millbrae. Doors closed. Richmond. The map on the car still said yellow. I am in El Cerrito energy and I have a meeting at Montgomery.', hours: 1, likes: 318, replies: 52, followed: true, snippet: { handle: 'millbraemix', text: 'This is a weekly sport. Look at the destination before you sit.' } },
    { id: 'p2', name: 'Dublin Wait', handle: 'dublinwait', text: 'Dublin/Pleasanton showing 22 minutes. Platform is a parking lot of people checking the app that is also lying. If you are still at West Dublin, stay on the bus.', hours: 2, likes: 241, replies: 38, followed: true },
    { id: 'p3', name: 'Tube Rider', handle: 'transbaytube', text: 'Transbay Tube, no bars, AC doing a rumor. We have been between West Oakland and Embarcadero long enough to learn the emergency sticker by heart.', hours: 3, likes: 189, replies: 27, followed: true, snippet: { handle: 'embarcdelay', text: 'Same train. I counted the lights.' } },
    { id: 'p4', name: 'Powell Up', handle: 'powellup', text: 'Powell St elevator out. Again. Two flights of stairs with a suitcase and a stroller traffic jam. This is not a surprise. It is a lifestyle.', hours: 4, likes: 276, replies: 41, followed: false },
    { id: 'p5', name: 'Gate Jam', handle: 'gatejam', text: 'Montgomery fare gate ate my Clipper, flashed red, then jammed open for everyone behind me. Agent booth empty. Honor system with extra steps.', hours: 5, likes: 154, replies: 22, followed: true },
    { id: 'p6', name: 'Bike Car West', handle: 'bikecarwest', text: 'Bike car on the Dublin train was a wall of handlebars. I skipped two trains. If you bring a cargo bike at 5:15 you are the delay.', hours: 6, likes: 97, replies: 19, followed: false, snippet: { handle: 'dublinwait', text: 'Saw you on the platform. The next one was worse.' } },
    { id: 'p7', name: 'Platform Heat', handle: 'platformheat', text: 'Concord platform in August is a griddle. No shade, no breeze, the arriving train is also warm. Warm-platform summer is undefeated.', hours: 7, likes: 203, replies: 16, followed: true },
    { id: 'p8', name: 'Millbrae Mix', handle: 'millbraemix', text: 'Richmond vs Millbrae is not a mixup, it is a trap. Same platform, opposite lives. I now photograph the headsign like a crime scene.', hours: 8, likes: 412, replies: 67, followed: true, snippet: { handle: 'pittsburgbay', text: 'I did this today. We are a support group.' } },
    { id: 'p9', name: 'Antioch End', handle: 'antiochend', text: 'Yellow line crawled from Pittsburg Center like it owed the rails money. Four stops. Twenty-eight minutes. I could have walked the highway faster and I would not have.', hours: 9, likes: 88, replies: 11, followed: false },
    { id: 'p10', name: '19th Wait', handle: '19thwait', text: '19th St Oakland is shoulder-to-shoulder and the next Richmond is “arriving” for the third time. If you hear the tones, do not celebrate yet.', hours: 11, likes: 131, replies: 18, followed: true },
    { id: 'p11', name: 'Colma Skip', handle: 'colmaskip', text: 'Train skipped Colma without a word. Platform full of people who had already tagged in. Someone yelled at the operator through a closed door. Fair.', hours: 13, likes: 176, replies: 29, followed: false },
    { id: 'p12', name: 'SFO Air', handle: 'sfoairbart', text: 'SFO station is not the terminal. It is a walk, an elevator lottery, and a family arguing with a fare machine. Budget forty minutes or miss the flight.', hours: 15, likes: 220, replies: 34, followed: true },
    { id: 'p13', name: 'Warm Springs', handle: 'warmspringsend', text: 'Green line to Warm Springs saying 18 min, then 12, then 18 again. Berryessa people are sitting on the floor like this is a delayed flight.', hours: 16, likes: 74, replies: 8, followed: false },
    { id: 'p14', name: 'Civic Gate', handle: 'civicgate', text: 'Civic Center fare gates are eating Clipper cards and coughing them back. I tapped three times. The fourth was a jump. Not proud. Not sorry.', hours: 18, likes: 109, replies: 21, followed: true, snippet: { handle: 'gatejam', text: 'Montgomery did the same thing an hour ago.' } },
    { id: 'p15', name: 'Lake Merritt Up', handle: 'lakemerrittup', text: 'Lake Merritt elevator smells like a science project and one of the two is out. Stairs it is. My knees have opinions.', hours: 20, likes: 61, replies: 7, followed: false },
    { id: 'p16', name: 'West Oak Jump', handle: 'westoakjump', text: 'West Oakland transfer is a stampede if the Dublin train and the Tube train hit at once. I lost a shoe. I found the shoe. I missed the train.', hours: 22, likes: 198, replies: 24, followed: true },
    { id: 'p17', name: 'Berryessa Clock', handle: 'berryessawait', text: 'Berryessa platform clock is seven minutes fast or the train is seven minutes slow. Either way I am lying to my calendar.', hours: 24, likes: 55, replies: 6, followed: false },
    { id: 'p18', name: 'Embarc Delay', handle: 'embarcdelay', text: 'Embarcadero bottleneck. Three lines, one platform mood. Someone is eating chips like we are not in a metal tube under Market.', hours: 26, likes: 147, replies: 31, followed: true, snippet: { handle: 'transbaytube', text: 'That was me. Salt and vinegar. No regrets.' } },
    { id: 'p19', name: 'Fremont Car', handle: 'fremontcar', text: 'Fremont train with no AC and every window locked. Warm-platform summer followed us into the car. I am a melted Clipper card.', hours: 28, likes: 92, replies: 13, followed: false },
    { id: 'p20', name: 'North Berk Lift', handle: 'nberkelevator', text: 'North Berkeley elevator out since Tuesday if the handwritten sign is telling the truth. The other sign says “temporarily.” It is Friday.', hours: 30, likes: 83, replies: 9, followed: true },
    { id: 'p21', name: 'MacArthur Mix', handle: 'macarthurmix', text: 'MacArthur is where the colors lie. I watched six people board Richmond with Millbrae faces. I said something. They did not get off. See you in El Cerrito.', hours: 32, likes: 267, replies: 44, followed: true },
    { id: 'p22', name: 'Daly City End', handle: 'dalycityend', text: 'Daly City turnback. Train sat with doors open for twelve minutes while the operator argued with the radio. At least we were above ground.', hours: 36, likes: 70, replies: 10, followed: false }
  ];

  const NOTIFS = [
    { id: 'n1', text: '@millbraemix liked your take on the Richmond vs Millbrae trap.', time: '1h', unread: true },
    { id: 'n2', text: '@transbaytube mentioned you in a Tube delay check.', time: '3h', unread: true },
    { id: 'n3', text: '@macarthurmix started following you. Dummy follow.', time: 'Yesterday', unread: true }
  ];

  const THREADS = [
    { id: 't1', name: 'Millbrae Mix', handle: 'millbraemix', preview: 'Did you photograph the headsign too?', messages: [
      { me: false, text: 'Did you photograph the headsign too?' },
      { me: true, text: 'Every time. Richmond vs Millbrae is a trap. See you on the next one.' }
    ]},
    { id: 't2', name: 'Tube Rider', handle: 'transbaytube', preview: 'Still in the Tube. You?', messages: [
      { me: false, text: 'Still in the Tube. You?' },
      { me: true, text: 'West Oakland. If this door closes I owe you a coffee.' }
    ]}
  ];

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function colorFor(handle) {
    let n = 0;
    for (let i = 0; i < handle.length; i++) n = (n + handle.charCodeAt(i) * (i + 1)) % COLORS.length;
    return COLORS[n];
  }
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }

  let currentUser = loadJSON(LS_USER, null);
  let likes = loadJSON(LS_LIKES, {});
  let extraPosts = loadJSON(LS_POSTS, []);
  let currentTab = 'foryou';
  let activeThread = null;

  function allPosts() {
    const liveTop = livePosts.filter(function (p) { return !p.parentId; });
    return liveTop.concat(extraPosts).concat(SEED);
  }

  function isMobileNav() { return window.innerWidth <= MOBILE_NAV_MQ; }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    syncHamburgerAria();
  }
  function syncHamburgerAria() {
    if (!hamburger) return;
    const open = isMobileNav()
      ? document.body.classList.contains('nav-open')
      : !document.body.classList.contains('nav-collapsed');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  function highlightSocial(name) {
    document.querySelectorAll('.nav-social-link').forEach(function (l) { l.classList.remove('active'); });
    const el = document.querySelector('[data-social="' + name + '"]');
    if (el) el.classList.add('active');
  }

  function closeSocialOverlays() {
    ['explore-overlay', 'notif-overlay', 'chat-overlay', 'profile-overlay'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active', 'thread-open');
    });
  }

  function showContentPage(id) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    const page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
  }

  function normalizeRoute(route) {
    let id = String(route || '').replace(/^#/, '').trim();
    if (!id) id = 'home';
    try { id = decodeURIComponent(id); } catch (e) { /* keep */ }
    return id;
  }
  function routeFromHash() { return normalizeRoute(window.location.hash); }
  function go(route) {
    const id = normalizeRoute(route);
    const hash = '#' + id;
    if (location.hash === hash) { applyRoute(); return; }
    location.hash = hash;
  }

  function selectThoughtsTab(tab) {
    currentTab = tab;
    document.querySelectorAll('[data-thoughts-tab]').forEach(function (t) {
      t.classList.toggle('active', t.dataset.thoughtsTab === tab);
    });
    renderFeed();
  }

  function applyRoute() {
    closeMobileNav();
    const raw = routeFromHash();

    if (raw === 'following') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('following');
      selectThoughtsTab('following');
      return;
    }
    if (raw === 'hot' || raw === 'new') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab(raw);
      return;
    }
    if (raw === 'home' || raw === 'feed' || raw === 'thoughts') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab('foryou');
      return;
    }
    if (raw === 'chat') { openChat(); return; }
    if (raw === 'notifications') { openNotif(); return; }
    if (raw === 'explore') { openExplore(); return; }
    if (raw === 'profile') { openProfile(); return; }
    if (raw === 'news') {
      closeSocialOverlays();
      showContentPage('news');
      highlightSocial('news');
      return;
    }
    closeSocialOverlays();
    showContentPage('thoughts');
    highlightSocial('home');
  }

  function renderPost(post) {
    const liked = !!likes[post.id];
    const likeCount = post.likes + (liked ? 1 : 0);
    const av = initials(post.name);
    const bg = colorFor(post.handle);
    return (
      '<article class="post" data-post-id="' + post.id + '">' +
        '<div class="post-avatar" style="background:' + bg + '">' + av + '</div>' +
        '<div class="post-body">' +
          '<div class="post-meta">' +
            '<span class="post-name">' + escapeHtml(post.name) + '</span>' +
            '<span class="post-handle">@' + escapeHtml(post.handle) + '</span>' +
            '<span class="post-time">· ' + (post.hours != null ? post.hours + 'h' : 'now') + '</span>' +
          '</div>' +
          '<p class="post-text">' + escapeHtml(post.text) + '</p>' +
          (post.snippet
            ? '<div class="post-snippet"><span class="post-snippet-handle">@' + escapeHtml(post.snippet.handle) + '</span>' + escapeHtml(post.snippet.text) + '</div>'
            : '') +
          '<div class="post-actions">' +
            '<button class="post-action" data-act="reply" type="button">Reply · ' + (post.replies || 0) + '</button>' +
            '<button class="post-action' + (liked ? ' liked' : '') + '" data-act="like" type="button">Like · ' + likeCount + '</button>' +
            '<button class="post-action" data-act="share" type="button">Share</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function sliceFeed(posts, tab) {
    var list = posts.slice();
    if (tab === 'following') {
      return list.filter(function (p) {
        return p.followed || (currentUser && p.handle === currentUser.handle);
      });
    }
    if (tab === 'hot') {
      return list.sort(function (a, b) {
        return (b.likes + (likes[b.id] ? 1 : 0)) - (a.likes + (likes[a.id] ? 1 : 0));
      });
    }
    if (tab === 'new') {
      return list.sort(function (a, b) { return (a.hours || 0) - (b.hours || 0); });
    }
    // For You: conversation-weighted mix (replies + recency), not pure likes or clock order
    return list.sort(function (a, b) {
      var sa = (a.replies || 0) * 4 - (a.hours || 0);
      var sb = (b.replies || 0) * 4 - (b.hours || 0);
      return sb - sa;
    });
  }

  function renderFeed() {
    const el = document.getElementById('thoughts-feed');
    if (!el) return;
    var posts = sliceFeed(allPosts(), currentTab);
    if (!posts.length) {
      el.innerHTML = '<div class="post-empty">No posts in this ranking yet. Following / Hot / New are different slices of the same BART feed — dress rehearsal only.</div>';
      return;
    }
    el.innerHTML = posts.map(renderPost).join('');
  }

  function renderTrends() {
    const card = function (t) {
      return '<a class="news-item" href="#explore">' +
        '<div class="news-item-tag">' + escapeHtml(t.tag) + '</div>' +
        '<div class="news-item-headline">' + escapeHtml(t.headline) + '</div>' +
        '<div class="news-item-snippet">' + escapeHtml(t.snippet) + '</div>' +
        '<div class="news-item-meta">' + escapeHtml(t.meta) + '</div>' +
      '</a>';
    };
    const rail = document.getElementById('news-feed');
    const page = document.getElementById('news-page-list');
    const html = TRENDS.map(card).join('');
    if (rail) rail.innerHTML = html;
    if (page) page.innerHTML = html;
  }

  function renderExplore() {
    function cards(list) {
      return list.map(function (c) {
        return '<article class="explore-card">' +
          '<div class="explore-card-tag">' + escapeHtml(c.tag) + '</div>' +
          '<div class="explore-card-title">' + escapeHtml(c.title) + '</div>' +
          '<div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div>' +
        '</article>';
      }).join('');
    }
    document.getElementById('explore-pane-places').innerHTML = cards(PLACES);
    document.getElementById('explore-pane-topics').innerHTML = cards(TOPICS);
  }

  function renderNotifs() {
    const el = document.getElementById('notif-list');
    if (!el) return;
    el.innerHTML = NOTIFS.map(function (n) {
      return '<div class="notif-item' + (n.unread ? ' unread' : '') + '" data-nid="' + n.id + '">' +
        '<div><p>' + escapeHtml(n.text) + '</p><time>' + n.time + '</time></div></div>';
    }).join('');
    const unread = NOTIFS.filter(function (n) { return n.unread; }).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = String(unread);
      badge.classList.toggle('visible', unread > 0);
    }
  }

  function renderThreads() {
    const el = document.getElementById('chat-thread-list');
    if (!el) return;
    el.innerHTML = THREADS.map(function (t) {
      return '<div class="chat-thread-item" data-tid="' + t.id + '">' +
        '<div class="post-avatar" style="background:' + colorFor(t.handle) + '">' + initials(t.name) + '</div>' +
        '<div><div class="thread-name">' + escapeHtml(t.name) + '</div>' +
        '<div class="thread-preview">' + escapeHtml(t.preview) + '</div></div></div>';
    }).join('');
  }

  function openThread(id) {
    const t = THREADS.find(function (x) { return x.id === id; });
    if (!t) return;
    activeThread = t;
    document.getElementById('chat-placeholder').hidden = true;
    const view = document.getElementById('chat-thread-view');
    view.hidden = false;
    document.getElementById('chat-active-name').textContent = t.name;
    document.getElementById('chat-messages').innerHTML = t.messages.map(function (m) {
      return '<div class="chat-bubble ' + (m.me ? 'me' : 'them') + '">' + escapeHtml(m.text) + '</div>';
    }).join('');
    document.getElementById('chat-overlay').classList.add('thread-open');
  }

  function openChat() {
    closeSocialOverlays();
    document.getElementById('chat-overlay').classList.add('active');
    highlightSocial('chat');
  }
  function openNotif() {
    closeSocialOverlays();
    document.getElementById('notif-overlay').classList.add('active');
    highlightSocial('notifications');
  }
  function openExplore() {
    closeSocialOverlays();
    document.getElementById('explore-overlay').classList.add('active');
    highlightSocial('explore');
  }
  function openProfile() {
    closeSocialOverlays();
    document.getElementById('profile-overlay').classList.add('active');
    highlightSocial('profile');
    syncProfile();
  }

  function syncProfile() {
    const prompt = document.getElementById('profile-signin-prompt');
    const content = document.getElementById('profile-content');
    if (!currentUser) {
      prompt.hidden = false;
      content.hidden = true;
      document.getElementById('profile-topbar-name').textContent = 'Profile';
      return;
    }
    prompt.hidden = true;
    content.hidden = false;
    document.getElementById('profile-topbar-name').textContent = currentUser.name;
    document.getElementById('profile-display-name').textContent = currentUser.name;
    document.getElementById('profile-handle').textContent = '@' + currentUser.handle;
    document.getElementById('profile-avatar').textContent = initials(currentUser.name);
    document.getElementById('profile-bio').textContent = currentUser.bio || 'Nothing but BART.';
    const mine = allPosts().filter(function (p) { return p.handle === currentUser.handle; });
    const pane = document.getElementById('profile-pane-posts');
    if (!mine.length) {
      pane.innerHTML = '<div class="empty-note" id="profile-posts-empty">No posts yet. Hit Post when the train is late again.</div>';
    } else {
      pane.innerHTML = mine.map(renderPost).join('');
    }
  }

  function renderSidebarAuth() {
    const el = document.getElementById('sidebar-auth');
    const av = document.getElementById('thoughts-compose-avatar');
    if (currentUser) {
      el.innerHTML =
        '<div class="sidebar-auth-user">' +
          '<div class="sidebar-auth-avatar">' + initials(currentUser.name) + '</div>' +
          '<div class="sidebar-auth-name">@' + escapeHtml(currentUser.handle) + '</div>' +
        '</div>' +
        '<button class="sidebar-auth-btn" id="auth-signout" type="button">Sign out</button>';
      av.textContent = initials(currentUser.name);
      av.style.background = colorFor(currentUser.handle);
    } else {
      el.innerHTML = '<button class="sidebar-auth-btn primary" id="auth-signin" type="button">Sign in</button>';
      av.textContent = 'BC';
      av.style.background = '';
    }
  }

  function openAuth(tab) {
    const ov = document.getElementById('cv-auth-overlay');
    ov.classList.add('open');
    document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('cv-panel-login').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('cv-panel-register').style.display = tab === 'register' ? '' : 'none';
    const closeBtn = document.getElementById('cv-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeAuth() {
    document.getElementById('cv-auth-overlay').classList.remove('open');
  }
  function stubSignIn(name, handle) {
    currentUser = {
      name: name || 'Guest',
      handle: (handle || 'guestbart').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'guestbart',
      bio: 'Nothing but BART.'
    };
    saveJSON(LS_USER, currentUser);
    closeAuth();
    renderSidebarAuth();
    syncProfile();
  }
  function signOut() {
    if (fbAuth && fbAuth.currentUser) fbAuth.signOut();
    currentUser = null;
    saveJSON(LS_USER, null);
    renderSidebarAuth();
    syncProfile();
  }


  function maybePost() {
    const input = document.getElementById('thoughts-compose-input');
    const text = (input.value || '').trim();
    if (!text) return;
    const live = fbAuth && fbAuth.currentUser;
    if (!live) { openAuth('login'); return; }
    const parentId = replyTo;
    replyTo = null;
    fbDb.collection('posts').add({
      siteId: SITE_ID,
      parentId: parentId,
      authorUid: live.uid,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      text: text.slice(0, 280),
      likeCount: 0,
      replyCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      if (parentId) {
        fbDb.collection('posts').doc(parentId).update({
          replyCount: firebase.firestore.FieldValue.increment(1)
        }).catch(function () {});
      }
    }).catch(function (e) {
      console.warn('post', e);
    });
    input.value = '';
    input.placeholder = input.getAttribute('data-ph') || input.placeholder;
    document.getElementById('thoughts-post-btn').disabled = true;
  }

  /* ── Events ─────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const social = e.target.closest('[data-social]');
    if (social) {
      e.preventDefault();
      go(social.dataset.social);
      return;
    }
    if (e.target.closest('#auth-signin') || e.target.closest('#profile-signin-prompt-btn')) {
      openAuth('login');
      return;
    }
    if (e.target.closest('#auth-signout')) { signOut(); return; }

    const tab = e.target.closest('[data-thoughts-tab]');
    if (tab) {
      const t = tab.dataset.thoughtsTab;
      if (t === 'following') go('following');
      else if (t === 'hot') go('hot');
      else if (t === 'new') go('new');
      else go('home');
      return;
    }

    const likeBtn = e.target.closest('[data-act="like"]');
    if (likeBtn) {
      const post = likeBtn.closest('[data-post-id]');
      if (!post) return;
      const id = post.dataset.postId;
      likes[id] = !likes[id];
      if (!likes[id]) delete likes[id];
      saveJSON(LS_LIKES, likes);
      renderFeed();
      syncProfile();
      return;
    }
    if (e.target.closest('[data-act="reply"]')) {
      if (!(fbAuth && fbAuth.currentUser)) { openAuth('login'); return; }
      const post = e.target.closest('[data-post-id]');
      if (!post) return;
      replyTo = post.dataset.postId;
      const input = document.getElementById('thoughts-compose-input');
      if (!input.getAttribute('data-ph')) input.setAttribute('data-ph', input.placeholder);
      input.placeholder = 'Reply to this post…';
      input.focus();
      return;
    }
    if (e.target.closest('[data-act="share"]')) {
      if (!currentUser) openAuth('login');
      return;
    }

    const etab = e.target.closest('[data-explore-tab]');
    if (etab) {
      document.querySelectorAll('[data-explore-tab]').forEach(function (t) {
        t.classList.toggle('active', t === etab);
      });
      document.getElementById('explore-pane-places').classList.toggle('active', etab.dataset.exploreTab === 'places');
      document.getElementById('explore-pane-topics').classList.toggle('active', etab.dataset.exploreTab === 'topics');
      return;
    }

    const thread = e.target.closest('[data-tid]');
    if (thread) { openThread(thread.dataset.tid); return; }

    if (isMobileNav() && document.body.classList.contains('nav-open')
        && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const ov = document.getElementById('cv-auth-overlay');
    if (ov && ov.classList.contains('open')) { e.preventDefault(); closeAuth(); return; }
    if (isMobileNav() && document.body.classList.contains('nav-open')) closeMobileNav();
  });

  hamburger.addEventListener('click', function () {
    if (isMobileNav()) document.body.classList.toggle('nav-open');
    else document.body.classList.toggle('nav-collapsed');
    syncHamburgerAria();
  });
  window.addEventListener('resize', syncHamburgerAria);
  document.getElementById('nav-overlay').addEventListener('click', closeMobileNav);
  document.getElementById('right-panel-tab').addEventListener('click', function () {
    document.body.classList.toggle('right-collapsed');
  });
  document.getElementById('sidebar-search-btn').addEventListener('click', function () { go('explore'); });
  document.getElementById('sidebar-post-btn').addEventListener('click', function () {
    go('home');
    setTimeout(function () {
      const input = document.getElementById('thoughts-compose-input');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 120);
  });

  ['profile-back', 'notif-back', 'explore-back'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () { go('home'); });
  });
  document.getElementById('notif-mark-read').addEventListener('click', function () {
    NOTIFS.forEach(function (n) { n.unread = false; });
    renderNotifs();
  });
  document.getElementById('chat-new-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-placeholder-new').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-send-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    const input = document.getElementById('chat-compose-input');
    const text = (input.value || '').trim();
    if (!text || !activeThread) return;
    activeThread.messages.push({ me: true, text: text });
    input.value = '';
    openThread(activeThread.id);
  });
  document.getElementById('profile-edit-btn').addEventListener('click', function () {
    openAuth('register');
  });

  const compose = document.getElementById('thoughts-compose-input');
  const postBtn = document.getElementById('thoughts-post-btn');
  compose.addEventListener('input', function () {
    postBtn.disabled = !(compose.value || '').trim();
    compose.style.height = 'auto';
    compose.style.height = Math.min(compose.scrollHeight, 200) + 'px';
  });
  postBtn.addEventListener('click', maybePost);

  document.getElementById('cv-modal-close').addEventListener('click', function (e) {
    e.preventDefault();
    closeAuth();
  });
  document.getElementById('cv-auth-overlay').addEventListener('click', function (e) {
    if (e.target.id === 'cv-auth-overlay') closeAuth();
  });
  document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
    t.addEventListener('click', function () { openAuth(t.dataset.tab); });
  });
  function stubSubmit(errId) {
    const err = document.getElementById(errId);
    err.textContent = 'Dress rehearsal — no live auth. Continuing as guest.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn('Guest', 'guestbart'); }, 500);
  }
  document.getElementById('cv-login-btn').addEventListener('click', function () {
    const err = document.getElementById('cv-login-err');
    const email = (document.getElementById('cv-login-email').value || '').trim();
    const pw = document.getElementById('cv-login-pw').value || '';
    if (!fbAuth) { err.textContent = 'Auth is not ready.'; err.classList.add('show'); return; }
    err.textContent = '';
    fbAuth.signInWithEmailAndPassword(email, pw).catch(function (e) {
      err.textContent = (e && e.message) ? e.message : 'Sign-in failed.';
      err.classList.add('show');
    });
  });
  document.getElementById('cv-reg-btn').addEventListener('click', function () {
    const err = document.getElementById('cv-reg-err');
    const name = (document.getElementById('cv-reg-name').value || '').trim();
    const email = (document.getElementById('cv-reg-email').value || '').trim();
    const pw = document.getElementById('cv-reg-pw').value || '';
    if (!fbAuth) { err.textContent = 'Auth is not ready.'; err.classList.add('show'); return; }
    if (!email || pw.length < 6) { err.textContent = 'Email and a password of at least 6 characters.'; err.classList.add('show'); return; }
    err.textContent = '';
    fbAuth.createUserWithEmailAndPassword(email, pw).then(function (cred) {
      const disp = name || email.split('@')[0];
      return cred.user.updateProfile({ displayName: disp }).then(function () {
        if (fbDb) {
          return fbDb.collection('users').doc(cred.user.uid).set({
            displayName: disp,
            email: email,
            siteId: SITE_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      });
    }).catch(function (e) {
      err.textContent = (e && e.message) ? e.message : 'Could not create account.';
      err.classList.add('show');
    });
  });
  document.getElementById('cv-google-login').addEventListener('click', function () {
    var err = document.getElementById('cv-login-err');
    err.textContent = 'Email and password are live on subx-skins. Google is off until that provider is enabled.';
    err.classList.add('show');
  });
  document.getElementById('cv-guest-login').addEventListener('click', function () { stubSignIn('Guest', 'guestbart'); });

  const search = document.getElementById('explore-search-input');
  search.addEventListener('input', function () {
    const q = search.value.trim().toLowerCase();
    function filt(list) {
      if (!q) return list;
      return list.filter(function (c) {
        return (c.title + ' ' + c.snippet + ' ' + c.tag).toLowerCase().indexOf(q) !== -1;
      });
    }
    function cards(list) {
      if (!list.length) return '<p class="empty-note">Nothing on BART matched that.</p>';
      return list.map(function (c) {
        return '<article class="explore-card"><div class="explore-card-tag">' + escapeHtml(c.tag) +
          '</div><div class="explore-card-title">' + escapeHtml(c.title) +
          '</div><div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div></article>';
      }).join('');
    }
    document.getElementById('explore-pane-places').innerHTML = cards(filt(PLACES));
    document.getElementById('explore-pane-topics').innerHTML = cards(filt(TOPICS));
  });

  renderTrends();
  renderExplore();
  renderNotifs();
  renderThreads();
  renderSidebarAuth();
  renderFeed();

  window.addEventListener('hashchange', applyRoute);
  if (!location.hash || location.hash === '#') history.replaceState(null, '', '#home');
  applyRoute();
  syncHamburgerAria();
})();
