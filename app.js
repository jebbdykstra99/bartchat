(function () {
  'use strict';

  const MOBILE_NAV_MQ = 900;
  const LS_USER = 'bartchat.user';
  const LS_LIKES = 'bartchat.likes';
  const LS_POSTS = 'bartchat.localPosts';

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  const COLORS = ['#101820', '#0099d8', '#d32f2f', '#0077a8', '#3d4f5c', '#c9a227'];


  const TRENDS = [
    { tag: 'Yellow', headline: 'Major delay through the Tube', snippet: 'Trains single-tracking. Embarcadero to West Oakland is a rumor. Bring a book.', meta: 'Live on the system' },
    { tag: 'Red', headline: 'Richmond line 22 minutes', snippet: 'Platform packed. Next train is already full. People walking to 19th.', meta: 'Delay' },
    { tag: 'Elevator', headline: 'Powell elevator out, again', snippet: 'Stroller, bike, wheelchair, everyone taking the stairs. Classic Powell.', meta: 'Station' },
    { tag: 'Fare gate', headline: 'MacArthur gates jammed', snippet: 'Clipper tap does the sad beep. Agent booth empty. People hopping.', meta: 'Mixup' },
    { tag: 'Orange', headline: 'Warm platform at Fremont', snippet: 'AC is a myth. Dublin/Pleasanton riders melting. Water bottle mandatory.', meta: 'The system' },
    { tag: 'Blue', headline: 'Daly City crowd crush at 5:12', snippet: 'Door cycles three times. Someone’s backpack eats a closing door. We wait.', meta: 'Commute' },
    { tag: 'Green', headline: 'Berryessa skip-stop rumor', snippet: 'Announcements say “this train to Daly City” then it isn’t. Mixup of the hour.', meta: 'Wrong train' },
    { tag: 'Bike car', headline: 'Bike car is a mosh pit', snippet: 'Four bikes, two scooters, a cargo. Conductor shrugs. This is the bike car now.', meta: 'Rolling' }
  ];

  const PLACES = [
    { tag: 'Station', title: 'Embarcadero', snippet: 'The choke point. If the Tube coughs, this platform knows first.' },
    { tag: 'Station', title: 'Montgomery', snippet: 'Financial district pour. Doors open, a thousand lanyards move as one.' },
    { tag: 'Station', title: 'Powell', snippet: 'Elevators, tourists, and the fare gate that never learned Clipper.' },
    { tag: 'Station', title: '12th Street / Oakland', snippet: 'Transfer chaos. Richmond vs Berryessa. Pick wrong, ride extra.' },
    { tag: 'Station', title: 'MacArthur', snippet: 'The hub. Yellow, orange, red, and a speaker that lies.' },
    { tag: 'Station', title: 'Millbrae', snippet: 'Caltrain handshake. If you miss it, you live here now.' },
    { tag: 'Station', title: 'Pittsburg/Bay Point', snippet: 'End of the yellow. The wait is the commute.' },
    { tag: 'Station', title: 'Dublin/Pleasanton', snippet: 'Parking lot the size of a town. Train is 11 minutes. Always.' }
  ];

  const TOPICS = [
    { tag: 'Delay', title: 'The Tube', snippet: 'Transbay. When it stumbles, both sides of the bay sit down.' },
    { tag: 'Mixup', title: 'Wrong train', snippet: 'Richmond vs Millbrae. The announcement lied. You are going to SFO now.' },
    { tag: 'Station', title: 'Elevators', snippet: 'Out at Powell, slow at 19th, “temporarily” for three weeks.' },
    { tag: 'Fares', title: 'Clipper & gates', snippet: 'Sad beep, tag again, tag the other card, miss the train.' },
    { tag: 'Cars', title: 'Bike car', snippet: 'Bikes, scooters, and a guy with a bass. Nobody is wrong. Everybody is in the way.' },
    { tag: 'Night', title: 'Last train', snippet: 'You are sprinting. The doors are not sprinting.' }
  ];

  const SEED = [
    { id: 'p1', name: 'Tube Watch', handle: 'tubewatch', text: 'Major delay in the Transbay Tube. They said 10 minutes 25 minutes ago. Embarcadero is a parking lot of humans. I am walking to the ferry. Dummy delay, real energy.', hours: 1, likes: 214, replies: 61, followed: true },
    { id: 'p2', name: 'Wrong Train Kim', handle: 'richmondnot', text: 'Announcer: this is a Richmond train. Map: Millbrae. Doors closed. I am going to SFO with a grocery bag. Mixup of the day.', hours: 1, likes: 189, replies: 44, followed: true },
    { id: 'p3', name: 'Powell Stairs', handle: 'powellelev', text: 'Powell elevator out again. Stroller, bike, wheelchair, all of us looking at 3 flights like it is a boss fight. BART, this is not a personality.', hours: 2, likes: 276, replies: 38, followed: false },
    { id: 'p4', name: 'Gate Beep', handle: 'sadclipper', text: 'MacArthur fare gate did the sad beep four times. Agent booth dark. The person in front hopped. I tagged my other card and missed the orange. Classic.', hours: 2, likes: 97, replies: 22, followed: true },
    { id: 'p5', name: 'Yellow Wait', handle: 'pittsburgbay', text: 'Pittsburg/Bay Point. Next train 18 minutes. The one after that is 18 minutes. This is the whole yellow line today.', hours: 3, likes: 154, replies: 29, followed: true },
    { id: 'p6', name: 'Dublin Melt', handle: 'dublinwait', text: 'Dublin/Pleasanton platform is a convection oven. AC in the cars is a rumor. If you brought a jacket you are the problem.', hours: 3, likes: 131, replies: 17, followed: false },
    { id: 'p7', name: 'Door Cycle', handle: 'dalycrush', text: 'Daly City 5:12. Door cycles three times because a backpack decided to be a citizen. We all sighed in unison. That was the conversation.', hours: 4, likes: 88, replies: 11, followed: true },
    { id: 'p8', name: 'Bike Car Plus', handle: 'bikecarplus', text: 'Bike car has four bikes, two scooters, a cargo, and a guy with a bass. Conductor looked in, nodded, kept walking. This is the bike car now.', hours: 5, likes: 203, replies: 35, followed: false },
    { id: 'p9', name: '19th Transfer', handle: 'oakland12th', text: '12th Street Oakland. Thought I wanted Richmond. Boarded Berryessa. Realized at Lake Merritt. Riding it out. Dummy mixup, real 22 extra minutes.', hours: 6, likes: 76, replies: 14, followed: true },
    { id: 'p10', name: 'Warm Car 3', handle: 'fremontwarm', text: 'Fremont bound, car 3 is a sauna. Car 4 is fine. Nobody will move because we have claimed this pole. Pride is a delay cause.', hours: 7, likes: 64, replies: 9, followed: false },
    { id: 'p11', name: 'Last Train Sprint', handle: 'lasttrain', text: 'Sprinting down Montgomery for the last Dublin. Doors doing that slow close. Made it. My dignity did not.', hours: 8, likes: 241, replies: 19, followed: true },
    { id: 'p12', name: 'SFO Mixup', handle: 'notsfo', text: 'Got on a Millbrae thinking SFO. Announcement after Daly City. Now I am in an airport with no flight. BART humor.', hours: 9, likes: 118, replies: 27, followed: false },
    { id: 'p13', name: 'West Oakland Hold', handle: 'wohhold', text: 'Holding at West Oakland “briefly.” Brief is 14 minutes. The Tube is thinking about its life.', hours: 10, likes: 92, replies: 16, followed: true },
    { id: 'p14', name: 'Ashby Elevator', handle: 'ashbylift', text: 'Ashby elevator smells like a science fair. Still better than Powell being out. Low bar, we clear it.', hours: 11, likes: 55, replies: 7, followed: false },
    { id: 'p15', name: 'Concord Skip', handle: 'concordskip', text: 'This train to Pittsburg is skipping Concord. Announced after the doors closed. Half the car made a noise I will not try to spell.', hours: 12, likes: 167, replies: 33, followed: true },
    { id: 'p16', name: 'Balboa Park', handle: 'balboagate', text: 'Balboa Park gates ate my transfer. Muni to BART, one system two beep languages. I am late to a dummy job.', hours: 14, likes: 71, replies: 12, followed: true },
    { id: 'p17', name: 'Coliseum Night', handle: 'coliseumowl', text: 'Coliseum at 11:40. Platform empty except me and a racoon energy. Next train 19 minutes. Night BART is a genre.', hours: 16, likes: 83, replies: 8, followed: false },
    { id: 'p18', name: 'El Cerrito del Norte', handle: 'delnorte', text: 'Del Norte parking is a blood sport. Train is on time for once and I am still in row 47. The delay was me.', hours: 18, likes: 109, replies: 15, followed: true },
    { id: 'p19', name: 'Walnut Creek', handle: 'wcplatform', text: 'Walnut Creek. Someone asked if this yellow goes to SFO. Three people answered three different things. All of us were a little right.', hours: 20, likes: 144, replies: 41, followed: false },
    { id: 'p20', name: 'Civic Center', handle: 'civicbeep', text: 'Civic Center fare gate let six people through on one tap. The seventh got the sad beep. That seventh was me. Of course.', hours: 22, likes: 198, replies: 24, followed: true }
  ];

  const NOTIFS = [
    { id: 'n1', text: '@tubewatch liked your Tube delay post.', time: '12m', unread: true },
    { id: 'n2', text: '@richmondnot mentioned you on a wrong-train mixup.', time: '1h', unread: true },
    { id: 'n3', text: '@powellelev started following you. Dummy follow.', time: '3h', unread: true },
    { id: 'n4', text: 'Major delay alert: Transbay Tube (dummy).', time: '4h', unread: false }
  ];

  const THREADS = [
    { id: 't1', name: 'Tube Watch', handle: 'tubewatch', preview: 'Are you still in the Tube hold?', messages: [
      { me: false, text: 'Are you still in the Tube hold?' },
      { me: true, text: 'Walked to the ferry. Dummy delay, real blister.' }
    ]},
    { id: 't2', name: 'Wrong Train Kim', handle: 'richmondnot', preview: 'Did you get off at Millbrae?', messages: [
      { me: false, text: 'Did you get off at Millbrae?' },
      { me: true, text: 'Rode it to SFO to commit to the bit.' }
    ]},
    { id: 't3', name: 'Powell Stairs', handle: 'powellelev', preview: 'Elevator still out. Stairs it is.', messages: [
      { me: false, text: 'Elevator still out. Stairs it is.' },
      { me: true, text: 'Meet at the fare gates. Bring knees.' }
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
    return extraPosts.concat(SEED);
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

  function renderFeed() {
    const el = document.getElementById('thoughts-feed');
    if (!el) return;
    let posts = allPosts().slice();
    if (currentTab === 'following') posts = posts.filter(function (p) { return p.followed || (currentUser && p.handle === currentUser.handle); });
    if (currentTab === 'hot') posts.sort(function (a, b) { return (b.likes + (likes[b.id] ? 1 : 0)) - (a.likes + (likes[a.id] ? 1 : 0)); });
    if (currentTab === 'new') posts.sort(function (a, b) { return (a.hours || 0) - (b.hours || 0); });
    if (!posts.length) {
      el.innerHTML = '<div class="post-empty">No posts in this ranking yet. Following / Hot / New are UI chrome — dress rehearsal only.</div>';
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
    document.getElementById('profile-bio').textContent = currentUser.bio || 'Talking about the city.';
    const mine = allPosts().filter(function (p) { return p.handle === currentUser.handle; });
    const pane = document.getElementById('profile-pane-posts');
    if (!mine.length) {
      pane.innerHTML = '<div class="empty-note" id="profile-posts-empty">No posts yet. Hit Post when something about the city is on your mind.</div>';
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
      av.textContent = 'BART';
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
      handle: (handle || 'guestBART').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'guestBART',
      bio: 'BART, talking.'
    };
    saveJSON(LS_USER, currentUser);
    closeAuth();
    renderSidebarAuth();
    syncProfile();
  }
  function signOut() {
    currentUser = null;
    saveJSON(LS_USER, null);
    renderSidebarAuth();
    syncProfile();
  }

  function maybePost() {
    const input = document.getElementById('thoughts-compose-input');
    const text = (input.value || '').trim();
    if (!text) return;
    if (!currentUser) { openAuth('login'); return; }
    extraPosts.unshift({
      id: 'local-' + Date.now(),
      name: currentUser.name,
      handle: currentUser.handle,
      text: text.slice(0, 280),
      hours: 0,
      likes: 0,
      replies: 0,
      followed: true
    });
    saveJSON(LS_POSTS, extraPosts);
    input.value = '';
    document.getElementById('thoughts-post-btn').disabled = true;
    renderFeed();
    syncProfile();
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
    if (e.target.closest('[data-act="reply"]') || e.target.closest('[data-act="share"]')) {
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
    setTimeout(function () { stubSignIn('Guest', 'guestBART'); }, 500);
  }
  document.getElementById('cv-login-btn').addEventListener('click', function () { stubSubmit('cv-login-err'); });
  document.getElementById('cv-reg-btn').addEventListener('click', function () {
    const name = (document.getElementById('cv-reg-name').value || '').trim() || 'Guest';
    const err = document.getElementById('cv-reg-err');
    err.textContent = 'Dress rehearsal — no live auth. Local guest only.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn(name, name.replace(/\s+/g, '').slice(0, 12)); }, 500);
  });
  document.getElementById('cv-google-login').addEventListener('click', function () { stubSignIn('Guest', 'guestBART'); });

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
      if (!list.length) return '<p class="empty-note">Nothing in the system matched that.</p>';
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
