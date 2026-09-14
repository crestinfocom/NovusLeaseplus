"use client";

import { useState } from "react";
import Reveal from "./Reveal";

export default function BookingWidget() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  return (
    <section className="book-shell" id="book">
      <div className="wrap">
        <Reveal className="booking">
          <div className="book-toggle">
            <button
              className={mode === "daily" ? "active" : ""}
              data-mode="daily"
              onClick={() => setMode("daily")}
            >
              🗓️ Daily Rentals
            </button>
            <button
              className={mode === "monthly" ? "active" : ""}
              data-mode="monthly"
              onClick={() => setMode("monthly")}
            >
              ♾️ Monthly Subscription
            </button>
          </div>
          <div className="book-fields">
            <div className="field">
              <label>📍 Location</label>
              <select aria-label="City">
                <option>Select your city</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
                <option>Hyderabad</option>
                <option>Chennai</option>
                <option>Pune</option>
                <option>Kochi</option>
                <option>Ahmedabad</option>
              </select>
            </div>
            <div className="field">
              <label>Pick-up</label>
              <input type="datetime-local" defaultValue="2026-09-13T09:30" />
            </div>
            <div className="field">
              <label>{mode === "monthly" ? "Subscription months" : "Return"}</label>
              {mode === "monthly" ? (
                <select aria-label="Subscription duration">
                  <option>1 month</option>
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>12 months</option>
                </select>
              ) : (
                <input type="datetime-local" defaultValue="2026-09-16T18:30" />
              )}
            </div>
            <div className="book-go">
              <a className="btn btn-gold" href="#models">
                Search cars
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}