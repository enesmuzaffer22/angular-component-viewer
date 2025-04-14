export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  layoutComponents: {
    navbar: string;
    footer: string;
  };
}
