import { Product, MilitaryProfile, PurchaseIntent, Supplier, Campaign } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, SUPPLIERS as INITIAL_SUPPLIERS, CAMPAIGNS as INITIAL_CAMPAIGNS } from '../constants';

const STORAGE_KEYS = {
  PRODUCTS: 'pmmg_products',
  INTENTS: 'pmmg_intents',
  USERS: 'pmmg_users',
  USER: 'pmmg_user',
  PROFILE: 'pmmg_profile',
  SUPPLIERS: 'pmmg_suppliers',
  CAMPAIGNS: 'pmmg_campaigns'
};

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch custom event for real-time like behavior in-tab
  window.dispatchEvent(new Event('storage_update'));
};

// Mock User for local usage
const MOCK_USER = {
  uid: 'militar-01',
  email: 'militar@pmmg.gov.br',
  emailVerified: true
};

const MOCK_PROFILE: MilitaryProfile = {
  fullName: 'Cabo Silva',
  pmNumber: '123.456-7',
  unit: '1º BPM',
  city: 'Belo Horizonte',
  phone: '31 99999-9999',
  email: 'militar@pmmg.gov.br',
  role: 'militar',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Initialize default users if they don't exist
const initializeDefaultUsers = () => {
  const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
  let updated = false;

  if (!users.some(u => u.profile?.pmNumber === '000.000-0')) {
    users.push({
      uid: 'admin-01',
      email: 'admin@pmmg.gov.br',
      password: 'admin',
      profile: {
        fullName: 'Administrador 01',
        pmNumber: '000.000-0',
        unit: 'CG - Comando Geral',
        city: 'Belo Horizonte',
        phone: '31 99999-9999',
        email: 'admin@pmmg.gov.br',
        role: 'administrador',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    });
    updated = true;
  }

  if (!users.some(u => u.profile?.pmNumber === '123.456-7')) {
    users.push({
      uid: 'militar-01',
      email: 'militar@pmmg.gov.br',
      password: '123456',
      profile: {
        fullName: 'Cabo Silva',
        pmNumber: '123.456-7',
        unit: '1º BPM',
        city: 'Belo Horizonte',
        phone: '31 98888-8888',
        email: 'militar@pmmg.gov.br',
        role: 'militar',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    });
    updated = true;
  }

  if (updated) {
    setStorage(STORAGE_KEYS.USERS, users);
  }
};

initializeDefaultUsers();

export const firebaseService = {
  // Auth & Profile
  async register(email: string, password: string, profile: Omit<MilitaryProfile, 'createdAt' | 'updatedAt'>) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    
    // Validations
    if (!profile.fullName || !profile.pmNumber || !profile.email || !profile.phone || !profile.unit || !password) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    const pmExists = users.some(u => u.profile?.pmNumber === profile.pmNumber);
    if (pmExists) {
      throw new Error('Número PM já cadastrado.');
    }

    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      throw new Error('E-mail corporativo já cadastrado.');
    }

    const uid = 'user-' + Date.now();
    const newUser = { 
      uid, 
      email, 
      password, 
      profile: { ...profile, createdAt: Date.now(), updatedAt: Date.now() } 
    };
    
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    
    // We do NOT set the active user session on registration so they must login manually!
    return uid;
  },

  async login(pmNumber: string, password: string) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    
    if (!pmNumber || !password) {
      throw new Error('Preencha o Número PM e a senha.');
    }

    const userInStorage = users.find(u => u.profile?.pmNumber === pmNumber);

    if (userInStorage) {
      if (userInStorage.password === password) {
        setStorage(STORAGE_KEYS.USER, { uid: userInStorage.uid, email: userInStorage.email });
        setStorage(STORAGE_KEYS.PROFILE, userInStorage.profile);
        return { user: userInStorage };
      } else {
        throw new Error('Senha incorreta.');
      }
    }

    throw new Error('Número PM não cadastrado ou senha incorreta.');
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    window.dispatchEvent(new Event('storage_update'));
  },

  async resetPassword(email: string) {
    console.log('Resetting password for:', email);
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) {
      throw new Error('E-mail corporativo não cadastrado.');
    }
  },

  async updatePasswordByEmail(email: string, newPassword: string) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      throw new Error('E-mail corporativo não cadastrado.');
    }

    users[userIndex].password = newPassword;
    if (users[userIndex].profile) {
      users[userIndex].profile.updatedAt = Date.now();
    }
    setStorage(STORAGE_KEYS.USERS, users);
  },

  async getUserProfile(uid: string): Promise<MilitaryProfile | null> {
    return getStorage<MilitaryProfile | null>(STORAGE_KEYS.PROFILE, null);
  },

  onAuthChange(callback: (user: any | null) => void) {
    const check = () => {
      const user = getStorage(STORAGE_KEYS.USER, null);
      callback(user);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  // Purchase Intents
  async createPurchaseIntent(data: Omit<PurchaseIntent, 'id' | 'protocol' | 'createdAt'>): Promise<PurchaseIntent> {
    const intents = getStorage<PurchaseIntent[]>(STORAGE_KEYS.INTENTS, []);
    const protocol = `PMMG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newIntent: PurchaseIntent = {
      ...data,
      id: 'intent-' + Date.now(),
      protocol,
      createdAt: { seconds: Math.floor(Date.now() / 1000) } as any
    };
    intents.push(newIntent);
    setStorage(STORAGE_KEYS.INTENTS, intents);
    return newIntent;
  },

  onIntentsChange(userId: string, callback: (intents: PurchaseIntent[]) => void) {
    const check = () => {
      const allIntents = getStorage<PurchaseIntent[]>(STORAGE_KEYS.INTENTS, []);
      callback(allIntents.filter(i => i.userId === userId));
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  onAllIntentsChange(callback: (intents: PurchaseIntent[]) => void) {
    const check = () => {
      const allIntents = getStorage<PurchaseIntent[]>(STORAGE_KEYS.INTENTS, []);
      callback(allIntents);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  // Products Management
  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now()
    };
    products.push(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  async deleteProduct(id: string) {
    let products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    products = products.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data };
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  async seedProducts(products: Product[]) {
    const existing = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!existing) {
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  onProductsChange(callback: (products: Product[]) => void) {
    const check = () => {
      const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      callback(products);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  // Suppliers Management
  async createSupplier(data: Omit<Supplier, 'id'>): Promise<Supplier> {
    const suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const newSupplier: Supplier = {
      ...data,
      id: 'sup-' + Date.now()
    };
    suppliers.push(newSupplier);
    setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSupplier;
  },

  async updateSupplier(id: string, data: Partial<Supplier>) {
    const suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const index = suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...data };
      setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
  },

  async deleteSupplier(id: string) {
    let suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    suppliers = suppliers.filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  onSuppliersChange(callback: (suppliers: Supplier[]) => void) {
    const check = () => {
      const suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
      callback(suppliers);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  onUsersChange(callback: (users: any[]) => void) {
    const check = () => {
      const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
      callback(users);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  // Campaigns Management
  async createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> {
    const campaigns = getStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const newCampaign: Campaign = {
      ...data,
      id: 'camp-' + Date.now()
    };
    campaigns.push(newCampaign);
    setStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return newCampaign;
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<void> {
    const campaigns = getStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const index = campaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      campaigns[index] = { ...campaigns[index], ...data };
      setStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }
  },

  async deleteCampaign(id: string): Promise<void> {
    let campaigns = getStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    campaigns = campaigns.filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
  },

  onCampaignsChange(callback: (campaigns: Campaign[]) => void) {
    const check = () => {
      const campaigns = getStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
      callback(campaigns);
    };
    window.addEventListener('storage_update', check);
    check();
    return () => window.removeEventListener('storage_update', check);
  },

  async testConnection() {
    console.log('Local storage active');
  }
};
