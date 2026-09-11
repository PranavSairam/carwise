import type { Brand } from "@/types/car";

/** Major Indian-market brands. Volkswagen is featured and listed early. */
export const brands: Brand[] = [
  { id: "volkswagen", name: "Volkswagen", featured: true },
  { id: "maruti-suzuki", name: "Maruti Suzuki", featured: true },
  { id: "hyundai", name: "Hyundai", featured: true },
  { id: "tata", name: "Tata", featured: true },
  { id: "mahindra", name: "Mahindra", featured: true },
  { id: "toyota", name: "Toyota", featured: true },
  { id: "kia", name: "Kia", featured: true },
  { id: "honda", name: "Honda", featured: false },
  { id: "skoda", name: "Skoda", featured: true },
  { id: "mg", name: "MG", featured: false },
  { id: "renault", name: "Renault", featured: false },
  { id: "nissan", name: "Nissan", featured: false },
  { id: "citroen", name: "Citroen", featured: false },
  { id: "jeep", name: "Jeep", featured: false },
  { id: "byd", name: "BYD", featured: false },
  { id: "bmw", name: "BMW", featured: false },
  { id: "mercedes-benz", name: "Mercedes-Benz", featured: false },
  { id: "audi", name: "Audi", featured: false },
  { id: "volvo", name: "Volvo", featured: false },
  { id: "lexus", name: "Lexus", featured: false },
  { id: "porsche", name: "Porsche", featured: false },
];

export function getBrandById(id: string): Brand | undefined {
  return brands.find((brand) => brand.id === id);
}

export function getFeaturedBrands(): Brand[] {
  return brands.filter((brand) => brand.featured);
}
