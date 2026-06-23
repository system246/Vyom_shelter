import {
  Bath, ChefHat, Car, ArrowUpDown, Zap, Droplets, ShieldCheck, Camera, Trees,
  Dumbbell, Waves, PartyPopper, Baby, Flame, Wifi, Sofa, PanelTop, Accessibility,
  TrainFront, Bus, TrainTrack, Plane, GraduationCap, Stethoscope, ShoppingBag,
  ShoppingCart, Route, Landmark, Church, HelpCircle,
} from 'lucide-react';

const ICONS = {
  Bath, ChefHat, Car, ArrowUpDown, Zap, Droplets, ShieldCheck, Camera, Trees,
  Dumbbell, Waves, PartyPopper, Baby, Flame, Wifi, Sofa, PanelTop, Accessibility,
  TrainFront, Bus, TrainTrack, Plane, GraduationCap, Stethoscope, ShoppingBag,
  ShoppingCart, Route, Landmark, Church,
};

export default function DynamicIcon({ name, size = 16, className = '' }) {
  const Icon = ICONS[name] || HelpCircle;
  return <Icon size={size} className={className} />;
}
