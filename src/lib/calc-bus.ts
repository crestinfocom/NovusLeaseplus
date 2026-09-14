export type CarCalcData = {
  name: string;
  price: string;
  leasepct: string;
  tenure: string;
  residual: string;
  depr: string;
  insurance: string;
  maint: string;
  fuel: string;
};

const EVENT = "novus:prefill-calc";

export function emitPrefill(data: CarCalcData) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: data }));
}

export function onPrefill(handler: (data: CarCalcData) => void) {
  const listener = (e: Event) => {
    handler((e as CustomEvent<CarCalcData>).detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}