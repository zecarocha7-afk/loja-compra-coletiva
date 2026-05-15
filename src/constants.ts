import { Supplier, Product, Campaign } from './types';

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'fardamento-2026',
    name: 'Campanha Fardamento 2026',
    description: 'Renovação do enxoval operacional padrão PMMG. Fechamento de lote coletivo para melhores condições de fábrica.',
    banner: 'https://images.unsplash.com/photo-1590736704028-743093888a1e?q=80&w=1200',
    deadline: '30/06/2026',
    status: 'Ativa'
  },
  {
    id: 'equipamento-tatico',
    name: 'Operações Especiais',
    description: 'Equipamentos de alta performance para unidades especializadas. Tecnologia de ponta com custo reduzido por volume.',
    banner: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=1200',
    deadline: '15/07/2026',
    status: 'Ativa'
  }
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'invictus',
    name: 'INVICTUS',
    document: '00.000.000/0001-00',
    phone: '(11) 99999-9999',
    email: 'contato@invictus.com.br',
    cityState: 'São Paulo/SP',
    status: 'ativo',
    description: 'Equipamentos de alta performance desenvolvidos para missões críticas. Resistência extrema, ergonomia operacional e tecnologia têxtil de ponta.',
    logo: 'https://cdn.invictus.com.br/logos/logo-invictus-black.png',
    rating: 4.9,
    catalogUrl: 'https://invictus.com.br/catalogos'
  },
  {
    id: 'donmilitar',
    name: 'DON MILITAR',
    document: '11.111.111/0001-11',
    phone: '(31) 98888-8888',
    email: 'vendas@donmilitar.com.br',
    cityState: 'Belo Horizonte/MG',
    status: 'ativo',
    description: 'Equipamentos táticos de alta performance e durabilidade industrial. Fornecedor homologado para operações especiais e policiamento tático.',
    logo: 'https://donmilitar.com.br/wp-content/uploads/2021/04/Logo-Don-Militar-Preto-1.png',
    rating: 4.7,
    catalogUrl: 'https://donmilitar.com.br/loja'
  },
  {
    id: 'citerol',
    name: 'CITEROL',
    document: '22.222.222/0001-22',
    phone: '(31) 97777-7777',
    email: 'comercial@citerol.com.br',
    cityState: 'Contagem/MG',
    status: 'ativo',
    description: 'Especialista em uniformes e fardamentos técnicos. Tradição em qualidade e durabilidade para as forças de segurança.',
    logo: 'https://citerol.com.br/wp-content/uploads/2022/01/logo-citerol-preto.png',
    rating: 4.8,
    catalogUrl: 'https://citerol.com.br/produtos'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'bone-pmmg',
    supplierId: 'Fardamento Oficial',
    name: 'Boné PMMG',
    category: 'Fardamento / Acessórios',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800',
    description: 'Boné padrão PMMG com bordado de alta definição e ajuste personalizado.',
    price: 45.00,
    minBatch: 50,
    currentInterests: 42,
    status: 'NOVO PADRÃO',
    campaignId: 'fardamento-2026'
  },
  {
    id: 'protetor-bucal',
    supplierId: 'Tactical Gear',
    name: 'Protetor Bucal',
    category: 'Equipamento / Treinamento',
    image: 'https://images.unsplash.com/photo-1512401311549-0524ce858971?q=80&w=800',
    description: 'Protetor bucal moldável de alta resistência para treinamento tático.',
    price: 25.00,
    minBatch: 30,
    currentInterests: 12,
    status: 'ALTA DEMANDA',
    campaignId: 'equipamento-tatico'
  },
  {
    id: 'nome-farda-emborrachado',
    supplierId: 'Bordados Militares',
    name: 'Nome de Farda Emborrachado',
    category: 'Identificação',
    image: 'https://images.unsplash.com/photo-1590736704028-743093888a1e?q=80&w=800',
    description: 'Tarja de identificação em borracha de alta durabilidade com velcro.',
    price: 15.00,
    minBatch: 100,
    currentInterests: 85,
    status: 'ESSENCIAL',
    campaignId: 'fardamento-2026'
  },
  {
    id: 'cinto-pmmg',
    supplierId: 'Citerol',
    name: 'Cinto PMMG',
    category: 'Acessórios / Guarnição',
    image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=800',
    description: 'Cinto de nylon reforçado com fivela padrão oficial PMMG.',
    price: 49.90,
    minBatch: 50,
    currentInterests: 55,
    status: 'PADRONIZADO',
    campaignId: 'fardamento-2026'
  },
  {
    id: 'kit-visibilidade-pmmg',
    supplierId: 'Don Militar',
    name: 'Kit Visibilidade PMMG',
    category: 'Equipamento / Trânsito',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
    description: 'Colete e braçadeiras de alta visibilidade com refletores homologados.',
    price: 89.90,
    minBatch: 20,
    currentInterests: 18,
    status: 'SEGURANÇA',
    campaignId: 'equipamento-tatico'
  },
  {
    id: 'patch-pmmg-emborrachado',
    supplierId: 'Bordados Militares',
    name: 'Patch PMMG Emborrachado',
    category: 'Identificação / Insígnia',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
    description: 'Brasão PMMG em borracha com alto relevo e fixação por velcro.',
    price: 12.50,
    minBatch: 100,
    currentInterests: 120,
    status: 'OFICIAL',
    campaignId: 'fardamento-2026'
  },
  {
    id: 'camiseta-cinza-pmmg',
    supplierId: 'Citerol',
    name: 'Camiseta Cinza PMMG',
    category: 'Fardamento / Malharia',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
    description: 'Camiseta cinza padrão PMMG em tecido Dry-Fit de alta absorção.',
    price: 39.90,
    minBatch: 200,
    currentInterests: 145,
    status: 'NOVIDADE',
    campaignId: 'fardamento-2026'
  }
];

export const MENU_ITEMS = [
  { id: 'products', label: 'Produtos', icon: 'Package' },
  { id: 'suppliers', label: 'Fornecedores', icon: 'Factory' },
  { id: 'collective-list', label: 'Lista de Compra Coletiva', icon: 'ListChecks' },
  { id: 'admin', label: 'Relatórios/Admin', icon: 'ShieldAlert' }
];
