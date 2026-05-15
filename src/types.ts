export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  minBatch: number;
  currentInterests: number;
  colors?: string[];
  sizes?: string[];
  status?: 'ativo' | 'inativo' | string;
  highlight?: boolean;
  unit?: string;
  campaignId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  banner: string;
  deadline: string;
  description: string;
  status: 'Ativa' | 'Encerrada' | 'Em Breve';
}

export interface Supplier {
  id: string;
  name: string;
  document: string; // CNPJ ou CPF
  phone: string;
  email: string;
  cityState: string;
  description: string;
  logo: string;
  rating?: number; // kept for compatibility if needed
  catalogUrl: string;
  status: 'ativo' | 'inativo';
}

export interface PurchaseIntent {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  supplierId: string;
  fullName: string;
  pmNumber: string;
  unit: string;
  city: string;
  phone: string;
  email: string;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
  protocol: string;
  status: 'Registrado' | 'Validado' | 'Consolidado' | 'Em Fabricação' | 'Entregue';
  createdAt: any;
}

export type UserRole = 'militar' | 'administrador' | 'fornecedor';

export interface MilitaryProfile {
  fullName: string;
  pmNumber: string;
  unit: string;
  city: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

export interface User {
  uid: string;
  email: string | null;
  profile?: MilitaryProfile;
}
