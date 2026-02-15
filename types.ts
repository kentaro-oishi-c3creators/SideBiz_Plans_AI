
export interface BusinessPlanData {
  ownerName: string;
  date: string;
  motivation: string;
  background: string;
  pastExperience: 'none' | 'ongoing' | 'quit';
  pastExperienceDetail: string;
  qualifications: string;
  intellectualProperty: string;
  
  businessContent: string;
  products: { name: string; share: string }[];
  pricing: {
    unitPrice: string;
    customerPrice: string;
    operatingDays: string;
    holidays: string;
    hours: string;
  };
  salesPoints: string;
  targets: string;
  marketConditions: string;
  
  employees: {
    directors: string;
    staff: string;
    family: string;
    partTime: string;
  };

  partners: {
    sales: Partner[];
    purchases: Partner[];
    outsourcing: Partner[];
  };

  funds: {
    equipment: { item: string; supplier: string; amount: number }[];
    workingCapital: { item: string; amount: number }[];
    fundingSelf: number;
    fundingFamily: number;
    fundingJFC: number;
    fundingOthers: number;
  };

  outlook: {
    initial: OutlookPeriod;
    afterOneYear: OutlookPeriod;
    basis: string;
  };
  
  freeMemo: string;
}

export interface Partner {
  name: string;
  location: string;
  share: string;
  term: string;
  closing: string;
}

export interface OutlookPeriod {
  sales: number;
  costOfSales: number;
  labor: number;
  rent: number;
  interest: number;
  others: number;
}

export const initialData: BusinessPlanData = {
  ownerName: '',
  date: new Date().toISOString().split('T')[0],
  motivation: '',
  background: '',
  pastExperience: 'none',
  pastExperienceDetail: '',
  qualifications: '',
  intellectualProperty: '',
  businessContent: '',
  products: [{ name: '', share: '' }, { name: '', share: '' }, { name: '', share: '' }],
  pricing: {
    unitPrice: '',
    customerPrice: '',
    operatingDays: '',
    holidays: '',
    hours: '',
  },
  salesPoints: '',
  targets: '',
  marketConditions: '',
  employees: { directors: '0', staff: '0', family: '0', partTime: '0' },
  partners: { sales: [], purchases: [], outsourcing: [] },
  funds: {
    equipment: [],
    workingCapital: [],
    fundingSelf: 0,
    fundingFamily: 0,
    fundingJFC: 0,
    fundingOthers: 0,
  },
  outlook: {
    initial: { sales: 0, costOfSales: 0, labor: 0, rent: 0, interest: 0, others: 0 },
    afterOneYear: { sales: 0, costOfSales: 0, labor: 0, rent: 0, interest: 0, others: 0 },
    basis: '',
  },
  freeMemo: '',
};
