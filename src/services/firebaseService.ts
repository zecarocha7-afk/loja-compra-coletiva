import { Product, MilitaryProfile, PurchaseIntent, Supplier } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, SUPPLIERS as INITIAL_SUPPLIERS } from '../constants';

const STORAGE_KEYS = {
  PRODUCTS: 'pmmg_products',
  INTENTS: 'pmmg_intents',
  USERS: 'pmmg_users',
  USER: 'pmmg_user',
  PROFILE: 'pmmg_profile',
  SUPPLIERS: 'pmmg_suppliers'
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

export const firebaseService = {
  // Auth & Profile
  async register(email: string, password: string, profile: Omit<MilitaryProfile, 'createdAt' | 'updatedAt'>) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const uid = 'user-' + Date.now();
    const newUser = { uid, email };
    
    users.push({ ...newUser, profile: { ...profile, createdAt: Date.now() } });
    setStorage(STORAGE_KEYS.USERS, users);
    
    setStorage(STORAGE_KEYS.USER, newUser);
    setStorage(STORAGE_KEYS.PROFILE, { ...profile, createdAt: Date.now() });
    return uid;
  },

  async login(email: string, password: string) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const userInStorage = users.find(u => u.email === email);

    if (userInStorage) {
      setStorage(STORAGE_KEYS.USER, { uid: userInStorage.uid, email: userInStorage.email });
      setStorage(STORAGE_KEYS.PROFILE, userInStorage.profile);
      return { user: userInStorage };
    }

    if (email === 'admin@pmmg.gov.br') {
        const user = { uid: 'admin-01', email };
        const profile: MilitaryProfile = { 
          ...MOCK_PROFILE, 
          fullName: 'Administrador 01', 
          role: 'administrador',
          email: 'admin@pmmg.gov.br'
        };
        setStorage(STORAGE_KEYS.USER, user);
        setStorage(STORAGE_KEYS.PROFILE, profile);
        return { user };
    }
    setStorage(STORAGE_KEYS.USER, MOCK_USER);
    setStorage(STORAGE_KEYS.PROFILE, MOCK_PROFILE);
    return { user: MOCK_USER };
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    window.dispatchEvent(new Event('storage_update'));
  },

  async resetPassword(email: string) {
    console.log('Resetting password for:', email);
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

  async testConnection() {
    console.log('Local storage active');
  }
};
