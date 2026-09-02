export type UserRole = 'admin' | 'resident'
export type DueStatus = 'pending' | 'paid' | 'overdue' | 'partial'
export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'other'
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type PriorityLevel = 'low' | 'normal' | 'high'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Apartment {
  id: string
  number: string
  floor: number
  block: string | null
  owner_id: string | null
  area_m2: number | null
  notes: string | null
  created_at: string
  updated_at: string
  owner?: Profile | null
}

export interface Due {
  id: string
  apartment_id: string
  amount: number
  due_date: string
  period: string
  status: DueStatus
  description: string | null
  created_at: string
  updated_at: string
  apartment?: Apartment | null
}

export interface Payment {
  id: string
  due_id: string | null
  apartment_id: string
  amount: number
  payment_date: string
  method: PaymentMethod
  notes: string | null
  recorded_by: string | null
  created_at: string
  apartment?: Apartment | null
  due?: Due | null
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  expense_date: string
  description: string | null
  created_by: string | null
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: PriorityLevel
  is_active: boolean
  published_at: string
  created_by: string | null
  created_at: string
}

export interface MaintenanceRequest {
  id: string
  apartment_id: string
  reporter_id: string
  title: string
  description: string
  status: MaintenanceStatus
  priority: PriorityLevel
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  apartment?: Apartment | null
  reporter?: Profile | null
}

export interface DashboardStats {
  totalApartments: number
  collectedDues: number
  pendingDues: number
  totalExpenses: number
  netBalance: number
  openMaintenance: number
}

export interface MonthlyChartPoint {
  month: string
  income: number
  expense: number
}

type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Partial<Profile> & Pick<Profile, 'id' | 'full_name'>,
        Partial<Profile>
      >
      apartments: TableDef<
        Apartment,
        {
          id?: string
          number: string
          floor?: number
          block?: string | null
          owner_id?: string | null
          area_m2?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Apartment, 'owner'>>
      >
      dues: TableDef<
        Due,
        {
          id?: string
          apartment_id: string
          amount: number
          due_date: string
          period: string
          status?: DueStatus
          description?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Due, 'apartment'>>
      >
      payments: TableDef<
        Payment,
        {
          id?: string
          due_id?: string | null
          apartment_id: string
          amount: number
          payment_date?: string
          method?: PaymentMethod
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        },
        Partial<Omit<Payment, 'apartment' | 'due'>>
      >
      expenses: TableDef<
        Expense,
        {
          id?: string
          title: string
          amount: number
          category?: string
          expense_date?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        },
        Partial<Expense>
      >
      announcements: TableDef<
        Announcement,
        {
          id?: string
          title: string
          content: string
          priority?: PriorityLevel
          is_active?: boolean
          published_at?: string
          created_by?: string | null
          created_at?: string
        },
        Partial<Announcement>
      >
      maintenance_requests: TableDef<
        MaintenanceRequest,
        {
          id?: string
          apartment_id: string
          reporter_id: string
          title: string
          description: string
          status?: MaintenanceStatus
          priority?: PriorityLevel
          admin_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<MaintenanceRequest, 'apartment' | 'reporter'>>
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      due_status: DueStatus
      payment_method: PaymentMethod
      maintenance_status: MaintenanceStatus
      priority_level: PriorityLevel
    }
    CompositeTypes: Record<string, never>
  }
}
