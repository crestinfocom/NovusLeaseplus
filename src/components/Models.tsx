"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { emitPrefill, type CarCalcData } from "@/lib/calc-bus";

type CarModel = {
  name: string;
  img: string;
  badge: string;
  fuel: string;
  seats: number;
  transmission: string;
  rate: string;
  onroad: string;
  calc: CarCalcData;
};

const cars: CarModel[] = [
  {
    name: "Maruti Swift",
    img: "/images/swift.jpg",
    badge: "★ Bestseller",
    fuel: "Petrol",
    seats: 5,
    transmission: "Automatic",
    rate: "₹60/hr",
    onroad: "On-road ₹8.00 L",
    calc: {
      name: "Maruti Swift",
      price: "800000",
      leasepct: "1.95",
      tenure: "3",
      residual: "45",
      depr: "15",
      insurance: "18000",
      maint: "2000",
      fuel: "6000",
    },
  },
  {
    name: "Hyundai Creta",
    img: "/images/creta.jpg",
    badge: "Popular SUV",
    fuel: "Petrol",
    seats: 5,
    transmission: "Automatic",
    rate: "₹95/hr",
    onroad: "On-road ₹15.00 L",
    calc: {
      name: "Hyundai Creta",
      price: "1500000",
      leasepct: "1.67",
      tenure: "3",
      residual: "50",
      depr: "14",
      insurance: "28000",
      maint: "3000",
      fuel: "8000",
    },
  },
  {
    name: "Executive Sedan",
    img: "/images/sedan.jpg",
    badge: "Luxury",
    fuel: "Diesel",
    seats: 5,
    transmission: "Automatic",
    rate: "₹140/hr",
    onroad: "On-road ₹45.00 L",
    calc: {
      name: "Executive Sedan",
      price: "4500000",
      leasepct: "1.40",
      tenure: "4",
      residual: "55",
      depr: "18",
      insurance: "70000",
      maint: "9000",
      fuel: "12000",
    },
  },
  {
    name: "Toyota Innova Crysta",
    img: "/images/innova.jpg",
    badge: "7 Seater",
    fuel: "Diesel",
    seats: 7,
    transmission: "Manual",
    rate: "₹120/hr",
    onroad: "On-road ₹22.00 L",
    calc: {
      name: "Toyota Innova Crysta",
      price: "2200000",
      leasepct: "1.55",
      tenure: "4",
      residual: "52",
      depr: "13",
      insurance: "38000",
      maint: "4500",
      fuel: "11000",
    },
  },
];

export default function Models() {
  return (
    <section className="sec" id="models">
      <div className="wrap">
        <div className="sec-flex">
          <Reveal className="sec-head">
            <span className="eyebrow">Most loved</span>
            <h2>Best-selling models</h2>
            <p>The cars our drivers reserve again and again.</p>
          </Reveal>
          <Reveal delay="d1">
            <a className="btn btn-ghost" href="#">
              View all cars →
            </a>
          </Reveal>
        </div>
        <Reveal className="rail">
          {cars.map((car) => (
            <div className="model" key={car.name} data-name={car.name}>
              <div className="pic">
                <span className="badge">{car.badge}</span>
                <span className="fuel">{car.fuel}</span>
                <Image
                  src={car.img}
                  alt={car.name}
                  fill
                  sizes="320px"
                  priority={false}
                />
              </div>
              <div className="mbody">
                <h4>{car.name}</h4>
                <div className="seat">
                  <span>👥 {car.seats} Seater</span>
                  <span>⚙️ {car.transmission}</span>
                </div>
                <div className="mrate">
                  <div className="rate">
                    {car.rate} <small>onwards</small>
                  </div>
                  <span className="onroad">{car.onroad}</span>
                </div>
                <button
                  className="lease-btn"
                  type="button"
                  onClick={() => emitPrefill(car.calc)}
                >
                  🧮 Lease this car →
                </button>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}