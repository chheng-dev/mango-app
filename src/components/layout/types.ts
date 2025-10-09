export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: readonly string[];
  badge?: string;
}
