import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarDetailClient } from "@/app/cars/[id]/CarDetailClient";
import { getAllCars, getCarById } from "@/lib/cars/repository";

export function generateStaticParams() {
  return getAllCars().map((car) => ({ id: car.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) {
    return { title: "Car not found" };
  }
  return {
    title: `Can I Afford a ${car.brand} ${car.model}?`,
    description: `Affordability analysis for the ${car.brand} ${car.model} ${car.variant} on CarWise.`,
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) {
    notFound();
  }
  return <CarDetailClient car={car} />;
}
