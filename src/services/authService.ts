export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

const TOKEN_KEY = 'ai_research_scientist_token';
const USER_KEY = 'ai_research_scientist_user';

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, user: User) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error('Failed to save auth session:', err);
    }
  },

  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  },

  async signUp(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
      }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.error || data.detail || `Authentication failed (${res.status}: ${res.statusText || 'Unable to connect to server'})`);
    }

    const token = data.token || data.access_token;
    const user = data.user || data;
    this.setSession(token, user);
    return { message: data.message || 'Account created successfully', token, user };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.error || data.detail || `Sign in failed (${res.status}: ${res.statusText || 'Invalid credentials or server error'})`);
    }

    const token = data.token || data.access_token;
    const user = data.user || data;
    this.setSession(token, user);
    return { message: data.message || 'Signed in successfully', token, user };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = await res.json();
      const user = data.user || (data.id ? data : null);
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (err) {
      console.warn('Could not verify current user with server:', err);
      // Return cached user if offline or network glitch
      return this.getStoredUser();
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  },

  async signInDemo(): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.access_token;
        const user = data.user || data;
        this.setSession(token, user);
        return {
          message: 'Demo credentials active. Entering workspace...',
          token,
          user,
        };
      }
    } catch {
      // Ignore network errors and fallback to client-side token
    }

    const demoUser: User = {
      id: 1,
      full_name: 'Dr. Alex Vance, Senior AI Scientist',
      email: 'alex.vance@stanford.edu',
      created_at: new Date().toISOString(),
    };
    const demoToken = 'academic_research_scientist_demo_token_2026';
    this.setSession(demoToken, demoUser);
    return {
      message: 'Demo credentials active. Entering workspace...',
      token: demoToken,
      user: demoUser,
    };
  },
};
