import type { Car } from "@/types/car";

/**
 * Photorealistic model photos under /public/cars/photos.
 * Generated brochure-style renders for priority models; stock photos for the rest.
 * Not live dealer images — illustrative for educational use.
 */
const MODEL_IMAGES: Record<string, string> = {
  Virtus: "/cars/photos/virtus.jpg",
  Taigun: "/cars/photos/taigun.jpg",
  Tiguan: "/cars/photos/tiguan.jpg",
  Tayron: "/cars/photos/tayron.jpg",
  Golf: "/cars/photos/golf.jpg",
  "Golf GTI": "/cars/photos/golf.jpg",
  Swift: "/cars/photos/swift.jpg",
  Baleno: "/cars/photos/baleno.jpg",
  Brezza: "/cars/photos/brezza.jpg",
  "Grand Vitara": "/cars/photos/grand-vitara.jpg",
  i20: "/cars/photos/i20.jpg",
  Creta: "/cars/photos/creta.jpg",
  Venue: "/cars/photos/venue.jpg",
  Verna: "/cars/photos/verna.jpg",
  Nexon: "/cars/photos/nexon.jpg",
  "Nexon EV": "/cars/photos/nexon-ev.jpg",
  Punch: "/cars/photos/punch.jpg",
  Curvv: "/cars/photos/curvv.jpg",
  Harrier: "/cars/photos/harrier.jpg",
  XUV700: "/cars/photos/xuv700.jpg",
  "Scorpio-N": "/cars/photos/scorpio-n.jpg",
  Thar: "/cars/photos/thar.jpg",
  "Innova HyCross": "/cars/photos/innova-hycross.jpg",
  Hyryder: "/cars/photos/hyryder.jpg",
  Fortuner: "/cars/photos/fortuner.jpg",
  Seltos: "/cars/photos/seltos.jpg",
  Sonet: "/cars/photos/sonet.jpg",
  Carens: "/cars/photos/carens.jpg",
  City: "/cars/photos/city.jpg",
  Elevate: "/cars/photos/elevate.jpg",
  Kushaq: "/cars/photos/kushaq.jpg",
  Slavia: "/cars/photos/slavia.jpg",
  Hector: "/cars/photos/hector.jpg",
  Astor: "/cars/photos/astor.jpg",
  "Windsor EV": "/cars/photos/windsor-ev.jpg",
  Kiger: "/cars/photos/kiger.jpg",
  Magnite: "/cars/photos/magnite.jpg",
  Basalt: "/cars/photos/basalt.jpg",
  Compass: "/cars/photos/compass.jpg",
  "3 Series": "/cars/photos/3-series.jpg",
  "C-Class": "/cars/photos/c-class.jpg",
  A4: "/cars/photos/a4.jpg",
  XC40: "/cars/photos/xc40.jpg",
  ES: "/cars/photos/es.jpg",
  Seal: "/cars/photos/seal.jpg",
  Macan: "/cars/photos/macan.jpg",
};

export function resolveCarImage(
  car: Pick<Car, "model" | "image" | "fuel">,
): string {
  if (car.model === "Nexon" && car.fuel === "EV") {
    return MODEL_IMAGES["Nexon EV"] ?? "/cars/photos/nexon-ev.jpg";
  }
  return (
    MODEL_IMAGES[car.model] ??
    (car.image.endsWith(".jpg") ? car.image : undefined) ??
    "/cars/photos/virtus.jpg"
  );
}

export function isVirtus(car: Pick<Car, "brandId" | "model">): boolean {
  return car.brandId === "volkswagen" && car.model === "Virtus";
}
