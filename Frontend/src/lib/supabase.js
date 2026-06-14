const STORAGE_KEYS_MAP = {
  profiles: 'mock_supabase_profiles',
  talent_profiles: 'mock_supabase_talent_profiles',
  jobs: 'mock_supabase_jobs',
  job_postings: 'mock_supabase_jobs',
  applications: 'mock_supabase_applications',
  interviews: 'mock_supabase_interviews',
  messages: 'mock_supabase_messages'
};

const defaultUsers = [
  { id: 'talent-1', email: 'talent@example.com', password: 'password' },
  { id: 'employer-1', email: 'employer@example.com', password: 'password' }
];

const defaultProfiles = [
  {
    id: 'talent-1',
    email: 'talent@example.com',
    full_name: 'Ahmad Faizal bin Rashid',
    role: 'talent',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=cover'
  },
  {
    id: 'employer-1',
    email: 'employer@example.com',
    full_name: 'TechCorp Malaysia',
    role: 'employer',
    avatar_url: 'https://images.unsplash.com/photo-1549737328-8b9f3852ad26?w=200&h=200&fit=cover'
  }
];

const defaultTalentProfiles = [
  {
    id: 'talent-1',
    user_id: 'talent-1',
    desired_role: 'Full Stack Developer',
    experience: 4,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker'],
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

const defaultJobs = [
  {
    id: 'job-1',
    title: 'Senior React Developer',
    company_id: 'employer-1',
    work_mode: 'remote',
    location: 'Kuala Lumpur',
    salary_range: 'RM 8,000 - RM 12,000',
    requirements: ['React', 'TypeScript', 'TailwindCSS', 'Redux'],
    status: 'open',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer (Node/React)',
    company_id: 'employer-1',
    work_mode: 'hybrid',
    location: 'Singapore',
    salary_range: 'SGD 5,000 - SGD 7,500',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'Express'],
    status: 'open',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-3',
    title: 'UI/UX Product Designer',
    company_id: 'employer-1',
    work_mode: 'remote',
    location: 'Remote',
    salary_range: 'RM 6,000 - RM 9,000',
    requirements: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    status: 'open',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const defaultApplications = [
  {
    id: 'app-1',
    job_id: 'job-1',
    talent_id: 'talent-1',
    status: 'pending',
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function initializeMockData() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mock_supabase_users')) {
    localStorage.setItem('mock_supabase_users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('mock_supabase_profiles')) {
    localStorage.setItem('mock_supabase_profiles', JSON.stringify(defaultProfiles));
  }
  if (!localStorage.getItem('mock_supabase_talent_profiles')) {
    localStorage.setItem('mock_supabase_talent_profiles', JSON.stringify(defaultTalentProfiles));
  }
  if (!localStorage.getItem('mock_supabase_jobs')) {
    localStorage.setItem('mock_supabase_jobs', JSON.stringify(defaultJobs));
  }
  if (!localStorage.getItem('mock_supabase_applications')) {
    localStorage.setItem('mock_supabase_applications', JSON.stringify(defaultApplications));
  }
}
initializeMockData();

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderCol = null;
    this.orderAsc = true;
    this.limitCount = null;
    this.isSingle = false;
    this.isCountOnly = false;
  }

  select(fields, options = {}) {
    if (options.count) {
      this.isCountOnly = true;
    }
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  in(field, values) {
    this.filters.push({ type: 'in', field, values });
    return this;
  }

  ilike(field, pattern) {
    this.filters.push({ type: 'ilike', field, pattern });
    return this;
  }

  order(field, options = {}) {
    this.orderCol = field;
    this.orderAsc = options.ascending !== false;
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.then(
      (res) => ({ data: res.data ? res.data : null, error: res.error }),
      (err) => ({ data: null, error: err })
    );
  }

  async then(onfulfilled, onrejected) {
    try {
      const result = await this.execute();
      return onfulfilled(result);
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  async execute() {
    const key = STORAGE_KEYS_MAP[this.table] || this.table;
    let data = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Apply filters
    for (const filter of this.filters) {
      if (filter.type === 'eq') {
        data = data.filter(item => item[filter.field] === filter.value);
      } else if (filter.type === 'neq') {
        data = data.filter(item => item[filter.field] !== filter.value);
      } else if (filter.type === 'in') {
        data = data.filter(item => filter.values.includes(item[filter.field]));
      } else if (filter.type === 'ilike') {
        const regexStr = filter.pattern.replace(/%/g, '.*');
        const regex = new RegExp(`^${regexStr}$`, 'i');
        data = data.filter(item => regex.test(item[filter.field]));
      }
    }

    // Apply relations mockup (joins)
    data = data.map(item => {
      const resolved = { ...item };
      
      if (this.table === 'talent_profiles') {
        const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
        resolved.profiles = profiles.find(p => p.id === item.user_id || p.id === item.id) || null;
      }
      if (this.table === 'applications') {
        const jobs = JSON.parse(localStorage.getItem('mock_supabase_jobs') || '[]');
        const tps = JSON.parse(localStorage.getItem('mock_supabase_talent_profiles') || '[]');
        const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
        
        const job = jobs.find(j => j.id === item.job_id);
        if (job) {
          const companies = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
          const company = companies.find(c => c.id === job.company_id);
          resolved.job_postings = {
            ...job,
            companies: company || { name: 'Demo Corp' }
          };
        } else {
          resolved.job_postings = { title: 'Software Engineer', companies: { name: 'Demo Corp' } };
        }

        const tp = tps.find(t => t.id === item.talent_id || t.user_id === item.talent_id);
        if (tp) {
          resolved.talent_profiles = {
            ...tp,
            profiles: profiles.find(p => p.id === tp.user_id || p.id === tp.id) || null
          };
        }
      }
      if (this.table === 'jobs' || this.table === 'job_postings') {
        const companies = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
        const company = companies.find(c => c.id === item.company_id);
        resolved.company = company || { name: 'Demo Corp', location: item.location || 'Kuala Lumpur', industry: 'Technology' };
        resolved.companies = company || { name: 'Demo Corp' };
      }

      return resolved;
    });

    // Sort
    if (this.orderCol) {
      data.sort((a, b) => {
        let valA = a[this.orderCol];
        let valB = b[this.orderCol];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'string') {
          return this.orderAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.orderAsc ? valA - valB : valB - valA;
      });
    }

    // Limit
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    if (this.isCountOnly) {
      return { count: data.length, data: null, error: null };
    }

    if (this.isSingle) {
      return { data: data[0] || null, error: data[0] ? null : { message: 'Not found' } };
    }

    return { data, error: null };
  }

  async insert(payload) {
    const key = STORAGE_KEYS_MAP[this.table] || this.table;
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const items = Array.isArray(payload) ? payload : [payload];
    
    const newItems = items.map(item => ({
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      applied_at: new Date().toISOString(),
      ...item
    }));

    localStorage.setItem(key, JSON.stringify([...current, ...newItems]));
    return { data: Array.isArray(payload) ? newItems : newItems[0], error: null };
  }

  async update(payload) {
    const key = STORAGE_KEYS_MAP[this.table] || this.table;
    let current = JSON.parse(localStorage.getItem(key) || '[]');
    
    let updatedCount = 0;
    current = current.map(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (filter.type === 'eq' && item[filter.field] !== filter.value) {
          matches = false;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...payload };
      }
      return item;
    });

    localStorage.setItem(key, JSON.stringify(current));
    return { data: payload, error: null };
  }

  async upsert(payload, options = {}) {
    const key = STORAGE_KEYS_MAP[this.table] || this.table;
    let current = JSON.parse(localStorage.getItem(key) || '[]');
    const items = Array.isArray(payload) ? payload : [payload];

    items.forEach(item => {
      const conflictField = options.onConflict || 'id';
      const index = current.findIndex(existing => existing[conflictField] === item[conflictField]);
      if (index !== -1) {
        current[index] = { ...current[index], ...item };
      } else {
        current.push({
          id: item.id || Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          ...item
        });
      }
    });

    localStorage.setItem(key, JSON.stringify(current));
    return { data: payload, error: null };
  }

  async delete() {
    const key = STORAGE_KEYS_MAP[this.table] || this.table;
    let current = JSON.parse(localStorage.getItem(key) || '[]');
    
    current = current.filter(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (filter.type === 'eq' && item[filter.field] !== filter.value) {
          matches = false;
        }
      }
      return !matches;
    });

    localStorage.setItem(key, JSON.stringify(current));
    return { data: null, error: null };
  }
}

const authListeners = new Set();

const auth = {
  async getSession() {
    if (typeof window === 'undefined') return { data: { session: null } };
    const session = JSON.parse(localStorage.getItem('mock_supabase_session') || 'null');
    return { data: { session } };
  },
  
  onAuthStateChange(callback) {
    authListeners.add(callback);
    if (typeof window !== 'undefined') {
      const session = JSON.parse(localStorage.getItem('mock_supabase_session') || 'null');
      callback('INITIAL_SESSION', session);
    }
    
    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(callback);
          }
        }
      }
    };
  },

  async signInWithPassword({ email, password }) {
    const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]');
    let user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      // Fallback: If email contains 'employer', log in as the default employer. Otherwise default to talent.
      const targetId = email.toLowerCase().includes('employer') ? 'employer-1' : 'talent-1';
      user = users.find(u => u.id === targetId) || defaultUsers.find(u => u.id === targetId);
    }
    
    const session = {
      access_token: 'mock-jwt-token',
      user: { id: user.id, email: user.email }
    };
    localStorage.setItem('mock_supabase_session', JSON.stringify(session));
    
    authListeners.forEach(cb => cb('SIGNED_IN', session));
    
    return { data: { user: session.user, session }, error: null };
  },

  async signOut() {
    localStorage.removeItem('mock_supabase_session');
    authListeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  },

  async signUp({ email, password, options }) {
    const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { data: null, error: new Error('User already exists') };
    }
    const user = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      password
    };
    users.push(user);
    localStorage.setItem('mock_supabase_users', JSON.stringify(users));

    const session = {
      access_token: 'mock-jwt-token',
      user: { id: user.id, email: user.email }
    };
    localStorage.setItem('mock_supabase_session', JSON.stringify(session));

    const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
    const role = options?.data?.role || 'talent';
    profiles.push({
      id: user.id,
      email: user.email,
      full_name: email.split('@')[0],
      role: role
    });
    localStorage.setItem('mock_supabase_profiles', JSON.stringify(profiles));

    if (role === 'talent') {
      const talentProfiles = JSON.parse(localStorage.getItem('mock_supabase_talent_profiles') || '[]');
      talentProfiles.push({
        id: user.id,
        user_id: user.id,
        desired_role: 'Software Engineer',
        experience: 2,
        skills: ['React', 'JavaScript', 'HTML', 'CSS']
      });
      localStorage.setItem('mock_supabase_talent_profiles', JSON.stringify(talentProfiles));
    }

    authListeners.forEach(cb => cb('SIGNED_IN', session));
    return { data: { user: session.user, session }, error: null };
  }
};

const storage = {
  from: (bucket) => ({
    upload: async (path, file, options) => {
      return { data: { path }, error: null };
    },
    getPublicUrl: (path) => {
      let url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=cover';
      if (bucket.toLowerCase().includes('resume')) {
        url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      return { data: { publicUrl: url } };
    }
  })
};

export const supabase = {
  auth,
  storage,
  from: (table) => new MockQueryBuilder(table)
};
