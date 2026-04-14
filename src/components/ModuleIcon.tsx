import {
  LayoutGrid, User, Lock, Phone, Building, Bot, BookOpen, Database,
  ShoppingCart, CreditCard, Heart, FileText, ClipboardList, Zap,
  Mail, MessageCircle, MessageSquare, BarChart3, CheckSquare,
  MapPin, Folder, StickyNote, LineChart, Settings, Tag, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Blox: LayoutGrid,
  Person: User,
  Auth: Lock,
  Invitation: Phone,
  Org: Building,
  Agent: Bot,
  Knowledge: BookOpen,
  DataStore: Database,
  Ecommerce: ShoppingCart,
  Payment: CreditCard,
  Donation: Heart,
  Invoicing: FileText,
  Forms: Pencil,
  Automation: Zap,
  Email: Mail,
  WhatsApp: MessageCircle,
  SMS: MessageSquare,
  Pipeline: BarChart3,
  Exams: CheckSquare,
  Checkin: MapPin,
  Files: Folder,
  Notes: StickyNote,
  Analytics: LineChart,
  Utils: Settings,
  Project: ClipboardList,
  Tag: Tag,
};

interface ModuleIconProps {
  name: string;
  className?: string;
}

export function ModuleIcon({ name, className }: ModuleIconProps) {
  const Icon = iconMap[name] || Settings;
  return <Icon className={cn("h-4 w-4", className)} />;
}
